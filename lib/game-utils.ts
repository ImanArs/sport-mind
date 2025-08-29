export type GameMode = "memory" | "attention"
export type GameLevel = {
  id: number
  mode: GameMode
  difficulty: number
  timeLimit: number
  gridSize: number
  icons: string[]
  isUnlocked: boolean
  isCompleted: boolean
  stars: number
}

export type UserProfile = {
  nickname: string
  avatar: string
  completedLevels: number
  wins: number
  losses: number
  memoryScore: number
  attentionScore: number
  league: string
  leagueProgress: number
}

export type GameStats = {
  currentLevel: number
  profile: UserProfile
  levels: GameLevel[]
}

// Available sport icons from lucide-react
// Important: These names must match actual lucide-react exports to avoid
// rendering unknown icons as HelpCircle (which makes multiple pairs look identical).
// Picked a curated set with at least 20 known-valid icons so we can build
// 18 unique pairs for the 6x6 memory grid without visual duplicates.
export const SPORT_ICONS = [
  "Activity",
  "Award",
  "Bike",
  "Brain",
  "Camera",
  "Clock",
  "Compass",
  "Dumbbell",
  "Eye",
  "Flag",
  "Globe",
  "Heart",
  "Lightbulb",
  "Map",
  "Music",
  "Rocket",
  "Shield",
  "Star",
  "Target",
  "Timer",
  "Trophy",
  "Umbrella",
  "Zap",
]

// League system like Valorant
export const LEAGUES = [
  { name: "Plastic", color: "#8B4513", pointsRequired: 0 },
  { name: "Bronze", color: "#CD7F32", pointsRequired: 20 },
  { name: "Silver", color: "#C0C0C0", pointsRequired: 40 },
  { name: "Gold", color: "#FFD700", pointsRequired: 60 },
  { name: "Platinum", color: "#E5E4E2", pointsRequired: 80 },
  { name: "Diamond", color: "#B9F2FF", pointsRequired: 100 },
  { name: "Emerald", color: "#50C878", pointsRequired: 120 },
]

// Simple hash function for deterministic generation
function simpleHash(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return Math.abs(hash)
}

// Pseudo-random number generator with seed
class SeededRandom {
  private seed: number

  constructor(seed: number) {
    this.seed = seed
  }

  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280
    return this.seed / 233280
  }

  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min
  }

  shuffle<T>(array: T[]): T[] {
    const result = [...array]
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(this.next() * (i + 1))
      ;[result[i], result[j]] = [result[j], result[i]]
    }
    return result
  }
}

// Generate deterministic levels based on nickname
export function generateLevels(nickname: string): GameLevel[] {
  const seed = simpleHash(nickname)
  const rng = new SeededRandom(seed)
  const levels: GameLevel[] = []

  for (let i = 1; i <= 30; i++) {
    const mode: GameMode = i % 2 === 1 ? "memory" : "attention"
    const difficulty = Math.floor((i - 1) / 6) + 1 // 1-5 difficulty
    const gridSize = mode === "memory" ? 6 : 6
    // Unified 3-minute timer for all modes
    const timeLimit = 180

    // Select random icons for this level
    const shuffledIcons = rng.shuffle(SPORT_ICONS)
    const iconCount = mode === "memory" ? 18 : 20 // 18 pairs for memory, 20 icons for attention
    const icons = shuffledIcons.slice(0, iconCount)

    levels.push({
      id: i,
      mode,
      difficulty,
      timeLimit,
      gridSize,
      icons,
      isUnlocked: i === 1, // Only first level unlocked initially
      isCompleted: false,
      stars: 0,
    })
  }

  return levels
}

// Storage utilities
export const STORAGE_KEYS = {
  LEVELS: "sm_levels",
  PROFILE: "sm_profile",
  CURRENT_LEVEL: "sm_current_level",
}

export function saveToStorage<T>(key: string, data: T): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(key, JSON.stringify(data))
  }
}

export function loadFromStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === "undefined") return defaultValue

  try {
    const stored = localStorage.getItem(key)
    return stored ? JSON.parse(stored) : defaultValue
  } catch {
    return defaultValue
  }
}

// Initialize or load game data
export function initializeGameData(nickname: string): GameStats {
  let levels = loadFromStorage<GameLevel[]>(STORAGE_KEYS.LEVELS, [])

  // Generate levels if none exist or nickname changed
  if (levels.length === 0) {
    levels = generateLevels(nickname)
    saveToStorage(STORAGE_KEYS.LEVELS, levels)
  }

  // Migrate existing saved levels to 3-minute timers
  // Ensures users with old data (120/60 sec) get updated to 180 sec.
  const migratedLevels = levels.map((lvl) => ({ ...lvl, timeLimit: 180 }))
  if (JSON.stringify(migratedLevels.map((l) => l.timeLimit)) !== JSON.stringify(levels.map((l) => l.timeLimit))) {
    saveToStorage(STORAGE_KEYS.LEVELS, migratedLevels)
  }

  const defaultProfile: UserProfile = {
    nickname,
    avatar: "🎮",
    completedLevels: 0,
    wins: 0,
    losses: 0,
    memoryScore: 0,
    attentionScore: 0,
    league: "Plastic",
    leagueProgress: 0,
  }

  const profile = loadFromStorage<UserProfile>(STORAGE_KEYS.PROFILE, defaultProfile)
  const currentLevel = loadFromStorage<number>(STORAGE_KEYS.CURRENT_LEVEL, 1)

  return {
    currentLevel,
    profile,
    levels: migratedLevels,
  }
}

// Get current league based on total points
export function getCurrentLeague(totalPoints: number): { name: string; color: string; progress: number } {
  let currentLeague = LEAGUES[0]
  let nextLeague = LEAGUES[1]

  for (let i = 0; i < LEAGUES.length - 1; i++) {
    if (totalPoints >= LEAGUES[i].pointsRequired && totalPoints < LEAGUES[i + 1].pointsRequired) {
      currentLeague = LEAGUES[i]
      nextLeague = LEAGUES[i + 1]
      break
    }
  }

  if (totalPoints >= LEAGUES[LEAGUES.length - 1].pointsRequired) {
    currentLeague = LEAGUES[LEAGUES.length - 1]
    nextLeague = currentLeague
  }

  const progress =
    nextLeague === currentLeague
      ? 100
      : ((totalPoints - currentLeague.pointsRequired) / (nextLeague.pointsRequired - currentLeague.pointsRequired)) *
        100

  return {
    name: currentLeague.name,
    color: currentLeague.color,
    progress: Math.min(100, Math.max(0, progress)),
  }
}
