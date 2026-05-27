'use server'
import type { CardDoc } from '@/types'

// Stub: E07 replaces this with the real feed algorithm
const MOCK_CARDS: CardDoc[] = [
  {
    _id: 'mock-card-1',
    theme: 'sains',
    fact: 'Fotosintesis adalah proses mengubah cahaya matahari menjadi energi kimia yang tersimpan dalam glukosa oleh tumbuhan dan alga.',
    sourceUrl: 'https://id.wikipedia.org/wiki/Fotosintesis',
    question: 'Apa produk utama yang dihasilkan oleh fotosintesis?',
    options: ['Oksigen dan glukosa', 'Karbon dioksida dan air', 'Nitrogen dan protein', 'Mineral dan garam'],
    correctIndex: 0,
    explanation: 'Fotosintesis menghasilkan glukosa sebagai sumber energi dan oksigen sebagai produk sampingan yang dilepas ke udara.',
  },
  {
    _id: 'mock-card-2',
    theme: 'sejarah_indonesia',
    fact: 'Borobudur adalah candi Buddha terbesar di dunia yang dibangun pada abad ke-9 oleh Dinasti Syailendra di Jawa Tengah.',
    sourceUrl: 'https://id.wikipedia.org/wiki/Borobudur',
    question: 'Borobudur dibangun oleh dinasti apa?',
    options: ['Mataram', 'Majapahit', 'Syailendra', 'Sriwijaya'],
    correctIndex: 2,
    explanation: 'Borobudur dibangun oleh Dinasti Syailendra sekitar tahun 800-an Masehi dan merupakan warisan dunia UNESCO.',
  },
]

let mockIndex = 0

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function getNextCard(userId: string): Promise<CardDoc | null> {
  const card = MOCK_CARDS[mockIndex % MOCK_CARDS.length]
  mockIndex = (mockIndex + 1) % MOCK_CARDS.length
  return card
}
