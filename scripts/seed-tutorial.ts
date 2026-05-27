// Run once: pnpm tsx scripts/seed-tutorial.ts
import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI
if (!MONGODB_URI) throw new Error('MONGODB_URI is not set')

const CardSchema = new mongoose.Schema({
  theme: String,
  fact: String,
  sourceUrl: String,
  question: String,
  options: [String],
  correctIndex: Number,
  explanation: String,
  status: { type: String, default: 'approved' },
  generatedBy: { type: String, default: 'ai' },
}, { timestamps: true })

const Card = mongoose.models.Card ?? mongoose.model('Card', CardSchema)

const tutorialCards = [
  {
    theme: 'tutorial',
    fact: 'Indonesia adalah negara kepulauan terbesar di dunia dengan lebih dari 17.000 pulau yang membentang sepanjang 5.000 km dari barat ke timur.',
    sourceUrl: 'https://id.wikipedia.org/wiki/Indonesia',
    question: 'Berapa perkiraan jumlah pulau di Indonesia?',
    options: ['Lebih dari 5.000', 'Lebih dari 10.000', 'Lebih dari 17.000', 'Lebih dari 25.000'],
    correctIndex: 2,
    explanation: 'Indonesia memiliki lebih dari 17.000 pulau, menjadikannya negara kepulauan terbesar di dunia.',
    status: 'approved',
    generatedBy: 'ai',
  },
  {
    theme: 'tutorial',
    fact: 'Borobudur adalah candi Buddha terbesar di dunia yang dibangun pada abad ke-9 oleh Dinasti Syailendra di Jawa Tengah.',
    sourceUrl: 'https://id.wikipedia.org/wiki/Borobudur',
    question: 'Borobudur dibangun oleh dinasti apa?',
    options: ['Mataram', 'Majapahit', 'Syailendra', 'Sriwijaya'],
    correctIndex: 2,
    explanation: 'Borobudur dibangun oleh Dinasti Syailendra sekitar tahun 800 Masehi.',
    status: 'approved',
    generatedBy: 'ai',
  },
  {
    theme: 'tutorial',
    fact: 'Bahasa Indonesia ditetapkan sebagai bahasa persatuan saat Sumpah Pemuda pada 28 Oktober 1928 — bukan saat kemerdekaan 1945.',
    sourceUrl: 'https://id.wikipedia.org/wiki/Sumpah_Pemuda',
    question: 'Kapan Bahasa Indonesia ditetapkan sebagai bahasa persatuan?',
    options: ['17 Agustus 1945', '1 Juni 1945', '28 Oktober 1928', '20 Mei 1908'],
    correctIndex: 2,
    explanation: 'Sumpah Pemuda pada 28 Oktober 1928 menetapkan Bahasa Indonesia sebagai bahasa persatuan bangsa.',
    status: 'approved',
    generatedBy: 'ai',
  },
]

async function seed() {
  await mongoose.connect(MONGODB_URI!)
  console.log('Connected to MongoDB')

  const existing = await Card.countDocuments({ theme: 'tutorial' })
  if (existing > 0) {
    console.log(`Skipping — ${existing} tutorial cards already exist.`)
    await mongoose.disconnect()
    return
  }

  await Card.insertMany(tutorialCards)
  console.log(`Seeded ${tutorialCards.length} tutorial cards.`)
  await mongoose.disconnect()
}

seed().catch((err) => {
  console.error(err)
  process.exit(1)
})
