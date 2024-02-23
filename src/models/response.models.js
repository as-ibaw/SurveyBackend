import mongoose from 'mongoose';

const responseSchema = new mongoose.Schema({
  surveyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Survey',
    required: true,
  },
  responses: [
    {
      questionId: { type: mongoose.Schema.Types.ObjectId, required: true },
      answer: { type: mongoose.Schema.Types.Mixed },
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Response', responseSchema);
