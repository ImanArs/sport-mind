"use client"

import { useState, useEffect } from "react"
import { GameLayout } from "@/components/game-layout"
import { LevelGrid } from "@/components/level-grid"
import { GameModes } from "@/components/game-modes"
import { UserProfile } from "@/components/user-profile"
import { SettingsPage } from "@/components/settings-page"
import { initializeGameData, type GameStats } from "@/lib/game-utils"

type TabType = "home" | "games" | "timeline" | "settings"

export default function SportMindApp() {
  const [currentTab, setCurrentTab] = useState<TabType>("home")
  const [gameData, setGameData] = useState<GameStats | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Initialize with default nickname - will be customizable in profile
    const data = initializeGameData("Player")
    setGameData(data)
  }, [])

  if (!mounted || !gameData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-bold text-foreground">Loading One Lead...</h2>
        </div>
      </div>
    )
  }

  const renderContent = () => {
    switch (currentTab) {
      case "home":
        return <LevelGrid gameData={gameData} onGameDataUpdate={setGameData} />
      case "games":
        return <GameModes gameData={gameData} onGameDataUpdate={setGameData} />
      case "timeline":
        return <UserProfile gameData={gameData} onGameDataUpdate={setGameData} />
      case "settings":
        return <SettingsPage />
      default:
        return <LevelGrid gameData={gameData} onGameDataUpdate={setGameData} />
    }
  }

  return (
    <GameLayout currentTab={currentTab} onTabChange={setCurrentTab}>
      {renderContent()}
    </GameLayout>
  )
}
