import cors from 'cors';
import 'dotenv/config';
import express from 'express';
import { Server } from 'socket.io';
import swaggerUi from 'swagger-ui-express';
import Notification from './models/notification.models.js';
import notificationRouter from './routes/notification.routes.js';
import surveyRouter from './routes/survey.routes.js';
import { verifySocketJwt } from './utils/checkJwt.js';
import connectDb from './utils/connectDb.js';
import swaggerFile from './utils/swagger-output.json' assert { type: 'json' };

connectDb();

const app = express();
const port = process.env.PORT || 3000;
const corsOrigin = process.env.CORS_ORIGIN;

const corsOptions = {
  origin: corsOrigin,
  optionsSuccessStatus: 200,
  allowedHeaders: ['Authorization', 'Content-Type'],
};

app.use(cors(corsOptions));
app.use(express.json());

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerFile));
app.use('/surveys', surveyRouter);
app.use('/notifications', notificationRouter);

const server = app.listen(port, () => {
  console.log(`App started under port ${port}`);
});

const io = new Server(server, {
  cors: {
    origin: corsOrigin,
    allowedHeaders: ['Authorization'],
  },
});

io.use(verifySocketJwt);

io.on('connection', async (socket) => {
  console.log('A user connected', socket.user);

  try {
    const notifications = await Notification.find()
      .sort({ createdAt: -1 })
      .limit(10);
    socket.emit('initialNotifications', notifications);
  } catch (error) {
    console.error('Error fetching initial notifications:', error);
  }

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

export const sendNotification = (notification) => {
  io.emit('notification', notification);
};

export { io };
