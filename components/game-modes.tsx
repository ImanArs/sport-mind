"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Brain, Eye, Trophy, Play, ArrowLeft } from "lucide-react"
import type { GameStats } from "@/lib/game-utils"
import { InfiniteMemoryGame } from "@/components/infinite-memory-game"
import { InfiniteAttentionGame } from "@/components/infinite-attention-game"

interface GameModesProps {
  gameData: GameStats
  onGameDataUpdate: (data: GameStats) => void
}

type InfiniteGameMode = "memory" | "attention" | null

export function GameModes({ gameData, onGameDataUpdate }: GameModesProps) {
  const [selectedMode, setSelectedMode] = useState<InfiniteGameMode>(null)
  const [gameState, setGameState] = useState<"menu" | "countdown" | "playing">("menu")
  const [countdown, setCountdown] = useState(3)

  // Countdown timer
  useEffect(() => {
    if (gameState === "countdown" && countdown > 0) {
      const timer = setTimeout(() => {
        if (countdown === 1) {
          setGameState("playing")
        } else {
          setCountdown(countdown - 1)
        }
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [gameState, countdown])

  const handleModeSelect = (mode: InfiniteGameMode) => {
    setSelectedMode(mode)
    setCountdown(3)
    setGameState("countdown")
  }

  const handleGameEnd = (mode: "memory" | "attention", score: number) => {
    // Update profile with new score
    const updatedProfile = {
      ...gameData.profile,
      [mode === "memory" ? "memoryScore" : "attentionScore"]: Math.max(
        gameData.profile[mode === "memory" ? "memoryScore" : "attentionScore"],
        score,
      ),
    }

    const updatedGameData = {
      ...gameData,
      profile: updatedProfile,
    }

    onGameDataUpdate(updatedGameData)
    setSelectedMode(null)
    setGameState("menu")
  }

  const handleBackToMenu = () => {
    setSelectedMode(null)
    setGameState("menu")
  }

  if (gameState === "countdown" && selectedMode) {
    return <CountdownScreen countdown={countdown} mode={selectedMode} />
  }

  if (gameState === "playing" && selectedMode) {
    return (
      <div className="min-h-screen bg-background">
        {/* Back button */}
        <div className="p-4 border-b-2 border-border">
          <button onClick={handleBackToMenu} className="cartoon-button p-2 bg-muted hover:bg-muted/80">
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {selectedMode === "memory" ? (
          <InfiniteMemoryGame onGameEnd={(score) => handleGameEnd("memory", score)} />
        ) : (
          <InfiniteAttentionGame onGameEnd={(score) => handleGameEnd("attention", score)} />
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-8 pt-4"
      >
        <h1 className="text-4xl font-black text-primary mb-2">Infinite Modes</h1>
        <p className="text-muted-foreground font-semibold">Play endlessly and beat your high scores!</p>
      </motion.div>

      {/* Game mode cards */}
      <div className="max-w-md mx-auto space-y-4">
        {/* Memory Mode */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="stagger-item"
        >
          <GameModeCard
            title="Memory Challenge"
            description="Match pairs of cards in endless rounds"
            icon={Brain}
            color="primary"
            highScore={gameData.profile.memoryScore}
            onPlay={() => handleModeSelect("memory")}
          />
        </motion.div>

        {/* Attention Mode */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="stagger-item"
        >
          <GameModeCard
            title="Attention Test"
            description="Find target icons as fast as you can"
            icon={Eye}
            color="secondary"
            highScore={gameData.profile.attentionScore}
            onPlay={() => handleModeSelect("attention")}
          />
        </motion.div>
      </div>

      {/* Instructions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="mt-8 cartoon-card p-4 max-w-md mx-auto"
      >
        <h3 className="font-bold text-card-foreground mb-2 flex items-center gap-2">
          <Trophy className="w-4 h-4 text-accent" />
          How to Play
        </h3>
        <ul className="text-sm text-muted-foreground space-y-1 font-semibold">
          <li>• Complete stages to earn points</li>
          <li>• Each stage = 1 point toward your league</li>
          <li>• No time limit - play at your own pace</li>
          <li>• Beat your high scores and climb the ranks!</li>
        </ul>
      </motion.div>
    </div>
  )
}

interface GameModeCardProps {
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  color: "primary" | "secondary"
  highScore: number
  onPlay: () => void
}

function GameModeCard({ title, description, icon: Icon, color, highScore, onPlay }: GameModeCardProps) {
  const colorClasses = {
    primary: "from-primary to-primary/80 border-border text-primary-foreground",
    secondary: "from-secondary to-secondary/80 border-border text-secondary-foreground",
  }

  return (
    <div className="cartoon-card p-6 hover:scale-105 transition-transform duration-200">
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div
          className={`w-12 h-12 rounded-xl bg-gradient-to-b ${colorClasses[color]} flex items-center justify-center`}
        >
          <Icon className="w-6 h-6" />
        </div>

        {/* Content */}
        <div className="flex-1">
          <h3 className="font-black text-lg text-card-foreground mb-1">{title}</h3>
          <p className="text-sm text-muted-foreground font-semibold mb-3">{description}</p>

          {/* High score */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs text-muted-foreground font-bold">High Score:</span>
            <span className="text-sm font-black text-accent">{highScore}</span>
          </div>

          {/* Play button */}
          <button
            onClick={onPlay}
            className="cartoon-button w-full py-2 bg-gradient-to-b from-accent to-accent/80 text-accent-foreground font-bold text-sm flex items-center justify-center gap-2"
          >
            <Play className="w-4 h-4" />
            Play Now
          </button>
        </div>
      </div>
    </div>
  )
}

interface CountdownScreenProps {
  countdown: number
  mode: "memory" | "attention"
}

function CountdownScreen({ countdown, mode }: CountdownScreenProps) {
  const displayText = countdown === 0 ? "GO!" : countdown.toString()
  const ModeIcon = mode === "memory" ? Brain : Eye

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm flex flex-col items-center justify-center z-50">
      {/* Mode indicator */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex items-center gap-3"
      >
        <ModeIcon className={`w-8 h-8 ${mode === "memory" ? "text-primary" : "text-secondary"}`} />
        <span className="text-xl font-bold text-foreground capitalize">{mode} Mode</span>
      </motion.div>

      {/* Countdown */}
      <motion.div
        key={displayText}
        initial={{ opacity: 0, y: 100, scale: 0.3 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -100, scale: 0.3 }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 20,
        }}
        className="text-8xl font-black text-primary"
      >
        {displayText}
      </motion.div>

      {/* Ready message */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-8 text-muted-foreground font-semibold"
      >
        Get ready to play!
      </motion.p>
    </div>
  )
}
