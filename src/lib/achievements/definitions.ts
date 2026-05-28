import type { AchievementDef } from '@/types'

export const ACHIEVEMENTS: AchievementDef[] = [
  { key: 'first_answer',  icon: '🌟', title: 'Menyala Abangku!',       rarity: 'Common',  description: 'Jawab soal pertama lo' },
  { key: 'ten_answers',   icon: '📚', title: 'Ilmu Padi',              rarity: 'Common',  description: 'Jawab 10 soal' },
  { key: 'century',       icon: '💯', title: 'Pinjam Dulu Seratus!',   rarity: 'Rare',    description: 'Jawab 100 soal' },
  { key: 'hot_streak',    icon: '🔥', title: 'Ampun Bang Jago!',       rarity: 'Common',  description: '3 jawaban bener berturut-turut' },
  { key: 'on_fire',       icon: '⚡', title: 'Gak Ada Obat!',          rarity: 'Rare',    description: '5 jawaban bener berturut-turut' },
  { key: 'unstoppable',   icon: '👑', title: 'Puh, Ajarin Dong Puh',   rarity: 'Epic',    description: '10 jawaban bener berturut-turut' },
  { key: 'scholar',       icon: '🎓', title: 'Si Paling Ambis',        rarity: 'Common',  description: 'Capai Level 6' },
  { key: 'sage',          icon: '🧙', title: 'Sepuh Turun Gunung',     rarity: 'Rare',    description: 'Capai Level 16' },
  { key: 'mythic',        icon: '🌍', title: 'Admin Bumi',             rarity: 'Mythic',  description: 'Capai Level 50' },
  { key: 'theme_focused', icon: '🎯', title: 'Fokus Jalur VIP',        rarity: 'Common',  description: 'Capai 20 poin di satu tema' },
  { key: 'theme_master',  icon: '🏆', title: 'Raja Terakhir',          rarity: 'Epic',    description: 'Capai 50 poin di satu tema' },
  { key: 'comeback',      icon: '💪', title: 'Gak Jadi Turu!',         rarity: 'Rare',    description: 'Jawab bener setelah 3 jawaban salah' },
  { key: 'hard_comeback', icon: '🫡', title: 'Nyaris Kena Mental',     rarity: 'Epic',    description: 'Jawab bener setelah 5 jawaban salah' },
  { key: 'miracle',       icon: '🙏', title: 'Bantuan Jalur Langit',   rarity: 'Mythic',  description: 'Jawab bener setelah 10 jawaban salah' },
  { key: 'first_skip',    icon: '⏩', title: 'Maaf, Skip Dulu!',       rarity: 'Common',  description: 'Skip soal pertama kali' },
  { key: 'five_skips',    icon: '🌀', title: 'Menolak Pusing',         rarity: 'Common',  description: 'Udah skip 5 soal' },
  { key: 'ten_skips',     icon: '🥷', title: 'Ini Jalan Ninja Ku',     rarity: 'Rare',    description: 'Udah skip 10 soal' },
]
