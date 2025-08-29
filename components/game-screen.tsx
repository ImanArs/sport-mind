"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, Clock, Star } from "lucide-react"
import type { GameLevel } from "@/lib/game-utils"
import { MemoryGame } from "@/components/memory-game"
import { AttentionGame } from "@/components/attention-game"

interface GameScreenProps {
  level: GameLevel
  onComplete: (levelId: number, stars: number, success: boolean) => void
  onBack: () => void
}

export function GameScreen({ level, onComplete, onBack }: GameScreenProps) {
  const [gameState, setGameState] = useState<"countdown" | "playing" | "completed">("countdown")
  const [countdown, setCountdown] = useState(3)
  const [timeLeft, setTimeLeft] = useState(level.timeLimit)
  const [gameResult, setGameResult] = useState<{ success: boolean; stars: number } | null>(null)

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

  // Game timer
  useEffect(() => {
    if (gameState === "playing" && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else if (gameState === "playing" && timeLeft === 0) {
      // Time's up - game failed
      handleGameEnd(false, 0)
    }
  }, [gameState, timeLeft])

  const handleGameEnd = (success: boolean, stars: number) => {
    setGameResult({ success, stars })
    setGameState("completed")
  }

  const handleContinue = () => {
    if (gameResult) {
      onComplete(level.id, gameResult.stars, gameResult.success)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b-2 border-border">
        <button onClick={onBack} className="cartoon-button p-2 bg-muted hover:bg-muted/80">
          <ArrowLeft className="w-5 h-5 text-muted-foreground" />
        </button>

        <div className="text-center">
          <h2 className="font-black text-lg text-foreground">Level {level.id}</h2>
          <p className="text-sm text-muted-foreground capitalize font-semibold">{level.mode} Game</p>
        </div>

        <div className="flex items-center gap-2 cartoon-card px-3 py-1">
          <Clock className="w-4 h-4 text-primary" />
          <span className="font-bold text-sm text-card-foreground">{formatTime(timeLeft)}</span>
        </div>
      </div>

      {/* Game Content */}
      <div className="flex-1 p-4">
        <AnimatePresence mode="wait">
          {gameState === "countdown" && <CountdownOverlay countdown={countdown} />}

          {gameState === "playing" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
            >
              {level.mode === "memory" ? (
                <MemoryGame level={level} onGameEnd={handleGameEnd} timeLeft={timeLeft} />
              ) : (
                <AttentionGame level={level} onGameEnd={handleGameEnd} timeLeft={timeLeft} />
              )}
            </motion.div>
          )}

          {gameState === "completed" && gameResult && (
            <GameResultScreen result={gameResult} level={level} onContinue={handleContinue} />
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

interface CountdownOverlayProps {
  countdown: number
}

function CountdownOverlay({ countdown }: CountdownOverlayProps) {
  const displayText = countdown === 0 ? "GO!" : countdown.toString()

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50"
    >
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
    </motion.div>
  )
}

interface GameResultScreenProps {
  result: { success: boolean; stars: number }
  level: GameLevel
  onContinue: () => void
}

function GameResultScreen({ result, level, onContinue }: GameResultScreenProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center min-h-[60vh] text-center"
    >
      <div className="cartoon-card p-8 max-w-sm mx-auto">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
          className={`w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center ${
            result.success
              ? "bg-gradient-to-b from-accent to-accent/80"
              : "bg-gradient-to-b from-destructive to-destructive/80"
          }`}
        >
          {result.success ? (
            <Star className="w-10 h-10 text-accent-foreground fill-accent-foreground" />
          ) : (
            <div className="text-4xl">😔</div>
          )}
        </motion.div>

        <h3 className="text-2xl font-black mb-2 text-card-foreground">
          {result.success ? "Level Complete!" : "Try Again!"}
        </h3>

        <p className="text-muted-foreground mb-4 font-semibold">
          {result.success ? `Great job! You completed Level ${level.id}` : `Don't give up! Practice makes perfect`}
        </p>

        {result.success && result.stars > 0 && (
          <div className="flex justify-center gap-1 mb-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.5 + i * 0.1, type: "spring" }}
              >
                <Star className={`w-8 h-8 ${i < result.stars ? "text-accent fill-accent" : "text-muted-foreground"}`} />
              </motion.div>
            ))}
          </div>
        )}

        <button
          onClick={onContinue}
          className="cartoon-button px-8 py-3 bg-primary text-primary-foreground font-bold text-lg"
        >
          Continue
        </button>
      </div>
    </motion.div>
  )
}
