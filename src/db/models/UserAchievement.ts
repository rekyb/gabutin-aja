import mongoose, { Document, Schema } from 'mongoose'

export interface IUserAchievement extends Document {
  userId: mongoose.Types.ObjectId
  achievementKey: string
  earnedAt: Date
  isShowcased: boolean
  showcasePosition: 1 | 2 | 3 | null
}

const UserAchievementSchema = new Schema<IUserAchievement>({
  userId:           { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  achievementKey:   { type: String, required: true },
  earnedAt:         { type: Date, default: Date.now },
  isShowcased:      { type: Boolean, default: false },
  showcasePosition: { type: Number, enum: [1, 2, 3, null], default: null },
})
UserAchievementSchema.index({ userId: 1, achievementKey: 1 }, { unique: true })

export const UserAchievement = mongoose.models.UserAchievement ?? mongoose.model<IUserAchievement>('UserAchievement', UserAchievementSchema)
