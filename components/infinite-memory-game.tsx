"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import * as LucideIcons from "lucide-react"
import { SPORT_ICONS, saveToStorage, loadFromStorage } from "@/lib/game-utils"

interface InfiniteMemoryGameProps {
  onGameEnd: (score: number) => void
}

interface Card {
  id: string
  iconName: string
  isFlipped: boolean
  isMatched: boolean
  pairId: string
}

export function InfiniteMemoryGame({ onGameEnd }: InfiniteMemoryGameProps) {
  const [cards, setCards] = useState<Card[]>([])
  const [flippedCards, setFlippedCards] = useState<string[]>([])
  const [matchedPairs, setMatchedPairs] = useState<string[]>([])
  const [gamePhase, setGamePhase] = useState<"preview" | "playing" | "checking" | "completed">("preview")
  const [currentStage, setCurrentStage] = useState(1)
  const [totalScore, setTotalScore] = useState(0)
  const [moves, setMoves] = useState(0)

  // Generate new stage
  const generateStage = useCallback((stage: number) => {
    const gameCards: Card[] = []
    const pairsCount = Math.min(18, 12 + stage) // Start with 12 pairs, increase each stage
    const availableIcons = [...SPORT_ICONS].sort(() => Math.random() - 0.5).slice(0, pairsCount)

    // Create pairs
    availableIcons.forEach((iconName, index) => {
      const pairId = `pair-${index}`
      gameCards.push(
        {
          id: `${iconName}-1-${stage}`,
          iconName,
          isFlipped: true,
          isMatched: false,
          pairId,
        },
        {
          id: `${iconName}-2-${stage}`,
          iconName,
          isFlipped: true,
          isMatched: false,
          pairId,
        },
      )
    })

    // Shuffle cards
    const shuffledCards = gameCards.sort(() => Math.random() - 0.5)
    setCards(shuffledCards)
    setFlippedCards([])
    setMatchedPairs([])
    setMoves(0)
    setGamePhase("preview")

    // Show preview, then start playing
    setTimeout(() => {
      setCards((prev) => prev.map((card) => ({ ...card, isFlipped: false })))
      setGamePhase("playing")
    }, 1500)
  }, [])

  // Initialize first stage
  useEffect(() => {
    generateStage(1)
  }, [generateStage])

  // Check for stage completion
  useEffect(() => {
    const pairsCount = Math.min(18, 12 + currentStage)
    if (matchedPairs.length === pairsCount && gamePhase === "playing") {
      setGamePhase("completed")
      setTotalScore((prev) => prev + 1)

      // Auto-advance to next stage after celebration
      setTimeout(() => {
        setCurrentStage((prev) => prev + 1)
        generateStage(currentStage + 1)
      }, 2000)
    }
  }, [matchedPairs.length, gamePhase, currentStage, generateStage])

  // Handle card flip
  const handleCardClick = useCallback(
    (cardId: string) => {
      if (gamePhase !== "playing") return

      const card = cards.find((c) => c.id === cardId)
      if (!card || card.isFlipped || card.isMatched || flippedCards.length >= 2) return

      const newFlippedCards = [...flippedCards, cardId]
      setFlippedCards(newFlippedCards)
      setCards((prev) => prev.map((c) => (c.id === cardId ? { ...c, isFlipped: true } : c)))

      if (newFlippedCards.length === 2) {
        setGamePhase("checking")
        setMoves((prev) => prev + 1)

        const [firstCardId, secondCardId] = newFlippedCards
        const firstCard = cards.find((c) => c.id === firstCardId)
        const secondCard = cards.find((c) => c.id === secondCardId)

        if (firstCard && secondCard && firstCard.pairId === secondCard.pairId) {
          // Match found
          setTimeout(() => {
            setCards((prev) => prev.map((c) => (c.pairId === firstCard.pairId ? { ...c, isMatched: true } : c)))
            setMatchedPairs((prev) => [...prev, firstCard.pairId])
            setFlippedCards([])
            setGamePhase("playing")
          }, 800)
        } else {
          // No match - check if too many wrong moves (game over condition)
          if (moves >= 50 + currentStage * 10) {
            // Game over after too many moves
            setTimeout(() => {
              handleGameOver()
            }, 1200)
          } else {
            // Continue playing
            setTimeout(() => {
              setCards((prev) => prev.map((c) => (newFlippedCards.includes(c.id) ? { ...c, isFlipped: false } : c)))
              setFlippedCards([])
              setGamePhase("playing")
            }, 1200)
          }
        }
      }
    },
    [cards, flippedCards, gamePhase, moves, currentStage],
  )

  const handleGameOver = () => {
    // Save high score
    const currentHighScore = loadFromStorage("sm_memory_high_score", 0)
    if (totalScore > currentHighScore) {
      saveToStorage("sm_memory_high_score", totalScore)
    }
    onGameEnd(totalScore)
  }

  const handleQuit = () => {
    handleGameOver()
  }

  const pairsCount = Math.min(18, 12 + currentStage)

  return (
    <div className="p-4 max-w-md mx-auto">
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

      {/* Progress */}
      <div className="cartoon-card p-3 mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-bold text-card-foreground">
            Pairs: {matchedPairs.length}/{pairsCount}
          </span>
          <span className="text-sm font-bold text-card-foreground">Moves: {moves}</span>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <motion.div
            animate={{ width: `${(matchedPairs.length / pairsCount) * 100}%` }}
            transition={{ duration: 0.3 }}
            className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
          />
        </div>
      </div>

      {/* Stage completion celebration */}
      <AnimatePresence>
        {gamePhase === "completed" && (
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
                🎉
              </motion.div>
              <h3 className="text-2xl font-black text-card-foreground mb-2">Stage Complete!</h3>
              <p className="text-muted-foreground font-semibold">+1 Point • Moving to Stage {currentStage + 1}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Instructions during preview */}
      {gamePhase === "preview" && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="text-center mb-4 cartoon-card p-3"
        >
          <p className="text-sm font-bold text-card-foreground">Memorize the cards!</p>
        </motion.div>
      )}

      {/* Card grid */}
      <div className="grid grid-cols-6 gap-2">
        {cards.map((card, index) => (
          <InfiniteMemoryCard
            key={card.id}
            card={card}
            index={index}
            onClick={() => handleCardClick(card.id)}
            disabled={gamePhase !== "playing"}
          />
        ))}
      </div>
    </div>
  )
}

interface InfiniteMemoryCardProps {
  card: Card
  index: number
  onClick: () => void
  disabled: boolean
}

function InfiniteMemoryCard({ card, index, onClick, disabled }: InfiniteMemoryCardProps) {
  const IconComponent = (LucideIcons as any)[card.iconName] || LucideIcons.HelpCircle

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        duration: 0.3,
        delay: index * 0.01,
      }}
      className="aspect-square"
    >
      <AnimatePresence mode="wait">
        {card.isMatched ? (
          <motion.div
            key="matched"
            initial={{ scale: 1 }}
            animate={{ scale: 0, opacity: 0 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full h-full rounded-xl bg-gradient-to-b from-accent to-accent/80 border-2 border-accent-foreground flex items-center justify-center"
          >
            <IconComponent className="w-5 h-5 text-accent-foreground" />
          </motion.div>
        ) : (
          <motion.button
            key="card"
            onClick={onClick}
            disabled={disabled || card.isFlipped}
            className="w-full h-full"
            whileTap={{ scale: 0.97 }}
          >
            <div className="relative w-full h-full" style={{ perspective: 1000 }}>
              <motion.div
                className="relative w-full h-full rounded-xl"
                animate={{ rotateY: card.isFlipped ? 0 : 180 }}
                transition={{ duration: 0.5 }}
                style={{ transformStyle: "preserve-3d" }}
              >
                {/* Front face */}
                <div
                  className="absolute inset-0 rounded-xl bg-gradient-to-b from-card to-card/95 border-2 border-primary shadow-lg flex items-center justify-center"
                  style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}
                >
                  <IconComponent className="w-5 h-5 text-primary" />
                </div>

                {/* Back face */}
                <div
                  className="absolute inset-0 rounded-xl bg-gradient-to-b from-muted to-muted/80 border-2 border-border flex items-center justify-center"
                  style={{
                    transform: "rotateY(180deg)",
                    backfaceVisibility: "hidden",
                    WebkitBackfaceVisibility: "hidden",
                  }}
                >
                  <div className="w-3 h-3 bg-muted-foreground rounded-sm opacity-50" />
                </div>
              </motion.div>
            </div>
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
