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
      'selection',
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
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  viewsCount: { type: Number, default: 0 },
  active: { type: Boolean, default: true },
});

export default mongoose.model('Survey', surveySchema);
