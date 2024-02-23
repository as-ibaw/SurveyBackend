import Notification from '../models/notification.models.js';

export const createNotification = async (surveyId) => {
  try {
    const notification = new Notification({
      type: 'Neue Antwort',
      message: 'Eine neue Antwort wurde zur Umfrage hinzugefügt.',
      surveyId: surveyId,
    });

    await notification.save();
    console.log('Benachrichtigung erfolgreich erstellt.');
  } catch (error) {
    console.error('Fehler beim Erstellen der Benachrichtigung:', error);
  }
};

export const readNotification = async (notificationId) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      notificationId,
      {
        $set: { isRead: true },
      },
      { new: true }
    );

    if (!notification) {
      console.log('Benachrichtigung nicht gefunden');
    }

    return notification;
  } catch (error) {
    console.error(
      'Fehler beim Markieren der Benachrichtigung als gelesen:',
      error
    );
  }
};

export const getNotifications = async (skip, limit) => {
  try {
    return await Notification.find().skip(skip).limit(limit);
  } catch (error) {
    console.error('Fehler beim Abrufen der Benachrichtigungen:', error);
  }
};
