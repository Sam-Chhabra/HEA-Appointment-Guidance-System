"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

// Abstract monochrome animated graphics for each card

const TypingAnimation = () => (
  <div className="flex space-x-2 items-center justify-center h-full w-full opacity-70">
    <motion.div
      className="w-16 h-4 bg-foreground rounded-full"
      animate={{ width: ["1rem", "4rem", "1rem"] }}
      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
    />
    <motion.div
      className="w-2 h-4 bg-foreground rounded-sm"
      animate={{ opacity: [1, 0, 1] }}
      transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
    />
  </div>
)

const ScanningAnimation = () => (
  <div className="relative w-full h-full flex items-center justify-center opacity-70 overflow-hidden rounded-xl border border-border">
    <div className="grid grid-cols-4 gap-2 w-3/4 h-3/4">
      {[...Array(16)].map((_, i) => (
        <div key={i} className="bg-foreground/20 rounded-sm" />
      ))}
    </div>
    <motion.div
      className="absolute top-0 left-0 w-full h-1 bg-foreground shadow-[0_0_15px_rgba(255,255,255,0.8)]"
      animate={{ top: ["0%", "100%", "0%"] }}
      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
    />
  </div>
)

const NodesAnimation = () => (
  <div className="relative w-full h-full flex items-center justify-center opacity-70">
    <motion.div
      className="absolute w-12 h-12 border-2 border-foreground rounded-full"
      animate={{ scale: [1, 1.5, 1], opacity: [1, 0, 1] }}
      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
    />
    <motion.div
      className="absolute w-24 h-24 border border-foreground/50 rounded-full"
      animate={{ rotate: 360 }}
      transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
    >
      <div className="absolute top-0 left-1/2 w-3 h-3 -translate-x-1/2 -translate-y-1/2 bg-foreground rounded-full" />
    </motion.div>
  </div>
)

const CalendarAnimation = () => (
  <div className="flex flex-col items-center justify-center h-full w-full opacity-70 gap-2">
    <div className="w-20 h-4 bg-foreground rounded-t-md" />
    <div className="w-24 h-16 border-2 border-foreground rounded-b-md flex items-center justify-center">
      <motion.div
        className="w-8 h-8 bg-foreground rounded-full flex items-center justify-center"
        initial={{ scale: 0 }}
        animate={{ scale: [0, 1.2, 1] }}
        transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 1 }}
      >
        <svg className="w-4 h-4 text-background" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </motion.div>
    </div>
  </div>
)

const BENTO_ITEMS = [
  {
    title: "Describe Symptoms",
    description: "Tell us how you're feeling in your own words. We extract the key medical indicators for triage.",
    graphic: <TypingAnimation />,
    className: "md:col-span-2",
  },
  {
    title: "Instant Triage",
    description: "Our intelligent engine analyzes your input instantly to suggest the right department.",
    graphic: <ScanningAnimation />,
    className: "md:col-span-1",
  },
  {
    title: "Smart Matching",
    description: "Precision-guided algorithms match you with specialists suited to your specific needs.",
    graphic: <NodesAnimation />,
    className: "md:col-span-1",
  },
  {
    title: "Book Instantly",
    description: "View doctor availability in real-time, pick a time slot, and confirm your appointment in one click.",
    graphic: <CalendarAnimation />,
    className: "md:col-span-2",
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
}

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15,
    },
  },
}

export function BentoGrid() {
  return (
    <section className="flex flex-col items-start w-full max-w-5xl mx-auto py-24">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={containerVariants}
        className="mb-12"
      >
        <motion.span variants={itemVariants} className="inline-block px-3 py-1 mb-4 text-xs font-semibold tracking-widest text-primary uppercase bg-primary/10 rounded-full">
          Platform
        </motion.span>
        <motion.h2 variants={itemVariants} className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
          A smarter way to heal.
        </motion.h2>
        <motion.p variants={itemVariants} className="text-lg text-muted-foreground max-w-2xl">
          Navigating healthcare is already tough. We make finding the right care simple, fast, and highly accurate.
        </motion.p>
      </motion.div>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={containerVariants}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full"
      >
        {BENTO_ITEMS.map((item, index) => (
          <motion.div
            key={index}
            variants={itemVariants}
            whileHover={{ y: -5 }}
            className={cn(
              "group relative flex flex-col overflow-hidden rounded-3xl bg-secondary/30 border border-border/50 backdrop-blur-sm shadow-sm transition-all duration-300",
              item.className
            )}
          >
            {/* Animated Graphic Area */}
            <div className="h-48 w-full bg-background/50 border-b border-border/50 flex items-center justify-center p-6">
              <div className="w-full h-full transition-transform duration-500 group-hover:scale-105">
                {item.graphic}
              </div>
            </div>

            {/* Text Area */}
            <div className="p-8 mt-auto flex flex-col justify-end">
              <h3 className="text-xl font-bold mb-2 text-foreground">{item.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{item.description}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  )
}
