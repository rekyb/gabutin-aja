import dns from 'node:dns'
import mongoose from 'mongoose'

dns.setServers(['1.1.1.1', '8.8.8.8', '1.0.0.1'])

const MONGODB_URI = process.env.MONGODB_URI!

if (!MONGODB_URI) {
  throw new Error('MONGODB_URI environment variable is not defined')
}

interface MongooseCache {
  conn: typeof mongoose | null
  promise: Promise<typeof mongoose> | null
}

declare global {
  // eslint-disable-next-line no-var
  var mongoose: MongooseCache | undefined
}

const cached: MongooseCache = globalThis.mongoose ?? { conn: null, promise: null }
globalThis.mongoose = cached

export async function connectDB(): Promise<typeof mongoose> {
  if (cached.conn) return cached.conn

  cached.promise ??= mongoose.connect(MONGODB_URI).then((m) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('MongoDB connected')
    }
    return m
  })

  cached.conn = await cached.promise
  return cached.conn
}
