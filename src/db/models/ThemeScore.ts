import mongoose, { Document, Schema } from 'mongoose'

export interface IThemeScore extends Document {
  userId: mongoose.Types.ObjectId
  theme: string
  points: number
  seenCardIds: mongoose.Types.ObjectId[]
}

const ThemeScoreSchema = new Schema<IThemeScore>({
  userId:      { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  theme:       { type: String, required: true },
  points:      { type: Number, default: 0 },
  seenCardIds: { type: [Schema.Types.ObjectId], default: [] },
})
ThemeScoreSchema.index({ userId: 1, theme: 1 }, { unique: true })

export const ThemeScore = mongoose.models.ThemeScore ?? mongoose.model<IThemeScore>('ThemeScore', ThemeScoreSchema)
