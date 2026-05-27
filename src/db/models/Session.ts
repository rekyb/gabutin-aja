import mongoose, { Document, Schema } from 'mongoose'

export interface ISession extends Document {
  userId: mongoose.Types.ObjectId
  sessionToken: string
  expiresAt: Date
  createdAt: Date
  updatedAt: Date
}

const SessionSchema = new Schema<ISession>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    sessionToken: { type: String, required: true, unique: true, index: true },
    expiresAt: { type: Date, required: true, expires: 0 }, // Automagically deletes expired sessions via TTL index
  },
  { timestamps: true }
)

export const Session = mongoose.models.Session ?? mongoose.model<ISession>('Session', SessionSchema)
