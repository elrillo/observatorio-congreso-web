"use client"

import { useState, useMemo } from "react"
import { useDashboard, DashboardGate } from "@/components/DashboardProvider"
import { PageHeader } from "@/components/PageHeader"
import { formatDateHuman, categorizeCommission } from "@/lib/legislative"
import { parseTags } from "@/components/BoletinCard"
import { motion, AnimatePresence } from "framer-motion"
import type { MocionEnriquecida } from "@/lib/types"

function ExploradorContent() {
  const { data } = useDashboard()
  const [search, setSearch] = useState("")
  const [filterState, setFilterState] = useState("Todos")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [selectedMocion, setSelectedMocion] = useState<MocionEnriquecida | null>(null)

  const allStates = useMemo(() => {
    if (!data) return []
    const states = new Set(data.jakMociones.map(m => m.estado_del_proyecto_de_ley).filter(Boolean))
    return Array.from(states).sort()
  }, [data])

  const filtered = useMemo(() => {
    if (!data) return []
    let results = [...data.jakMociones]

    if (search) {
      const q = search.toLowerCase()
      results = results.filter(m =>
        (m.nombre_iniciativa || "").toLowerCase().includes(q) ||
        (m.n_boletin || "").toLowerCase().includes(q) ||
        (m.resumen_ejecutivo || "").toLowerCase().includes(q)
      )
    }

    if (filterState !== "Todos") {
      results = results.filter(m => m.estado_del_proyecto_de_ley === filterState)
    }

    if (dateFrom) {
      results = results.filter(m => m.fecha_de_ingreso && m.fecha_de_ingreso >= dateFrom)
    }
    if (dateTo) {
      results = results.filter(m => m.fecha_de_ingreso && m.fecha_de_ingreso <= dateTo)
    }

    return results.sort((a, b) => (b.fecha_de_ingreso || "").localeCompare(a.fecha_de_ingreso || ""))
  }, [data, search, filterState, dateFrom, dateTo])

  if (!data) return null

  return (
    <>
      <PageHeader
        title="Buscador Avanzado"
        subtitle="Filtra y busca entre todas las mociones parlamentarias."
      />

      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div>
          <label className="text-xs text-muted-foreground uppercase tracking-wider mb-1 block">Buscar</label>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Ej: Araucanía, impuestos, seguridad..."
            className="w-full bg-[#141414] border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-white/30 placeholder:text-white/20"
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground uppercase tracking-wider mb-1 block">Estado</label>
          <select
            value={filterState}
            onChange={e => setFilterState(e.target.value)}
            className="w-full bg-[#141414] border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-white/30"
          >
            <option value="Todos">Todos</option>
            {allStates.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs text-muted-foreground uppercase tracking-wider mb-1 block">Desde</label>
            <input
              type="date"
              value={dateFrom}
              onChange={e => setDateFrom(e.target.value)}
              className="w-full bg-[#141414] border border-white/10 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-white/30"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground uppercase tracking-wider mb-1 block">Hasta</label>
            <input
              type="date"
              value={dateTo}
              onChange={e => setDateTo(e.target.value)}
              className="w-full bg-[#141414] border border-white/10 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-white/30"
            />
          </div>
        </div>
      </div>

      {/* Resultados */}
      <p className="text-muted-foreground text-sm mb-4">Mostrando {Math.min(filtered.length, 100)} de {filtered.length} proyectos.</p>

      <div className="overflow-x-auto bg-[#141414]/80 backdrop-blur-sm border border-white/5 rounded-xl">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 text-left text-muted-foreground uppercase text-xs tracking-wider">
              <th className="py-3 px-2">Boletín</th>
              <th className="py-3 px-2">Nombre Iniciativa</th>
              <th className="py-3 px-2">Fecha Ingreso</th>
              <th className="py-3 px-2">Estado</th>
              <th className="py-3 px-2">Tipo</th>
              <th className="py-3 px-2 text-center">IA</th>
            </tr>
          </thead>
          <tbody>
            {filtered.slice(0, 100).map(m => (
              <tr key={m.n_boletin} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                <td className="py-2.5 px-2 text-[#6e20d3] font-mono text-xs whitespace-nowrap">{m.n_boletin}</td>
                <td className="py-2.5 px-2">{m.nombre_iniciativa}</td>
                <td className="py-2.5 px-2 text-muted-foreground text-xs whitespace-nowrap">{formatDateHuman(m.fecha_de_ingreso)}</td>
                <td className="py-2.5 px-2 text-muted-foreground text-xs">{m.estado_del_proyecto_de_ley}</td>
                <td className="py-2.5 px-2 text-muted-foreground text-xs">{m.tipo_de_proyecto || "N/A"}</td>
                <td className="py-2.5 px-2 text-center">
                  <button
                    onClick={() => setSelectedMocion(m)}
                    className="text-xs px-2 py-1 rounded-full border border-[#6e20d3]/30 text-[#6e20d3] hover:bg-[#6e20d3]/10 transition-colors"
                  >
                    Resumen IA
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {filtered.length > 100 && (
        <p className="text-muted-foreground text-xs text-center mt-4">
          Mostrando los primeros 100 resultados de {filtered.length}.
        </p>
      )}

      {/* Modal de Resumen IA */}
      <AnimatePresence>
        {selectedMocion && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
            onClick={() => setSelectedMocion(null)}
          >
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.25 }}
              className="relative bg-[#141414] border border-white/10 rounded-xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 lg:p-8"
              onClick={e => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={() => setSelectedMocion(null)}
                className="absolute top-4 right-4 text-white/40 hover:text-white/80 transition-colors text-2xl leading-none"
                aria-label="Cerrar"
              >
                &times;
              </button>

              {/* Header */}
              <div className="mb-6">
                <span className="text-xs font-mono text-white/40 bg-white/5 px-2.5 py-1 rounded">
                  Boletín {selectedMocion.n_boletin}
                </span>
                <h3 className="font-serif text-xl mt-3 leading-snug">
                  {selectedMocion.nombre_iniciativa}
                </h3>
              </div>

              {/* Resumen IA */}
              <div className="mb-6">
                <h4 className="text-xs text-white/30 uppercase tracking-wider mb-2">Resumen</h4>
                <p className="text-white/70 text-sm leading-relaxed text-justify">
                  {selectedMocion.resumen_ia || selectedMocion.resumen_ejecutivo || "Resumen no disponible para esta moción."}
                </p>
              </div>

              {/* Grid de datos IA */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                {/* Tipo de Iniciativa */}
                <div className="bg-white/5 rounded-lg p-4">
                  <h4 className="text-xs text-white/30 uppercase tracking-wider mb-1">Tipo de Iniciativa</h4>
                  <p className="text-white/80 text-sm font-medium">
                    {selectedMocion.tipo_iniciativa_ia || "No clasificado"}
                  </p>
                </div>

                {/* Temática */}
                <div className="bg-white/5 rounded-lg p-4">
                  <h4 className="text-xs text-white/30 uppercase tracking-wider mb-1">Temática</h4>
                  <p className="text-white/80 text-sm font-medium">
                    {selectedMocion.tematica_asociada || categorizeCommission(selectedMocion.comision_inicial)}
                  </p>
                </div>
              </div>

              {/* Sentimiento Score */}
              {selectedMocion.sentimiento_score != null && (
                <div className="mb-6">
                  <h4 className="text-xs text-white/30 uppercase tracking-wider mb-2">Sentimiento</h4>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${((selectedMocion.sentimiento_score + 1) / 2) * 100}%`,
                          background: selectedMocion.sentimiento_score > 0 ? "#5bc2ba" : selectedMocion.sentimiento_score < -0.3 ? "#6e20d3" : "#eda744",
                        }}
                      />
                    </div>
                    <span className="text-xs text-white/50 font-mono w-12 text-right">
                      {selectedMocion.sentimiento_score.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-[10px] text-white/20">-1.0 Negativo</span>
                    <span className="text-[10px] text-white/20">+1.0 Positivo</span>
                  </div>
                </div>
              )}

              {/* Tags */}
              {parseTags(selectedMocion.tags_temas).length > 0 && (
                <div>
                  <h4 className="text-xs text-white/30 uppercase tracking-wider mb-2">Etiquetas</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {parseTags(selectedMocion.tags_temas).map((tag, i) => (
                      <span
                        key={i}
                        className="text-[11px] px-2 py-0.5 rounded bg-[#6e20d3]/10 text-[#6e20d3] border border-[#6e20d3]/20"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default function ExploradorPage() {
  return (
    <DashboardGate>
      <ExploradorContent />
    </DashboardGate>
  )
}
