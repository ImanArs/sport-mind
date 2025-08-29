"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Home, Target, Clock, Settings } from "lucide-react"

type TabType = "home" | "games" | "timeline" | "settings"

interface GameLayoutProps {
  children: React.ReactNode
  currentTab: TabType
  onTabChange: (tab: TabType) => void
}

export function GameLayout({ children, currentTab, onTabChange }: GameLayoutProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const tabs = [
    { id: "home" as TabType, icon: Home, label: "Home" },
    { id: "games" as TabType, icon: Target, label: "Games" },
    { id: "timeline" as TabType, icon: Clock, label: "Timeline" },
    { id: "settings" as TabType, icon: Settings, label: "Settings" },
  ]

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Main content area */}
      <main className="flex-1 pb-20 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="h-full"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t-2 border-border">
        <div className="flex items-center justify-around py-2 px-4 max-w-md mx-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = currentTab === tab.id

            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className="relative flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-300"
              >
                {/* Background orb with spring animation */}
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 30,
                      }}
                      className="absolute inset-0 bg-primary rounded-xl"
                    />
                  )}
                </AnimatePresence>

                {/* Icon */}
                <Icon
                  className={`w-6 h-6 relative z-10 transition-colors duration-200 ${
                    isActive ? "text-primary-foreground" : "text-muted-foreground"
                  }`}
                />

                {/* Label - hidden for icon-only design */}
                <span className="sr-only">{tab.label}</span>
              </button>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
