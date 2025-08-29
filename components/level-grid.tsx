"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Lock, Star, Brain, Eye, Play } from "lucide-react";
import {
  type GameStats,
  type GameLevel,
  saveToStorage,
  STORAGE_KEYS,
} from "@/lib/game-utils";
import { GameScreen } from "@/components/game-screen";

interface LevelGridProps {
  gameData: GameStats;
  onGameDataUpdate: (data: GameStats) => void;
}

export function LevelGrid({ gameData, onGameDataUpdate }: LevelGridProps) {
  const [selectedLevel, setSelectedLevel] = useState<GameLevel | null>(null);

  const handleLevelClick = (level: GameLevel) => {
    if (level.isUnlocked) {
      setSelectedLevel(level);
    }
  };

  const handleLevelComplete = (
    levelId: number,
    stars: number,
    success: boolean
  ) => {
    const updatedLevels = gameData.levels.map((level) => {
      if (level.id === levelId) {
        return {
          ...level,
          isCompleted: success,
          stars: success ? Math.max(level.stars, stars) : level.stars,
        };
      }
      // Unlock next level if current level completed successfully
      if (level.id === levelId + 1 && success) {
        return { ...level, isUnlocked: true };
      }
      return level;
    });

    const updatedProfile = {
      ...gameData.profile,
      completedLevels: updatedLevels.filter((l) => l.isCompleted).length,
      wins: success ? gameData.profile.wins + 1 : gameData.profile.wins,
      losses: !success ? gameData.profile.losses + 1 : gameData.profile.losses,
    };

    const updatedGameData = {
      ...gameData,
      levels: updatedLevels,
      profile: updatedProfile,
    };

    // Save to localStorage
    saveToStorage(STORAGE_KEYS.LEVELS, updatedLevels);
    saveToStorage(STORAGE_KEYS.PROFILE, updatedProfile);

    onGameDataUpdate(updatedGameData);
    setSelectedLevel(null);
  };

  const handleBackToGrid = () => {
    setSelectedLevel(null);
  };

  if (selectedLevel) {
    return (
      <GameScreen
        level={selectedLevel}
        onComplete={handleLevelComplete}
        onBack={handleBackToGrid}
      />
    );
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
        <h1 className="text-4xl font-black text-primary mb-2">SportMind</h1>
        <p className="text-muted-foreground font-semibold">
          Train your memory and attention with sports!
        </p>
      </motion.div>

      {/* Progress indicator */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="cartoon-card p-4 mb-6 mx-auto max-w-sm"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="font-bold text-card-foreground">Progress</span>
          <span className="font-bold text-primary">
            {gameData.profile.completedLevels}/30
          </span>
        </div>
        <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{
              width: `${(gameData.profile.completedLevels / 30) * 100}%`,
            }}
            transition={{ duration: 1, delay: 0.5 }}
            className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
          />
        </div>
      </motion.div>

      {/* Level Grid */}
      <div className="grid grid-cols-5 gap-3 max-w-md mx-auto">
        {gameData.levels.map((level, index) => (
          <LevelCard
            key={level.id}
            level={level}
            index={index}
            onClick={() => handleLevelClick(level)}
          />
        ))}
      </div>

      {/* Legend */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 1.5 }}
        className="mt-8 flex justify-center gap-6 text-sm"
      >
        <div className="flex items-center gap-2">
          <Brain className="w-4 h-4 text-primary" />
          <span className="font-semibold text-muted-foreground">Memory</span>
        </div>
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-secondary" />
          <span className="font-semibold text-muted-foreground">Attention</span>
        </div>
      </motion.div>
    </div>
  );
}

interface LevelCardProps {
  level: GameLevel;
  index: number;
  onClick: () => void;
}

function LevelCard({ level, index, onClick }: LevelCardProps) {
  const isLocked = !level.isUnlocked;
  const ModeIcon = level.mode === "memory" ? Brain : Eye;

  return (
    <motion.button
      initial={{ opacity: 0, y: 20, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.5,
        delay: index * 0.05, // Stagger animation
        type: "spring",
        stiffness: 300,
        damping: 20,
      }}
      onClick={onClick}
      disabled={isLocked}
      className={`
        relative aspect-square rounded-2xl p-2 font-bold text-sm
        transition-all duration-200 ease-out
        ${
          isLocked
            ? "bg-gradient-to-b from-muted to-muted/80 border-2 border-border/50 cursor-not-allowed"
            : level.isCompleted
            ? "bg-gradient-to-b from-accent to-accent/80 border-2 border-accent-foreground hover:scale-105 active:scale-95"
            : level.mode === "memory"
            ? "bg-gradient-to-b from-primary to-primary/80 border-2 border-border hover:scale-105 active:scale-95"
            : "bg-gradient-to-b from-secondary to-secondary/80 border-2 border-border hover:scale-105 active:scale-95"
        }
        shadow-lg hover:shadow-xl
        ${!isLocked && "cartoon-button"}
      `}
    >
      {/* Level number */}
      <div className="absolute top-1 left-1 right-1 text-center">
        <span
          className={`text-xs font-black ${
            isLocked
              ? "text-muted-foreground"
              : level.isCompleted
              ? "text-accent-foreground"
              : "text-primary-foreground"
          }`}
        >
          {/* {level.id} */}
        </span>
      </div>

      {/* Center content */}
      <div className="flex items-center justify-center h-full">
        {isLocked ? (
          <Lock className={`w-5 h-5 text-muted-foreground`} />
        ) : (
          <div className="flex flex-col items-center gap-1">
            <ModeIcon
              className={`w-4 h-4 ${
                level.isCompleted
                  ? "text-accent-foreground"
                  : "text-primary-foreground"
              }`}
            />
            {!level.isCompleted && (
              <Play
                className={`w-3 h-3 ${
                  level.mode === "memory"
                    ? "text-primary-foreground"
                    : "text-secondary-foreground"
                }`}
              />
            )}
          </div>
        )}
      </div>

      {/* Stars for completed levels */}
      {level.isCompleted && level.stars > 0 && (
        <div className="absolute bottom-1 left-1 right-1 flex justify-center gap-0.5">
          {Array.from({ length: 3 }).map((_, i) => (
            <Star
              key={i}
              className={`w-2.5 h-2.5 ${
                i < level.stars
                  ? "text-accent-foreground fill-accent-foreground"
                  : "text-accent-foreground/30"
              }`}
            />
          ))}
        </div>
      )}

      {/* Difficulty indicator */}
      <div className="absolute top-1 right-1">
        <div className="flex gap-0.5">
          {Array.from({ length: level.difficulty }).map((_, i) => (
            <div
              key={i}
              className={`w-1 h-1 rounded-full ${
                isLocked
                  ? "bg-muted-foreground/50"
                  : level.isCompleted
                  ? "bg-accent-foreground/70"
                  : "bg-primary-foreground/70"
              }`}
            />
          ))}
        </div>
      </div>
    </motion.button>
  );
}
