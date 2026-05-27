import mongoose, { Document, Schema } from 'mongoose'

export interface IAnswer extends Document {
  userId: mongoose.Types.ObjectId
  cardId: mongoose.Types.ObjectId
  theme: string
  result: 'correct' | 'wrong' | 'skip'
  pointsDelta: number
  xpDelta: number
  answeredAt: Date
}

const AnswerSchema = new Schema<IAnswer>({
  userId:      { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  cardId:      { type: Schema.Types.ObjectId, ref: 'Card', required: true },
  theme:       { type: String, required: true },
  result:      { type: String, enum: ['correct', 'wrong', 'skip'], required: true },
  pointsDelta: { type: Number, required: true },
  xpDelta:     { type: Number, required: true },
  answeredAt:  { type: Date, default: Date.now },
})

export const Answer = mongoose.models.Answer ?? mongoose.model<IAnswer>('Answer', AnswerSchema)
