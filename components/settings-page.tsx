"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, FileText, HelpCircle, Share2, X } from "lucide-react";

type ModalType = "privacy" | "terms" | "support" | "share" | null;

export function SettingsPage() {
  const [activeModal, setActiveModal] = useState<ModalType>(null);

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
      description: "Tell friends about One Lead",
    },
  ];

  const handleItemClick = (id: ModalType) => {
    setActiveModal(id);
  };

  const handleCloseModal = () => {
    setActiveModal(null);
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
        <h1 className="text-4xl font-black text-primary mb-2">One Lead</h1>
        <p className="text-muted-foreground font-semibold">
          Settings and Information
        </p>
      </motion.div>

      {/* Settings Items */}
      <div className="max-w-md mx-auto space-y-4">
        {settingsItems.map((item, index) => {
          const Icon = item.icon;
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
                  <h3 className="text-lg font-black text-card-foreground">
                    {item.title}
                  </h3>
                  <p className="text-sm text-muted-foreground font-semibold">
                    {item.description}
                  </p>
                </div>
              </div>
            </motion.button>
          );
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
          <p className="text-sm text-muted-foreground font-semibold mb-2">
            One Lead v1.0
          </p>
          <p className="text-xs text-muted-foreground">
            Train your memory and attention with sports-themed games
          </p>
        </div>
      </motion.div>

      {/* Modal */}
      <AnimatePresence>
        {activeModal && (
          <SettingsModal
            type={activeModal}
            title={
              settingsItems.find((item) => item.id === activeModal)?.title || ""
            }
            onClose={handleCloseModal}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

interface SettingsModalProps {
  type: ModalType;
  title: string;
  onClose: () => void;
}

function SettingsModal({ type, title, onClose }: SettingsModalProps) {
  const LINKS = useMemo(
    () => ({
      share: "https://apps.apple.com/us/app/one-lead/id6752237465",
      privacy:
        "https://www.termsfeed.com/live/462b6481-f813-45b7-91ae-6f226ccec8f9",
      terms:
        "https://www.termsfeed.com/live/457f6ddf-fe36-4ed9-b68a-26a738bf33f5",
      support: "https://ghsy1by8.forms.app/support-form",
    }),
    []
  );

  const appShareText =
    "Train your mind with One Lead — the ultimate memory and attention game!";

  const getModalContent = () => {
    switch (type) {
      case "privacy":
        return (
          <div className="space-y-4 text-sm text-card-foreground">
            <div className="rounded-xl overflow-hidden border border-border">
              <iframe
                src={LINKS.privacy}
                className="w-full h-[65vh] bg-background"
                title="Privacy Policy"
              />
            </div>
          </div>
        );

      case "terms":
        return (
          <div className="space-y-4 text-sm text-card-foreground">
            <div className="rounded-xl overflow-hidden border border-border">
              <iframe
                src={LINKS.terms}
                className="w-full h-[65vh] bg-background"
                title="Terms of Use"
              />
            </div>
          </div>
        );

      case "support":
        return (
          <div className="space-y-4 text-sm text-card-foreground">
            <div className="rounded-xl overflow-hidden border border-border">
              <iframe
                src={LINKS.support}
                className="w-full h-[65vh] bg-background"
                title="Support"
              />
            </div>
          </div>
        );

      case "share":
        return (
          <div className="space-y-4 text-sm text-card-foreground">
            <div className="space-y-4 font-semibold">
              <p>{appShareText}</p>
              <div className="cartoon-card p-3 bg-muted break-all">
                <a
                  href={LINKS.share}
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary underline"
                >
                  {LINKS.share}
                </a>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={async () => {
                    try {
                      if (navigator.share) {
                        await navigator.share({
                          title: "One Lead",
                          text: appShareText,
                          url: LINKS.share,
                        });
                      } else {
                        await navigator.clipboard.writeText(LINKS.share);
                        alert("Link copied to clipboard");
                      }
                    } catch (e) {
                      // ignore cancellation
                    }
                  }}
                  className="cartoon-button py-3 bg-primary text-primary-foreground font-bold"
                >
                  Share
                </button>
                <button
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(LINKS.share);
                      alert("Link copied to clipboard");
                    } catch (e) {
                      // no clipboard access
                    }
                  }}
                  className="cartoon-button py-3 bg-secondary text-secondary-foreground font-bold"
                >
                  Copy Link
                </button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

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
          <button
            onClick={onClose}
            className="cartoon-button p-2 bg-muted hover:bg-muted/80 rounded-xl"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="mb-6">{getModalContent()}</div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="w-full cartoon-button py-3 bg-primary text-primary-foreground font-bold"
        >
          Close
        </button>
      </motion.div>
    </motion.div>
  );
}
