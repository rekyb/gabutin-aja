import mongoose, { Document, Schema } from 'mongoose'

export interface IUser extends Document {
  uniqueUserId: string
  displayName: string
  avatar?: string
  email?: string
  googleId?: string
  themes: string[]
  xp: number
  level: number
  currentStreak: number
  consecutiveWrongs: number
  totalAnswers: number
  totalSkips: number
  createdAt: Date
}

const UserSchema = new Schema<IUser>({
  uniqueUserId:     { type: String, required: true, unique: true, index: true },
  displayName:      { type: String, required: true },
  avatar:           { type: String },
  email:            { type: String, unique: true, sparse: true, index: true },
  googleId:         { type: String, unique: true, sparse: true, index: true },
  themes:           { type: [String], required: true },
  xp:               { type: Number, default: 0 },
  level:            { type: Number, default: 1 },
  currentStreak:    { type: Number, default: 0 },
  consecutiveWrongs:{ type: Number, default: 0 },
  totalAnswers:     { type: Number, default: 0 },
  totalSkips:       { type: Number, default: 0 },
}, { timestamps: true })

export const User = mongoose.models.User ?? mongoose.model<IUser>('User', UserSchema)
