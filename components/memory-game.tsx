"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import * as LucideIcons from "lucide-react"
import type { GameLevel } from "@/lib/game-utils"

interface MemoryGameProps {
  level: GameLevel
  onGameEnd: (success: boolean, stars: number) => void
  timeLeft: number
}

interface Card {
  id: string
  iconName: string
  isFlipped: boolean
  isMatched: boolean
  pairId: string
}

export function MemoryGame({ level, onGameEnd, timeLeft }: MemoryGameProps) {
  const [cards, setCards] = useState<Card[]>([])
  const [flippedCards, setFlippedCards] = useState<string[]>([])
  const [matchedPairs, setMatchedPairs] = useState<string[]>([])
  const [gamePhase, setGamePhase] = useState<"preview" | "playing" | "checking">("preview")
  const [moves, setMoves] = useState(0)

  // Initialize cards
  useEffect(() => {
    const gameCards: Card[] = []
    // Ensure icons are unique and capped to the grid's pair count (18 for 6x6)
    const availableIcons = Array.from(new Set(level.icons)).slice(0, 18)

    // Create pairs
    availableIcons.forEach((iconName, index) => {
      const pairId = `pair-${index}`
      // First card of the pair
      gameCards.push({
        id: `${iconName}-1`,
        iconName,
        isFlipped: true, // Start flipped for preview
        isMatched: false,
        pairId,
      })
      // Second card of the pair
      gameCards.push({
        id: `${iconName}-2`,
        iconName,
        isFlipped: true, // Start flipped for preview
        isMatched: false,
        pairId,
      })
    })

    // Shuffle cards
    const shuffledCards = gameCards.sort(() => Math.random() - 0.5)
    setCards(shuffledCards)

    // Show preview for 1 second, then flip all cards face down
    const previewTimer = setTimeout(() => {
      setCards((prev) => prev.map((card) => ({ ...card, isFlipped: false })))
      setGamePhase("playing")
    }, 1000)

    return () => clearTimeout(previewTimer)
  }, [level.icons])

  // Check for game completion
  useEffect(() => {
    const totalPairs = Math.floor(cards.length / 2) || 18
    if (matchedPairs.length === totalPairs && gamePhase === "playing") {
      // All pairs matched - calculate stars based on moves and time
      const timeBonus = timeLeft > level.timeLimit * 0.5 ? 1 : 0
      const moveBonus = moves < 30 ? 1 : 0
      const stars = Math.min(3, 1 + timeBonus + moveBonus)
      onGameEnd(true, stars)
    }
  }, [matchedPairs.length, gamePhase, timeLeft, level.timeLimit, moves, onGameEnd, cards.length])

  // Handle card flip
  const handleCardClick = useCallback(
    (cardId: string) => {
      if (gamePhase !== "playing") return

      const card = cards.find((c) => c.id === cardId)
      if (!card || card.isFlipped || card.isMatched || flippedCards.length >= 2) return

      const newFlippedCards = [...flippedCards, cardId]
      setFlippedCards(newFlippedCards)

      // Flip the card
      setCards((prev) => prev.map((c) => (c.id === cardId ? { ...c, isFlipped: true } : c)))

      if (newFlippedCards.length === 2) {
        setGamePhase("checking")
        setMoves((prev) => prev + 1)

        // Check if cards match
        const [firstCardId, secondCardId] = newFlippedCards
        const firstCard = cards.find((c) => c.id === firstCardId)
        const secondCard = cards.find((c) => c.id === secondCardId)

        if (firstCard && secondCard && firstCard.pairId === secondCard.pairId) {
          // Match found!
          setTimeout(() => {
            setCards((prev) => prev.map((c) => (c.pairId === firstCard.pairId ? { ...c, isMatched: true } : c)))
            setMatchedPairs((prev) => [...prev, firstCard.pairId])
            setFlippedCards([])
            setGamePhase("playing")
          }, 800)
        } else {
          // No match - flip cards back
          setTimeout(() => {
            setCards((prev) => prev.map((c) => (newFlippedCards.includes(c.id) ? { ...c, isFlipped: false } : c)))
            setFlippedCards([])
            setGamePhase("playing")
          }, 1200)
        }
      }
    },
    [cards, flippedCards, gamePhase],
  )

  // Handle time up
  useEffect(() => {
    if (timeLeft === 0 && gamePhase === "playing") {
      onGameEnd(false, 0)
    }
  }, [timeLeft, gamePhase, onGameEnd])

  return (
    <div className="max-w-md mx-auto">
      {/* Game stats */}
      <div className="flex justify-between items-center mb-4">
        <div className="cartoon-card px-3 py-2">
          <span className="text-sm font-bold text-card-foreground">Moves: {moves}</span>
        </div>
        <div className="cartoon-card px-3 py-2">
          <span className="text-sm font-bold text-card-foreground">
            Pairs: {matchedPairs.length}/{Math.floor(cards.length / 2) || 18}
          </span>
        </div>
      </div>

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
          <MemoryCard
            key={card.id}
            card={card}
            index={index}
            onClick={() => handleCardClick(card.id)}
            disabled={gamePhase !== "playing"}
          />
        ))}
      </div>

      {/* Game tips */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="mt-6 text-center"
      >
        <p className="text-xs text-muted-foreground font-semibold">Find all 18 pairs to complete the level!</p>
      </motion.div>
    </div>
  )
}

interface MemoryCardProps {
  card: Card
  index: number
  onClick: () => void
  disabled: boolean
}

function MemoryCard({ card, index, onClick, disabled }: MemoryCardProps) {
  // Get the icon component dynamically
  const IconComponent = (LucideIcons as any)[card.iconName] || LucideIcons.HelpCircle

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        duration: 0.5,
        delay: index * 0.02, // Stagger animation
        type: "spring",
        stiffness: 300,
      }}
      className="aspect-square"
    >
      <AnimatePresence mode="wait">
        {card.isMatched ? (
          // Matched card - fade out with celebration
          <motion.div
            key="matched"
            initial={{ scale: 1 }}
            animate={{ scale: 0, opacity: 0 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full h-full rounded-xl bg-gradient-to-b from-accent to-accent/80 border-2 border-accent-foreground flex items-center justify-center"
          >
            <IconComponent className="w-6 h-6 text-accent-foreground" />
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
                {/* Front face (revealed icon) */}
                <div
                  className="absolute inset-0 rounded-xl bg-gradient-to-b from-card to-card/95 border-2 border-primary shadow-lg flex items-center justify-center"
                  style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}
                >
                  <IconComponent className="w-6 h-6 text-primary" />
                </div>

                {/* Back face (hidden side) */}
                <div
                  className="absolute inset-0 rounded-xl bg-gradient-to-b from-muted to-muted/80 border-2 border-border flex items-center justify-center"
                  style={{
                    transform: "rotateY(180deg)",
                    backfaceVisibility: "hidden",
                    WebkitBackfaceVisibility: "hidden",
                  }}
                >
                  <div className="w-4 h-4 bg-muted-foreground rounded-sm opacity-50" />
                </div>
              </motion.div>
            </div>
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
