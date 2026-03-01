"use client"

import { motion } from "framer-motion"
import { formatDateHuman, mapStageNumeric, mapStageLabel, categorizeCommission, SUCCESS_PATTERN } from "@/lib/legislative"
import { normalizeParty, getPartyColor } from "@/lib/parties"
import type { MocionEnriquecida, Coautor } from "@/lib/types"

/** Parsea tags_temas que puede venir como string JSON o array */
export function parseTags(tags: string | string[] | null | undefined): string[] {
  if (!tags) return []
  if (Array.isArray(tags)) return tags
  try {
    const parsed = JSON.parse(tags)
    return Array.isArray(parsed) ? parsed : [String(parsed)]
  } catch {
    return tags.split(",").map(t => t.trim()).filter(Boolean)
  }
}

/** Colores de acento por tipo de iniciativa IA */
function getTypeColor(tipo: string | null): string {
  if (!tipo) return "#95A5A6"
  const t = tipo.toLowerCase()
  if (t.includes("punitiva")) return "#6e20d3"
  if (t.includes("propositiva")) return "#5bc2ba"
  if (t.includes("administrativa")) return "#3498db"
  return "#95A5A6"
}

/** Icono SVG del tipo de iniciativa */
function TypeIcon({ tipo }: { tipo: string | null }) {
  const color = getTypeColor(tipo)
  const t = (tipo || "").toLowerCase()

  if (t.includes("punitiva")) {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    )
  }
  if (t.includes("propositiva")) {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 18l6-6-6-6" />
      </svg>
    )
  }
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="16" />
      <line x1="8" y1="12" x2="16" y2="12" />
    </svg>
  )
}

/** Gauge circular compacto */
export function MiniGauge({ value, max = 4 }: { value: number; max?: number }) {
  const pct = value === 0 ? 5 : (value / max) * 100
  const color = value >= 4 ? "#5bc2ba" : value === 0 ? "#6e20d3" : "#3498db"
  const circumference = 2 * Math.PI * 28
  const dashLength = (pct / 100) * circumference

  return (
    <div className="relative w-20 h-20 flex-shrink-0">
      <svg viewBox="0 0 64 64" className="w-full h-full -rotate-90">
        <circle cx="32" cy="32" r="28" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="5" />
        <circle
          cx="32" cy="32" r="28"
          fill="none"
          stroke={color}
          strokeWidth="5"
          strokeDasharray={`${dashLength} ${circumference - dashLength}`}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-sm font-serif font-bold">{Math.round(pct)}%</span>
      </div>
    </div>
  )
}

interface BoletinCardProps {
  mocion: MocionEnriquecida
  coauthors: Coautor[]
  dipMap: Map<string, string | null>
  index: number
  fullWidth?: boolean
  showResumenIA?: boolean
}

/** Tarjeta reutilizable para un boletín/moción */
export function BoletinCard({
  mocion,
  coauthors,
  dipMap,
  index,
  fullWidth = false,
  showResumenIA = true,
}: BoletinCardProps) {
  const progressVal = mapStageNumeric(mocion.etapa_del_proyecto, mocion.estado_del_proyecto_de_ley)
  const tema = categorizeCommission(mocion.comision_inicial)
  const tags = parseTags(mocion.tags_temas)
  const isLey = SUCCESS_PATTERN.test(mocion.estado_del_proyecto_de_ley || "")

  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className={`relative bg-[#141414]/80 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden hover:border-white/20 transition-all duration-300 group ${fullWidth ? 'col-span-full' : ''}`}
    >
      {/* Barra superior de acento */}
      <div
        className="h-1 w-full"
        style={{ background: isLey ? "#5bc2ba" : getTypeColor(mocion.tipo_iniciativa_ia || null) }}
      />

      <div className="p-6 lg:p-8">
        {/* Header: boletín + estado + gauge */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs font-mono text-white/40 bg-white/5 px-2.5 py-1 rounded">
              Boletín {mocion.n_boletin}
            </span>
            {isLey && (
              <span className="text-xs font-semibold text-[#5bc2ba] bg-[#5bc2ba]/10 px-2.5 py-1 rounded-full flex items-center gap-1">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Ley
              </span>
            )}
          </div>
          <MiniGauge value={progressVal} />
        </div>

        {/* Título */}
        <h3 className="font-serif text-lg lg:text-xl leading-snug mb-3 group-hover:text-white/95 transition-colors">
          {mocion.nombre_iniciativa}
        </h3>

        {/* Resumen ejecutivo + botón Resumen IA */}
        <div className="mb-5">
          <p className="text-white/50 text-sm leading-relaxed line-clamp-3 mb-2 text-justify">
            {mocion.resumen_ejecutivo || "Resumen pendiente."}
          </p>
          {showResumenIA && (
            <button
              className="text-xs px-3 py-1.5 rounded-full border border-[#6e20d3]/30 text-[#6e20d3] hover:bg-[#6e20d3]/10 transition-colors cursor-not-allowed opacity-70"
              disabled
              title="Próximamente"
            >
              Resumen IA
            </button>
          )}
        </div>

        {/* Metadatos en grid */}
        <div className={`grid ${fullWidth ? 'grid-cols-2 lg:grid-cols-4' : 'grid-cols-2'} gap-x-6 gap-y-3 mb-5 text-sm`}>
          <div>
            <span className="text-white/30 text-xs uppercase tracking-wider block mb-0.5">Fecha Ingreso</span>
            <span className="text-white/70">{formatDateHuman(mocion.fecha_de_ingreso)}</span>
          </div>
          <div>
            <span className="text-white/30 text-xs uppercase tracking-wider block mb-0.5">Temática</span>
            <span className="text-white/70">{tema}</span>
          </div>
          <div>
            <span className="text-white/30 text-xs uppercase tracking-wider block mb-0.5">Estado</span>
            <span className="text-white/70">{mocion.estado_del_proyecto_de_ley}</span>
          </div>
          <div>
            <span className="text-white/30 text-xs uppercase tracking-wider block mb-0.5">Progreso</span>
            <span className="text-white/70">{mapStageLabel(progressVal)}</span>
          </div>
          {mocion.tipo_iniciativa_ia && (
            <div>
              <span className="text-white/30 text-xs uppercase tracking-wider block mb-0.5">Tipo IA</span>
              <span className="flex items-center gap-1.5 text-white/70">
                <TypeIcon tipo={mocion.tipo_iniciativa_ia} />
                {mocion.tipo_iniciativa_ia}
              </span>
            </div>
          )}
          {mocion.publicado_en_diario_oficial && (
            <div>
              <span className="text-white/30 text-xs uppercase tracking-wider block mb-0.5">Publicado</span>
              <span className="text-[#5bc2ba]">{formatDateHuman(mocion.publicado_en_diario_oficial)}</span>
            </div>
          )}
        </div>

        {/* Coautores */}
        <div className="mb-5">
          <span className="text-white/30 text-xs uppercase tracking-wider block mb-2">
            Coautores ({coauthors.length})
          </span>
          <div className="flex flex-wrap gap-1.5">
            {coauthors.length > 0 ? (
              coauthors.map(c => {
                const party = normalizeParty(dipMap.get(c.diputado) || null)
                const color = getPartyColor(party)
                return (
                  <span
                    key={c.diputado}
                    className="text-xs px-2.5 py-1 rounded-full border transition-colors hover:bg-white/5"
                    style={{ borderColor: `${color}60`, color }}
                  >
                    {c.diputado.split(" ").slice(0, 2).join(" ")}
                    <span className="opacity-60 ml-1">({party})</span>
                  </span>
                )
              })
            ) : (
              <span className="text-white/30 text-xs">Sin coautores registrados</span>
            )}
          </div>
        </div>

        {/* Tags temáticos */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {tags.map((tag, i) => (
              <span
                key={i}
                className="text-[11px] px-2 py-0.5 rounded bg-white/5 text-white/40 border border-white/5"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.article>
  )
}
