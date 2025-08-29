"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import * as LucideIcons from "lucide-react"
import { SPORT_ICONS, saveToStorage, loadFromStorage } from "@/lib/game-utils"

interface InfiniteAttentionGameProps {
  onGameEnd: (score: number) => void
}

interface GameIcon {
  id: string
  iconName: string
  isTarget: boolean
  isFound: boolean
}

export function InfiniteAttentionGame({ onGameEnd }: InfiniteAttentionGameProps) {
  const [icons, setIcons] = useState<GameIcon[]>([])
  const [targetIcon, setTargetIcon] = useState<string>("")
  const [foundTargets, setFoundTargets] = useState<number>(0)
  const [currentStage, setCurrentStage] = useState(1)
  const [totalScore, setTotalScore] = useState(0)
  const [targetsNeeded, setTargetsNeeded] = useState(5)
  const [wrongClicks, setWrongClicks] = useState(0)
  const [maxWrongClicks] = useState(10)

  // Generate new stage
  const generateStage = useCallback((stage: number) => {
    const gridSize = Math.min(8, 6 + Math.floor(stage / 3)) // Increase grid size every 3 stages
    const totalIcons = gridSize * gridSize
    const availableIcons = [...SPORT_ICONS].sort(() => Math.random() - 0.5).slice(0, 15)
    const targetsForStage = Math.min(8, 3 + Math.floor(stage / 2)) // Increase targets needed

    setTargetsNeeded(targetsForStage)

    // Choose random target icon
    const randomTargetIcon = availableIcons[Math.floor(Math.random() * availableIcons.length)]
    setTargetIcon(randomTargetIcon)

    const gameIcons: GameIcon[] = []

    // Add target icons at random positions
    const targetPositions = new Set<number>()
    while (targetPositions.size < targetsForStage) {
      targetPositions.add(Math.floor(Math.random() * totalIcons))
    }

    // Fill grid with icons
    for (let i = 0; i < totalIcons; i++) {
      const isTarget = targetPositions.has(i)
      const iconName = isTarget ? randomTargetIcon : availableIcons[Math.floor(Math.random() * availableIcons.length)]

      gameIcons.push({
        id: `icon-${i}-${stage}`,
        iconName,
        isTarget,
        isFound: false,
      })
    }

    setIcons(gameIcons)
    setFoundTargets(0)
    setWrongClicks(0)
  }, [])

  // Initialize first stage
  useEffect(() => {
    generateStage(1)
  }, [generateStage])

  // Handle icon click
  const handleIconClick = useCallback(
    (iconId: string) => {
      const clickedIcon = icons.find((icon) => icon.id === iconId)
      if (!clickedIcon || clickedIcon.isFound) return

      if (clickedIcon.isTarget) {
        // Found a target!
        setIcons((prev) => prev.map((icon) => (icon.id === iconId ? { ...icon, isFound: true } : icon)))
        setFoundTargets((prev) => prev + 1)
      } else {
        // Wrong icon clicked
        setWrongClicks((prev) => prev + 1)
      }
    },
    [icons],
  )

  // Check for stage completion
  useEffect(() => {
    if (foundTargets === targetsNeeded) {
      // Stage completed!
      setTotalScore((prev) => prev + 1)

      // Auto-advance to next stage
      setTimeout(() => {
        setCurrentStage((prev) => prev + 1)
        generateStage(currentStage + 1)
      }, 1500)
    }
  }, [foundTargets, targetsNeeded, currentStage, generateStage])

  // Check for game over
  useEffect(() => {
    if (wrongClicks >= maxWrongClicks) {
      handleGameOver()
    }
  }, [wrongClicks, maxWrongClicks])

  const handleGameOver = () => {
    // Save high score
    const currentHighScore = loadFromStorage("sm_attention_high_score", 0)
    if (totalScore > currentHighScore) {
      saveToStorage("sm_attention_high_score", totalScore)
    }
    onGameEnd(totalScore)
  }

  const handleQuit = () => {
    handleGameOver()
  }

  // Get the target icon component
  const TargetIconComponent = targetIcon
    ? (LucideIcons as any)[targetIcon] || LucideIcons.HelpCircle
    : LucideIcons.HelpCircle

  if (!targetIcon) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground font-semibold">Preparing stage...</p>
        </div>
      </div>
    )
  }

  const gridSize = Math.min(8, 6 + Math.floor(currentStage / 3))

  return (
    <div className="p-4 max-w-lg mx-auto">
      {/* Game stats */}
      <div className="flex justify-between items-center mb-4">
        <div className="cartoon-card px-3 py-2">
          <span className="text-sm font-bold text-card-foreground">Stage {currentStage}</span>
        </div>
        <div className="cartoon-card px-3 py-2">
          <span className="text-sm font-bold text-card-foreground">Score: {totalScore}</span>
        </div>
        <button
          onClick={handleQuit}
          className="cartoon-button px-3 py-2 bg-destructive text-destructive-foreground text-sm font-bold"
        >
          Quit
        </button>
      </div>

      {/* Target display */}
      <div className="cartoon-card p-4 mb-4 text-center">
        <p className="text-sm font-bold text-card-foreground mb-2">Find this icon:</p>
        <div className="flex justify-center mb-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-b from-primary to-primary/80 border-2 border-border flex items-center justify-center">
            <TargetIconComponent className="w-8 h-8 text-primary-foreground" />
          </div>
        </div>
        <div className="flex justify-between text-xs">
          <span className="font-semibold text-muted-foreground">
            Found: {foundTargets}/{targetsNeeded}
          </span>
          <span className="font-semibold text-destructive">
            Wrong: {wrongClicks}/{maxWrongClicks}
          </span>
        </div>
      </div>

      {/* Progress bars */}
      <div className="mb-4 space-y-2">
        <div className="w-full bg-muted rounded-full h-2">
          <motion.div
            animate={{ width: `${(foundTargets / targetsNeeded) * 100}%` }}
            transition={{ duration: 0.3 }}
            className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
          />
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <motion.div
            animate={{ width: `${(wrongClicks / maxWrongClicks) * 100}%` }}
            transition={{ duration: 0.3 }}
            className="h-full bg-gradient-to-r from-accent to-destructive rounded-full"
          />
        </div>
      </div>

      {/* Stage completion celebration */}
      <AnimatePresence>
        {foundTargets === targetsNeeded && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed inset-0 bg-background/90 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <div className="cartoon-card p-8 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="text-6xl mb-4"
              >
                ⚡
              </motion.div>
              <h3 className="text-2xl font-black text-card-foreground mb-2">Stage Complete!</h3>
              <p className="text-muted-foreground font-semibold">+1 Point • Moving to Stage {currentStage + 1}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Icon grid */}
      <div className={`grid gap-2 ${gridSize === 6 ? "grid-cols-6" : gridSize === 7 ? "grid-cols-7" : "grid-cols-8"}`}>
        {icons.map((icon, index) => (
          <InfiniteAttentionIcon key={icon.id} icon={icon} index={index} onClick={() => handleIconClick(icon.id)} />
        ))}
      </div>
    </div>
  )
}

interface InfiniteAttentionIconProps {
  icon: GameIcon
  index: number
  onClick: () => void
}

function InfiniteAttentionIcon({ icon, index, onClick }: InfiniteAttentionIconProps) {
  const IconComponent = (LucideIcons as any)[icon.iconName] || LucideIcons.HelpCircle

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{
        opacity: icon.isFound ? 0.3 : 1,
        scale: icon.isFound ? 0.8 : 1,
      }}
      transition={{
        duration: 0.3,
        delay: index * 0.005,
      }}
      onClick={onClick}
      disabled={icon.isFound}
      className={`
        aspect-square p-2 rounded-lg transition-all duration-200
        ${icon.isFound ? "bg-accent/20 cursor-not-allowed" : "hover:bg-muted/50 active:scale-95 hover:scale-105"}
        flex items-center justify-center
      `}
      whileTap={{ scale: 0.9 }}
    >
      <IconComponent
        className={`w-5 h-5 transition-colors duration-200 ${
          icon.isFound
            ? "text-accent"
            : icon.isTarget
              ? "text-primary hover:text-primary/80"
              : "text-muted-foreground hover:text-foreground"
        }`}
      />

      {/* Found indicator */}
      <AnimatePresence>
        {icon.isFound && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="w-2 h-2 bg-accent rounded-full border border-accent-foreground" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  )
}
