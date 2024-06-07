import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  questionText: { type: String, required: true },
  type: {
    type: String,
    required: true,
    enum: [
      'textInput',
      'numberInput',
      'checkbox',
      'toggle',
      'multipleChoice',
      'radio',
      'stars',
    ],
  },
  options: [{ type: String }],
  order: { type: Number, required: true },
  required: { type: Boolean, default: false },
});

const surveySchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  questions: [questionSchema],
  createdBy: {
    azureID: { type: String, required: true },
    name: { type: String, required: true },
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  expirationDate: { type: Date, required: true },
  status: {
    type: String,
    enum: ['Offen', 'Aktiv', 'Abgeschlossen'],
    default: 'Offen',
  },
  viewsCount: { type: Number, default: 0 },
});

export default mongoose.model('Survey', surveySchema);
