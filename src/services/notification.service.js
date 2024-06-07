import { io } from '../index.js';
import Notification from '../models/notification.models.js';

export const createNotification = async (surveyId, surveyName) => {
  try {
    const notification = new Notification({
      type: 'Neue Antwort',
      message: `Wurde zur Umfrage ${surveyName} hinzugefügt.`,
      surveyId: surveyId,
    });

    await notification.save();
    console.log('Benachrichtigung erfolgreich erstellt.');

    io.emit('notification', {
      ...notification.toObject(),
      surveyName,
    });
  } catch (error) {
    console.error('Fehler beim Erstellen der Benachrichtigung:', error);
  }
};

export const getNotifications = async (skip, limit) => {
  try {
    return await Notification.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
  } catch (error) {
    console.error('Fehler beim Abrufen der Benachrichtigungen:', error);
  }
};
