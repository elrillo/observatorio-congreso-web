"use client"

import { useState, useMemo } from "react"
import { useDashboard, DashboardGate } from "@/components/DashboardProvider"
import { PageHeader } from "@/components/PageHeader"
import { EChart } from "@/components/EChart"
import { BoletinCard } from "@/components/BoletinCard"
import { getCoauthorsForBoletines } from "@/lib/queries"
import { mapStageNumeric, mapStageLabel, valueCounts, categorizeCommission } from "@/lib/legislative"

const STAGE_COLORS: Record<number, string> = {
  0: "#6e20d3",
  1: "#eda744",
  2: "#eda744",
  3: "#3498db",
  4: "#5bc2ba",
}

const PAGE_SIZE = 20

function EstadoContent() {
  const { data, coautores, diputados } = useDashboard()
  const [page, setPage] = useState(0)
  const [searchTracker, setSearchTracker] = useState("")
  const [filterStage, setFilterStage] = useState<number | null>(null)
  const [filterTema, setFilterTema] = useState<string>("Todos")

  const dipMap = useMemo(() => {
    return new Map(diputados.map(d => [d.diputado, d.partido || d.partido_politico || null]))
  }, [diputados])

  const stageData = useMemo(() => {
    if (!data) return { stages: [], withStage: [] }

    const withStage = data.jakMociones.map(m => ({
      ...m,
      progressVal: mapStageNumeric(m.etapa_del_proyecto, m.estado_del_proyecto_de_ley),
      stageLabel: mapStageLabel(mapStageNumeric(m.etapa_del_proyecto, m.estado_del_proyecto_de_ley)),
    }))

    const stages = valueCounts(withStage.map(m => m.stageLabel))

    return { stages, withStage }
  }, [data])

  // Datos ordenados por progreso descendente para la tabla
  const sortedByProgress = useMemo(() => {
    return [...(stageData.withStage || [])].sort((a, b) => b.progressVal - a.progressVal)
  }, [stageData.withStage])

  // Datos filtrados para el rastreador
  const filteredTracker = useMemo(() => {
    let items = sortedByProgress
    if (searchTracker) {
      const q = searchTracker.toLowerCase()
      items = items.filter(m =>
        (m.nombre_iniciativa || "").toLowerCase().includes(q) ||
        (m.n_boletin || "").toLowerCase().includes(q)
      )
    }
    if (filterStage !== null) {
      items = items.filter(m => m.progressVal === filterStage)
    }
    if (filterTema !== "Todos") {
      items = items.filter(m => (m.tematica_asociada || categorizeCommission(m.comision_inicial)) === filterTema)
    }
    return items
  }, [sortedByProgress, searchTracker, filterStage, filterTema])

  // Stacked bar chart option (replaces donut)
  const stackedBarOption = useMemo(() => {
    if (!stageData.stages.length) return {}

    const stageValMap: Record<string, number> = {
      "Archivado / Retirado": 0,
      "Primer Trámite": 1,
      "Segundo Trámite": 2,
      "Tercer Trámite / Mixta": 3,
      "Tramitación Terminada / Ley": 4,
    }

    const total = stageData.stages.reduce((sum, s) => sum + s.count, 0)

    return {
      tooltip: {
        trigger: "axis" as const,
        axisPointer: { type: "shadow" as const },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        formatter: (params: any) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          return params.map((p: any) => `<span style="color:${p.color}">\u25CF</span> ${p.seriesName}: ${p.value} (${total > 0 ? ((p.value / total) * 100).toFixed(1) : 0}%)`).join("<br/>")
        },
      },
      grid: { left: 10, right: 10, top: 10, bottom: 40, containLabel: true },
      xAxis: { type: "value" as const, max: total, show: false },
      yAxis: { type: "category" as const, data: [""], show: false },
      legend: {
        bottom: 0,
        textStyle: { color: "#b0b0b0", fontSize: 11 },
      },
      series: stageData.stages.map(s => ({
        type: "bar" as const,
        stack: "total",
        name: s.name,
        data: [s.count],
        itemStyle: {
          color: STAGE_COLORS[stageValMap[s.name] ?? 1] || "#555",
          borderRadius: 0,
        },
        barWidth: 40,
        label: {
          show: s.count > 5,
          position: "inside" as const,
          color: "#fff",
          fontSize: 11,
          fontWeight: "bold" as const,
          formatter: `${s.count}`,
        },
      })),
    }
  }, [stageData.stages])

  // Temas disponibles para filtro del rastreador
  const availableTemas = useMemo(() => {
    if (!stageData.withStage.length) return []
    const temas = new Set(stageData.withStage.map(m => m.tematica_asociada || categorizeCommission(m.comision_inicial)))
    return Array.from(temas).sort()
  }, [stageData.withStage])

  if (!data) return null

  const totalPages = Math.ceil(filteredTracker.length / PAGE_SIZE)
  const currentItems = filteredTracker.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  return (
    <>
      <PageHeader
        title="Ciclo de Vida Legislativo"
        subtitle="Seguimiento del progreso de las iniciativas de José Antonio Kast."
      />

      {/* Barra 100% apilada de etapas */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-center my-12">
        <div className="lg:col-span-2">
          <h3 className="text-2xl font-serif font-semibold mb-4">Avance Legislativo</h3>
          <p className="text-muted-foreground leading-relaxed text-justify">
            Esta barra muestra la distribución de todos los proyectos según su etapa de tramitación. Permite comparar de un vistazo cuántas mociones avanzaron frente a las que fueron archivadas.
          </p>
        </div>
        <div className="lg:col-span-3">
          <EChart
            option={stackedBarOption}
            style={{ height: "160px" }}
          />
        </div>
      </div>

      <div className="border-t border-white/5 my-8" />

      {/* Tabla de progreso legislativo */}
      <h3 className="font-serif text-xl mb-2 text-center">Progreso por Etapa</h3>
      <p className="text-muted-foreground text-sm text-center mb-6">
        Cada fila muestra el avance de un proyecto a través de las etapas legislativas.
      </p>

      <div className="overflow-x-auto mb-12 bg-[#141414]/60 backdrop-blur-sm border border-white/5 rounded-xl">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 text-muted-foreground uppercase text-xs tracking-wider">
              <th className="py-3 px-3 text-left sticky left-0 bg-[#141414]/90 backdrop-blur-sm z-10">Boletín</th>
              <th className="py-3 px-3 text-left min-w-[200px]">Nombre</th>
              <th className="py-3 px-2 text-center whitespace-nowrap">1er Trámite</th>
              <th className="py-3 px-2 text-center whitespace-nowrap">2do Trámite</th>
              <th className="py-3 px-2 text-center whitespace-nowrap">3er Trámite</th>
              <th className="py-3 px-2 text-center">Ley</th>
            </tr>
          </thead>
          <tbody>
            {sortedByProgress.slice(0, 50).map(m => {
              const v = m.progressVal
              const isArchived = v === 0
              return (
                <tr key={m.n_boletin} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="py-2 px-3 text-[#6e20d3] font-mono text-xs whitespace-nowrap sticky left-0 bg-[#141414]/90 backdrop-blur-sm z-10">
                    {m.n_boletin}
                  </td>
                  <td className="py-2 px-3 text-white/70 text-xs truncate max-w-[300px]" title={m.nombre_iniciativa}>
                    {(m.nombre_iniciativa || "").slice(0, 60)}{(m.nombre_iniciativa || "").length > 60 ? "..." : ""}
                  </td>
                  <td className="py-2 px-2 text-center">
                    {isArchived ? <span className="text-white/20">&mdash;</span> : v >= 1 ? <span className="text-[#5bc2ba] font-bold">&#10003;</span> : <span className="text-white/10">&#9675;</span>}
                  </td>
                  <td className="py-2 px-2 text-center">
                    {isArchived ? <span className="text-white/20">&mdash;</span> : v >= 2 ? <span className="text-[#5bc2ba] font-bold">&#10003;</span> : <span className="text-white/10">&#9675;</span>}
                  </td>
                  <td className="py-2 px-2 text-center">
                    {isArchived ? <span className="text-white/20">&mdash;</span> : v >= 3 ? <span className="text-[#5bc2ba] font-bold">&#10003;</span> : <span className="text-white/10">&#9675;</span>}
                  </td>
                  <td className="py-2 px-2 text-center">
                    {isArchived ? <span className="text-white/20">&mdash;</span> : v >= 4 ? <span className="text-[#5bc2ba] font-bold">&#10003;</span> : <span className="text-white/10">&#9675;</span>}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {sortedByProgress.length > 50 && (
          <p className="text-muted-foreground text-xs text-center py-3">
            Mostrando los primeros 50 de {sortedByProgress.length} proyectos.
          </p>
        )}
      </div>

      <div className="border-t border-white/5 my-8" />

      {/* Rastreador con BoletinCards paginado + filtros */}
      <h3 className="font-serif text-xl mb-2 text-center">Rastreador de Proyectos</h3>
      <p className="text-muted-foreground text-sm text-center mb-6">
        Tarjetas detalladas de cada proyecto con su estado de avance.
      </p>

      {/* Filtros del rastreador */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div>
          <label className="text-xs text-muted-foreground uppercase tracking-wider mb-1 block">Buscar</label>
          <input
            type="text"
            value={searchTracker}
            onChange={e => { setSearchTracker(e.target.value); setPage(0) }}
            placeholder="Nombre o boletín..."
            className="w-full bg-[#141414] border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-white/30 placeholder:text-white/20"
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground uppercase tracking-wider mb-1 block">Etapa</label>
          <select
            value={filterStage === null ? "" : String(filterStage)}
            onChange={e => { setFilterStage(e.target.value === "" ? null : Number(e.target.value)); setPage(0) }}
            className="w-full bg-[#141414] border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-white/30"
          >
            <option value="">Todas</option>
            <option value="0">Archivado / Retirado</option>
            <option value="1">Primer Trámite</option>
            <option value="2">Segundo Trámite</option>
            <option value="3">Tercer Trámite / Mixta</option>
            <option value="4">Tramitación Terminada / Ley</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-muted-foreground uppercase tracking-wider mb-1 block">Temática</label>
          <select
            value={filterTema}
            onChange={e => { setFilterTema(e.target.value); setPage(0) }}
            className="w-full bg-[#141414] border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-white/30"
          >
            <option value="Todos">Todas</option>
            {availableTemas.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>

      <div className="space-y-6">
        {currentItems.map((m, i) => {
          const mCoauthors = getCoauthorsForBoletines(coautores, [m.n_boletin], data.foundName)
          return (
            <BoletinCard
              key={m.n_boletin}
              mocion={m}
              coauthors={mCoauthors}
              dipMap={dipMap}
              index={i}
              fullWidth
              showResumenIA
            />
          )
        })}
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-8">
          <button
            onClick={() => setPage(Math.max(0, page - 1))}
            disabled={page === 0}
            className="px-4 py-2 text-sm bg-[#141414] border border-white/10 rounded-lg disabled:opacity-30 hover:border-white/30 transition-colors"
          >
            &larr; Anterior
          </button>
          <span className="text-sm text-muted-foreground">
            Página {page + 1} de {totalPages}
          </span>
          <button
            onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
            disabled={page >= totalPages - 1}
            className="px-4 py-2 text-sm bg-[#141414] border border-white/10 rounded-lg disabled:opacity-30 hover:border-white/30 transition-colors"
          >
            Siguiente &rarr;
          </button>
        </div>
      )}
    </>
  )
}

export default function EstadoPage() {
  return (
    <DashboardGate>
      <EstadoContent />
    </DashboardGate>
  )
}
