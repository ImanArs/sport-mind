"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Shield, FileText, HelpCircle, Share2, X } from "lucide-react"

type ModalType = "privacy" | "terms" | "support" | "share" | null

export function SettingsPage() {
  const [activeModal, setActiveModal] = useState<ModalType>(null)

  const settingsItems = [
    {
      id: "privacy" as const,
      title: "Privacy Policy",
      icon: Shield,
      description: "How we protect your data",
    },
    {
      id: "terms" as const,
      title: "Terms of Use",
      icon: FileText,
      description: "Rules and guidelines",
    },
    {
      id: "support" as const,
      title: "Support",
      icon: HelpCircle,
      description: "Get help and contact us",
    },
    {
      id: "share" as const,
      title: "Share",
      icon: Share2,
      description: "Tell friends about SportMind",
    },
  ]

  const handleItemClick = (id: ModalType) => {
    setActiveModal(id)
  }

  const handleCloseModal = () => {
    setActiveModal(null)
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
        <p className="text-muted-foreground font-semibold">Settings and Information</p>
      </motion.div>

      {/* Settings Items */}
      <div className="max-w-md mx-auto space-y-4">
        {settingsItems.map((item, index) => {
          const Icon = item.icon
          return (
            <motion.button
              key={item.id}
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              onClick={() => handleItemClick(item.id)}
              className="w-full cartoon-card p-6 hover:scale-105 transition-transform duration-200 stagger-item"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-b from-primary to-primary/80 border-2 border-border flex items-center justify-center">
                  <Icon className="w-6 h-6 text-primary-foreground" />
                </div>
                <div className="flex-1 text-left">
                  <h3 className="text-lg font-black text-card-foreground">{item.title}</h3>
                  <p className="text-sm text-muted-foreground font-semibold">{item.description}</p>
                </div>
              </div>
            </motion.button>
          )
        })}
      </div>

      {/* App Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="mt-8 text-center"
      >
        <div className="cartoon-card p-4 max-w-md mx-auto">
          <p className="text-sm text-muted-foreground font-semibold mb-2">SportMind v1.0</p>
          <p className="text-xs text-muted-foreground">Train your memory and attention with sports-themed games</p>
        </div>
      </motion.div>

      {/* Modal */}
      <AnimatePresence>
        {activeModal && (
          <SettingsModal
            type={activeModal}
            title={settingsItems.find((item) => item.id === activeModal)?.title || ""}
            onClose={handleCloseModal}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

interface SettingsModalProps {
  type: ModalType
  title: string
  onClose: () => void
}

function SettingsModal({ type, title, onClose }: SettingsModalProps) {
  const getModalContent = () => {
    switch (type) {
      case "privacy":
        return (
          <div className="space-y-4 text-sm text-card-foreground">
            <h3 className="text-lg font-bold">Privacy Policy</h3>
            <div className="space-y-3 font-semibold">
              <p>
                <strong>Data Collection:</strong> SportMind stores your game progress, scores, and preferences locally
                on your device. We do not collect or transmit personal data to external servers.
              </p>
              <p>
                <strong>Local Storage:</strong> Your game data, including levels completed, high scores, and profile
                information, is saved in your browser's local storage.
              </p>
              <p>
                <strong>No Tracking:</strong> We do not use cookies, analytics, or tracking technologies to monitor your
                gameplay or behavior.
              </p>
              <p>
                <strong>Data Security:</strong> Since all data is stored locally, you have full control over your
                information. Clearing your browser data will remove all game progress.
              </p>
            </div>
          </div>
        )

      case "terms":
        return (
          <div className="space-y-4 text-sm text-card-foreground">
            <h3 className="text-lg font-bold">Terms of Use</h3>
            <div className="space-y-3 font-semibold">
              <p>
                <strong>Game Usage:</strong> SportMind is provided for entertainment and educational purposes. Use the
                app responsibly and at your own discretion.
              </p>
              <p>
                <strong>Content:</strong> All game content, including icons and designs, are used under appropriate
                licenses. No copyrighted material is intentionally included.
              </p>
              <p>
                <strong>Fair Play:</strong> Play games honestly and enjoy the challenge. The app is designed to help
                improve memory and attention skills.
              </p>
              <p>
                <strong>Modifications:</strong> These terms may be updated. Continued use of the app constitutes
                acceptance of any changes.
              </p>
            </div>
          </div>
        )

      case "support":
        return (
          <div className="space-y-4 text-sm text-card-foreground">
            <h3 className="text-lg font-bold">Support</h3>
            <div className="space-y-3 font-semibold">
              <p>
                <strong>How to Play:</strong> Complete levels by matching cards in memory games or finding target icons
                in attention games. Progress through 30 levels and play infinite modes.
              </p>
              <p>
                <strong>Scoring:</strong> Earn stars based on performance. Complete stages in infinite modes to gain
                points and advance through leagues.
              </p>
              <p>
                <strong>Troubleshooting:</strong> If you experience issues, try refreshing the page. Your progress is
                automatically saved locally.
              </p>
              <p>
                <strong>Reset Progress:</strong> To start over, clear your browser's local storage for this site. This
                will remove all saved progress.
              </p>
            </div>
          </div>
        )

      case "share":
        return (
          <div className="space-y-4 text-sm text-card-foreground">
            <h3 className="text-lg font-bold">Share SportMind</h3>
            <div className="space-y-3 font-semibold">
              <p>
                <strong>Tell Your Friends:</strong> SportMind is a fun way to train memory and attention skills with
                sports-themed games.
              </p>
              <p>
                <strong>Challenge Others:</strong> Compare your high scores and league rankings with friends and family.
              </p>
              <p>
                <strong>Educational Benefits:</strong> Regular play can help improve cognitive skills, memory retention,
                and visual attention.
              </p>
              <div className="cartoon-card p-3 bg-muted">
                <p className="text-center font-bold text-muted-foreground">
                  "Train your mind with SportMind - the ultimate memory and attention game!"
                </p>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-background/90 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: 50 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="cartoon-card p-6 max-w-md w-full max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-black text-card-foreground">{title}</h2>
          <button onClick={onClose} className="cartoon-button p-2 bg-muted hover:bg-muted/80 rounded-xl">
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="mb-6">{getModalContent()}</div>

        {/* Close button */}
        <button onClick={onClose} className="w-full cartoon-button py-3 bg-primary text-primary-foreground font-bold">
          Close
        </button>
      </motion.div>
    </motion.div>
  )
}
