"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Edit3, Trophy, Brain, Eye, Star, Target } from "lucide-react";
import type { GameStats } from "@/lib/game-utils";
import {
  getCurrentLeague,
  saveToStorage,
  STORAGE_KEYS,
} from "@/lib/game-utils";

interface UserProfileProps {
  gameData: GameStats;
  onGameDataUpdate: (data: GameStats) => void;
}

const AVATAR_OPTIONS = [
  "🎮",
  "⚽",
  "🏀",
  "🎾",
  "🏈",
  "🏐",
  "🏓",
  "🏸",
  "🥊",
  "🏆",
  "⭐",
  "🔥",
  "💪",
  "🎯",
  "🚀",
];

export function UserProfile({ gameData, onGameDataUpdate }: UserProfileProps) {
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [tempNickname, setTempNickname] = useState(gameData.profile.nickname);
  const [tempAvatar, setTempAvatar] = useState(gameData.profile.avatar);

  const totalPoints =
    gameData.profile.memoryScore + gameData.profile.attentionScore;
  const currentLeague = getCurrentLeague(totalPoints);
  const totalGames = gameData.profile.wins + gameData.profile.losses;
  const winRate =
    totalGames > 0 ? (gameData.profile.wins / totalGames) * 100 : 0;

  const handleSaveProfile = () => {
    const updatedProfile = {
      ...gameData.profile,
      nickname: tempNickname,
      avatar: tempAvatar,
    };

    const updatedGameData = {
      ...gameData,
      profile: updatedProfile,
    };

    saveToStorage(STORAGE_KEYS.PROFILE, updatedProfile);
    onGameDataUpdate(updatedGameData);
    setIsEditingProfile(false);
  };

  const handleCancelEdit = () => {
    setTempNickname(gameData.profile.nickname);
    setTempAvatar(gameData.profile.avatar);
    setIsEditingProfile(false);
  };

  return (
    <div className="min-h-screen bg-background p-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-8 pt-4"
      >
        <h1 className="text-4xl font-black text-primary mb-2">Profile</h1>
        <p className="text-muted-foreground font-semibold">
          Track your progress and achievements
        </p>
      </motion.div>

      <div className="max-w-md mx-auto space-y-6">
        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="cartoon-card p-6 stagger-item"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-black text-card-foreground">
              Player Info
            </h2>
            <button
              onClick={() => setIsEditingProfile(true)}
              className="cartoon-button p-2 bg-muted hover:bg-muted/80"
            >
              <Edit3 className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          {isEditingProfile ? (
            <ProfileEditor
              nickname={tempNickname}
              avatar={tempAvatar}
              onNicknameChange={setTempNickname}
              onAvatarChange={setTempAvatar}
              onSave={handleSaveProfile}
              onCancel={handleCancelEdit}
            />
          ) : (
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-b from-primary to-primary/80 border-2 border-border flex items-center justify-center text-2xl">
                {gameData.profile.avatar}
              </div>
              <div>
                <h3 className="text-lg font-black text-card-foreground">
                  {gameData.profile.nickname}
                </h3>
                <p className="text-sm text-muted-foreground font-semibold">
                  One Lead Player
                </p>
              </div>
            </div>
          )}
        </motion.div>

        {/* League Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="cartoon-card p-6 stagger-item"
        >
          <div className="flex items-center gap-3 mb-4">
            <Trophy className="w-6 h-6 text-accent" />
            <h2 className="text-xl font-black text-card-foreground">League</h2>
          </div>

          <div className="text-center mb-4">
            <div
              className="w-20 h-20 rounded-2xl mx-auto mb-3 flex items-center justify-center text-2xl font-black border-4"
              style={{
                backgroundColor: currentLeague.color + "20",
                borderColor: currentLeague.color,
                color: currentLeague.color,
              }}
            >
              {currentLeague.name[0]}
            </div>
            <h3 className="text-2xl font-black text-card-foreground">
              {currentLeague.name}
            </h3>
            <p className="text-sm text-muted-foreground font-semibold">
              {totalPoints} Total Points
            </p>
          </div>

          {/* Progress to next league */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm font-bold">
              <span className="text-muted-foreground">
                Progress to next league
              </span>
              <span className="text-card-foreground">
                {Math.round(currentLeague.progress)}%
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${currentLeague.progress}%` }}
                transition={{ duration: 1, delay: 0.5 }}
                className="h-full rounded-full"
                style={{
                  background: `linear-gradient(to right, ${currentLeague.color}80, ${currentLeague.color})`,
                }}
              />
            </div>
            <p className="text-xs text-muted-foreground font-semibold text-center">
              {currentLeague.progress >= 100
                ? "Max league reached!"
                : `${Math.ceil(
                    (100 - currentLeague.progress) * 0.2
                  )} more points needed`}
            </p>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          {/* Level Progress */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="cartoon-card p-4 stagger-item"
          >
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-primary" />
              <span className="text-sm font-bold text-card-foreground">
                Levels
              </span>
            </div>
            <div className="text-center">
              <div className="text-2xl font-black text-primary mb-1">
                {gameData.profile.completedLevels}
              </div>
              <div className="text-xs text-muted-foreground font-semibold">
                out of 30
              </div>
            </div>
          </motion.div>

          {/* Win Rate */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="cartoon-card p-4 stagger-item"
          >
            <div className="flex items-center gap-2 mb-2">
              <Star className="w-4 h-4 text-accent" />
              <span className="text-sm font-bold text-card-foreground">
                Win Rate
              </span>
            </div>
            <div className="text-center">
              <div className="text-2xl font-black text-accent mb-1">
                {Math.round(winRate)}%
              </div>
              <div className="text-xs text-muted-foreground font-semibold">
                {totalGames} games
              </div>
            </div>
          </motion.div>
        </div>

        {/* Win/Loss Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="cartoon-card p-6 stagger-item"
        >
          <h2 className="text-xl font-black text-card-foreground mb-4">
            Performance
          </h2>

          <div className="flex items-center justify-center mb-4">
            <WinLossChart
              wins={gameData.profile.wins}
              losses={gameData.profile.losses}
            />
          </div>

          <div className="flex justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-accent rounded-full"></div>
              <span className="font-semibold text-muted-foreground">Wins</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-destructive rounded-full"></div>
              <span className="font-semibold text-muted-foreground">
                Losses
              </span>
            </div>
          </div>
        </motion.div>

        {/* Game Mode Scores */}
        <div className="grid grid-cols-2 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="cartoon-card p-4 stagger-item"
          >
            <div className="flex items-center gap-2 mb-2">
              <Brain className="w-4 h-4 text-primary" />
              <span className="text-sm font-bold text-card-foreground">
                Memory
              </span>
            </div>
            <div className="text-center">
              <div className="text-2xl font-black text-primary mb-1">
                {gameData.profile.memoryScore}
              </div>
              <div className="text-xs text-muted-foreground font-semibold">
                high score
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="cartoon-card p-4 stagger-item"
          >
            <div className="flex items-center gap-2 mb-2">
              <Eye className="w-4 h-4 text-secondary" />
              <span className="text-sm font-bold text-card-foreground">
                Attention
              </span>
            </div>
            <div className="text-center">
              <div className="text-2xl font-black text-secondary mb-1">
                {gameData.profile.attentionScore}
              </div>
              <div className="text-xs text-muted-foreground font-semibold">
                high score
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

interface ProfileEditorProps {
  nickname: string;
  avatar: string;
  onNicknameChange: (nickname: string) => void;
  onAvatarChange: (avatar: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

function ProfileEditor({
  nickname,
  avatar,
  onNicknameChange,
  onAvatarChange,
  onSave,
  onCancel,
}: ProfileEditorProps) {
  return (
    <div className="space-y-4">
      {/* Avatar selection */}
      <div>
        <label className="block text-sm font-bold text-card-foreground mb-2">
          Choose Avatar
        </label>
        <div className="grid grid-cols-5 gap-2">
          {AVATAR_OPTIONS.map((option) => (
            <button
              key={option}
              onClick={() => onAvatarChange(option)}
              className={`w-10 h-10 rounded-lg border-2 flex items-center justify-center text-lg transition-all duration-200 ${
                avatar === option
                  ? "border-primary bg-primary/20 scale-110"
                  : "border-border hover:border-primary/50 hover:scale-105"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      {/* Nickname input */}
      <div>
        <label className="block text-sm font-bold text-card-foreground mb-2">
          Nickname
        </label>
        <input
          type="text"
          value={nickname}
          onChange={(e) => onNicknameChange(e.target.value)}
          className="w-full px-3 py-2 rounded-xl border-2 border-border bg-input text-card-foreground font-semibold focus:border-primary focus:outline-none"
          placeholder="Enter your nickname"
          maxLength={20}
        />
      </div>

      {/* Action buttons */}
      <div className="flex gap-2">
        <button
          onClick={onSave}
          className="flex-1 cartoon-button py-2 bg-primary text-primary-foreground font-bold text-sm"
        >
          Save
        </button>
        <button
          onClick={onCancel}
          className="flex-1 cartoon-button py-2 bg-muted text-muted-foreground font-bold text-sm"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

interface WinLossChartProps {
  wins: number;
  losses: number;
}

function WinLossChart({ wins, losses }: WinLossChartProps) {
  const total = wins + losses;
  const winPercentage = total > 0 ? (wins / total) * 100 : 50;
  const lossPercentage = total > 0 ? (losses / total) * 100 : 50;

  if (total === 0) {
    return (
      <div className="w-24 h-24 rounded-full border-4 border-muted flex items-center justify-center">
        <span className="text-xs font-bold text-muted-foreground">
          No games
        </span>
      </div>
    );
  }

  return (
    <div className="relative w-24 h-24">
      <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
        {/* Background circle */}
        <circle
          cx="50"
          cy="50"
          r="40"
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          className="text-muted"
        />

        {/* Win arc */}
        <circle
          cx="50"
          cy="50"
          r="40"
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          strokeDasharray={`${(winPercentage / 100) * 251.2} 251.2`}
          className="text-accent"
          strokeLinecap="round"
        />

        {/* Loss arc */}
        <circle
          cx="50"
          cy="50"
          r="40"
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          strokeDasharray={`${(lossPercentage / 100) * 251.2} 251.2`}
          strokeDashoffset={`-${(winPercentage / 100) * 251.2}`}
          className="text-destructive"
          strokeLinecap="round"
        />
      </svg>

      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-lg font-black text-card-foreground">{wins}</div>
        <div className="text-xs text-muted-foreground font-semibold">W</div>
      </div>
    </div>
  );
}
