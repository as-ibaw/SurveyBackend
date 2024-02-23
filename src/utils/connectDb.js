import mongoose from 'mongoose';

export default function connect() {
  try {
    return mongoose.connect(process.env.MONGO_URL);
  } catch (e) {
    console.error(e);
  }
}
