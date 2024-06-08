import jwt from 'jsonwebtoken';
import jwksRsa from 'jwks-rsa';

const jwksClient = jwksRsa({
  jwksUri: `https://login.microsoftonline.com/${process.env.PORT}/discovery/v2.0/keys`,
  cache: true,
  rateLimit: true,
});

const getKey = (header, callback) => {
  jwksClient.getSigningKey(header.kid, (err, key) => {
    if (err) {
      console.error('Error getting signing key:', err);
      callback(err);
      return;
    }
    const signingKey = key.publicKey || key.rsaPublicKey;
    callback(null, signingKey);
  });
};

const checkJwt = (req, res, next) => {
  const token =
    req.headers.authorization && req.headers.authorization.split(' ')[1];

  if (!token) {
    return res.status(401).send('Access Token ist erforderlich');
  }

  jwt.verify(
    token,
    getKey,
    {
      audience: process.env.AUDIENCE,
      issuer: process.env.ISSUER,
    },
    (err, decoded) => {
      if (err) {
        console.error('JWT verification error:', err);
        return res.status(401).send('Token ungültig');
      }
      req.user = decoded;
      next();
    }
  );
};

const verifySocketJwt = (socket, next) => {
  const token = socket.handshake.headers.authorization?.split(' ')[1];
  if (token) {
    jwt.verify(
      token,
      getKey,
      {
        audience: process.env.AUDIENCE,
        issuer: process.env.ISSUER,
      },
      (err, decoded) => {
        if (err) {
          console.error('JWT verification error:', err);
          return next(new Error('Authentication error'));
        }
        socket.user = decoded;
        next();
      }
    );
  } else {
    next(new Error('Authentication error'));
  }
};

export { checkJwt, getKey, verifySocketJwt };
