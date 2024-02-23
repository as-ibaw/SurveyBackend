import Notification from '../models/notification.models.js';
import {
  getNotifications,
  readNotification,
} from '../services/notification.service.js';

export const list = async (req, res) => {
  // #swagger.tags = ['Notification']
  const page = parseInt(req.query.page) || 1;
  const maxLimit = 100;
  const limit = Math.min(parseInt(req.query.limit) || 10, maxLimit);
  const skip = (page - 1) * limit;

  try {
    const notifications = await getNotifications(skip, limit);
    const total = await Notification.countDocuments();
    const totalPages = Math.ceil(total / limit);

    res.status(200).send({
      data: notifications,
      page,
      limit,
      total,
      totalPages,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send({
      message:
        'Ein Fehler ist aufgetreten beim Versuch, die Benachrichtigungen abzurufen.',
    });
  }
};

export const setRead = async (req, res, next) => {
  // #swagger.tags = ['Notification']
  try {
    const { id } = req.params;
    const updatedNotification = await readNotification(id);
    if (!updatedNotification) {
      return res
        .status(404)
        .send({ message: 'Benachrichtigung nicht gefunden.' });
    }

    res.status(200).send(updatedNotification);
  } catch (err) {
    return res.status(500).send({
      message:
        'Ein Fehler ist beim Markieren als Gelesen der Benachrichtigung aufgetreten',
    });
    next(err);
  }
};
