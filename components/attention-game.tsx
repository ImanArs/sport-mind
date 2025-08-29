"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import * as LucideIcons from "lucide-react"
import type { GameLevel } from "@/lib/game-utils"

interface AttentionGameProps {
  level: GameLevel
  onGameEnd: (success: boolean, stars: number) => void
  timeLeft: number
}

interface GameIcon {
  id: string
  iconName: string
  isTarget: boolean
  isFound: boolean
  position: { x: number; y: number }
}

export function AttentionGame({ level, onGameEnd, timeLeft }: AttentionGameProps) {
  const [icons, setIcons] = useState<GameIcon[]>([])
  const [targetIcon, setTargetIcon] = useState<string>("")
  const [foundTargets, setFoundTargets] = useState<number>(0)
  const [totalTargets] = useState<number>(5)
  const [gameStarted, setGameStarted] = useState(false)

  // Initialize game
  useEffect(() => {
    const gridSize = 6
    const totalIcons = 36
    const availableIcons = level.icons.slice(0, 15) // Use 15 different icons

    // Choose random target icon
    const randomTargetIcon = availableIcons[Math.floor(Math.random() * availableIcons.length)]
    setTargetIcon(randomTargetIcon)

    const gameIcons: GameIcon[] = []

    // Add 5 target icons at random positions
    const targetPositions = new Set<number>()
    while (targetPositions.size < totalTargets) {
      targetPositions.add(Math.floor(Math.random() * totalIcons))
    }

    // Fill grid with icons
    for (let i = 0; i < totalIcons; i++) {
      const isTarget = targetPositions.has(i)
      const iconName = isTarget ? randomTargetIcon : availableIcons[Math.floor(Math.random() * availableIcons.length)]

      const row = Math.floor(i / gridSize)
      const col = i % gridSize

      gameIcons.push({
        id: `icon-${i}`,
        iconName,
        isTarget,
        isFound: false,
        position: { x: col, y: row },
      })
    }

    setIcons(gameIcons)
    setGameStarted(true)
  }, [level.icons, totalTargets])

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
        // Wrong icon - could add penalty or feedback here
        // For now, just visual feedback
      }
    },
    [icons],
  )

  // Check for game completion
  useEffect(() => {
    if (foundTargets === totalTargets && gameStarted) {
      // All targets found - calculate stars based on time
      const timeBonus = timeLeft > 30 ? 2 : timeLeft > 15 ? 1 : 0
      const stars = Math.min(3, 1 + timeBonus)
      onGameEnd(true, stars)
    }
  }, [foundTargets, totalTargets, gameStarted, timeLeft, onGameEnd])

  // Handle time up
  useEffect(() => {
    if (timeLeft === 0 && gameStarted) {
      onGameEnd(false, 0)
    }
  }, [timeLeft, gameStarted, onGameEnd])

  // Get the target icon component
  const TargetIconComponent = targetIcon
    ? (LucideIcons as any)[targetIcon] || LucideIcons.HelpCircle
    : LucideIcons.HelpCircle

  if (!gameStarted || !targetIcon) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground font-semibold">Preparing game...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto">
      {/* Target display */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="cartoon-card p-4 mb-4 text-center"
      >
        <p className="text-sm font-bold text-card-foreground mb-2">Find this icon:</p>
        <div className="flex justify-center mb-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-b from-primary to-primary/80 border-2 border-border flex items-center justify-center">
            <TargetIconComponent className="w-8 h-8 text-primary-foreground" />
          </div>
        </div>
        <p className="text-xs text-muted-foreground font-semibold">
          Found: {foundTargets}/{totalTargets}
        </p>
      </motion.div>

      {/* Progress bar */}
      <div className="mb-4">
        <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(foundTargets / totalTargets) * 100}%` }}
            transition={{ duration: 0.3 }}
            className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
          />
        </div>
      </div>

      {/* Icon grid */}
      <div className="grid grid-cols-6 gap-3">
        {icons.map((icon, index) => (
          <AttentionIcon key={icon.id} icon={icon} index={index} onClick={() => handleIconClick(icon.id)} />
        ))}
      </div>

      {/* Instructions */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-6 text-center"
      >
        <p className="text-xs text-muted-foreground font-semibold">Tap the target icons as fast as you can!</p>
      </motion.div>
    </div>
  )
}

interface AttentionIconProps {
  icon: GameIcon
  index: number
  onClick: () => void
}

function AttentionIcon({ icon, index, onClick }: AttentionIconProps) {
  // Get the icon component dynamically
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
        delay: index * 0.01, // Stagger animation
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
        className={`w-6 h-6 transition-colors duration-200 ${
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
            <div className="w-3 h-3 bg-accent rounded-full border-2 border-accent-foreground" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  )
}
