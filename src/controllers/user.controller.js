import User from '../models/user.models.js';
import { getUser, getUsers } from '../services/user.service.js';

export const get = async (req, res, next) => {
  // #swagger.tags = ['User']
  try {
    const user = await getUser(req.params.id);
    if (!user) {
      return res.status(404).send({ message: 'Benutzer nicht gefunden.' });
    }
    res.status(200).send(user);
  } catch (err) {
    console.error(err);
    res.status(500).send({
      message:
        'Ein Fehler ist aufgetreten beim Versuch, der Benutzer abzurufen.',
    });
    next(err);
  }
};

export const list = async (req, res) => {
  // #swagger.tags = ['User']
  const page = parseInt(req.query.page) || 1;
  const maxLimit = 100;
  const limit = Math.min(parseInt(req.query.limit) || 10, maxLimit);
  const skip = (page - 1) * limit;

  try {
    const users = await getUsers(skip, limit);
    const total = await User.countDocuments();
    const totalPages = Math.ceil(total / limit);

    res.status(200).send({
      data: users,
      page,
      limit,
      total,
      totalPages,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send({
      message:
        'Ein Fehler ist aufgetreten beim Versuch, die Benutzer abzurufen.',
    });
  }
};
