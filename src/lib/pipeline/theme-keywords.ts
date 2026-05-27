export const THEME_KEYWORDS: Record<string, string[]> = {
  sejarah_indonesia: ['Sumpah Pemuda', 'Proklamasi kemerdekaan Indonesia', 'Majapahit', 'Soekarno', 'Borobudur'],
  sains:            ['Fotosintesis', 'Hukum Newton', 'DNA', 'Lubang hitam', 'Atom'],
  pop_culture:      ['K-pop', 'Anime', 'Studio Ghibli', 'BTS', 'One Piece'],
  geografi:         ['Amazon', 'Gunung Everest', 'Samudra Pasifik', 'Sahara', 'Antartika'],
  matematika:       ['Bilangan prima', 'Teori Pythagoras', 'Fibonacci', 'Pi', 'Statistik'],
  psikologi:        ['Efek Dunning-Kruger', 'Psikologi warna', 'Bias kognitif', 'Teori Maslow', 'Empati'],
  sejarah_dunia:    ['Perang Dunia II', 'Revolusi Perancis', 'Kekaisaran Romawi', 'Perang Dingin', 'Renaisans'],
  coding_tech:      ['Kecerdasan buatan', 'Internet', 'Blockchain', 'Algoritma', 'Open source'],
}

export function pickKeyword(theme: string): string {
  const keywords = THEME_KEYWORDS[theme]
  if (!keywords?.length) throw new Error(`Unknown theme: ${theme}`)
  // Non-security use: picks a random topic for Wikipedia search variety. Math.random() is intentional.
  return keywords[Math.floor(Math.random() * keywords.length)] // NOSONAR
}
