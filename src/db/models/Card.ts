import mongoose, { Document, Schema } from 'mongoose'

export interface ICard extends Document {
  theme: string
  fact: string
  sourceUrl: string
  question: string
  options: string[]
  correctIndex: number
  explanation: string
  status: 'approved' | 'pending'
  generatedBy: 'ai' | 'user'
  createdAt: Date
}

const CardSchema = new Schema<ICard>({
  theme:        { type: String, required: true, index: true },
  fact:         { type: String, required: true },
  sourceUrl:    { type: String, required: true },
  question:     { type: String, required: true },
  options:      { type: [String], required: true },
  correctIndex: { type: Number, required: true },
  explanation:  { type: String, required: true },
  status:       { type: String, enum: ['approved', 'pending'], default: 'approved' },
  generatedBy:  { type: String, enum: ['ai', 'user'], default: 'ai' },
}, { timestamps: true })

export const Card = mongoose.models.Card ?? mongoose.model<ICard>('Card', CardSchema)
