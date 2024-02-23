import User from '../models/user.models.js';

export const getUser = async (id) => {
  try {
    return User.findById(id);
  } catch (error) {
    console.error('Fehler beim Abrufen der Benutzer:', error);
  }
};

export const getUsers = async (skip, limit) => {
  try {
    return await User.find().skip(skip).limit(limit);
  } catch (error) {
    console.error('Fehler beim Abrufen der Benutzer:', error);
  }
};
