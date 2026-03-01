"use client"

import { motion } from "framer-motion"

interface KpiCardProps {
  title: string
  value: string | number
  subtitle?: string
}

export function KpiCard({ title, value, subtitle }: KpiCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="text-center py-4"
    >
      <p className="text-xs uppercase tracking-[2px] text-muted-foreground mb-2">
        {title}
      </p>
      <p className={`font-serif font-bold text-white drop-shadow-md leading-tight ${
        String(value).length <= 6 ? 'text-5xl' :
        String(value).length <= 12 ? 'text-3xl' :
        String(value).length <= 20 ? 'text-2xl' : 'text-xl'
      }`}>
        {value}
      </p>
      {subtitle && (
        <p className="text-xs text-muted-foreground mt-3 uppercase tracking-wider">
          {subtitle}
        </p>
      )}
    </motion.div>
  )
}
