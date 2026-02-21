"use client"

import { useState, useMemo } from "react"
import { useDashboard, DashboardGate } from "@/components/DashboardProvider"
import { PageHeader } from "@/components/PageHeader"
import { EChart } from "@/components/EChart"
import { getCoauthorsForBoletines } from "@/lib/queries"
import { normalizeParty, getPartyColor, PARTY_COLORS } from "@/lib/parties"
import { formatDateHuman } from "@/lib/legislative"
import { motion, AnimatePresence } from "framer-motion"

function AlianzasContent() {
  const { data, coautores, diputados } = useDashboard()
  const [selectedAlly, setSelectedAlly] = useState<string | null>(null)

  const networkData = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!data) return { partyData: [] as { name: string; count: number; fill: string }[], topAllies: [] as { diputado: string; partido: string; count: number }[], allAllies: [] as { diputado: string; partido: string; count: number }[], graphOption: {} as any }

    const jakCoauthors = getCoauthorsForBoletines(coautores, data.jakBoletinIds, data.foundName)
    const dipMap = new Map(diputados.map(d => [d.diputado, d.partido || d.partido_politico || null]))

    // Agrupar por diputado con partido
    const allyMap: Record<string, { diputado: string; partido: string; count: number }> = {}
    for (const c of jakCoauthors) {
      if (!allyMap[c.diputado]) {
        const rawParty = dipMap.get(c.diputado) || null
        allyMap[c.diputado] = { diputado: c.diputado, partido: normalizeParty(rawParty), count: 0 }
      }
      allyMap[c.diputado].count++
    }

    const allAllies = Object.values(allyMap).sort((a, b) => b.count - a.count)
    const topAllies = allAllies.slice(0, 20)

    // Agrupar por partido
    const partyAgg: Record<string, number> = {}
    for (const a of allAllies) {
      partyAgg[a.partido] = (partyAgg[a.partido] || 0) + a.count
    }
    const partyData = Object.entries(partyAgg)
      .map(([name, count]) => ({ name, count, fill: getPartyColor(name) }))
      .sort((a, b) => b.count - a.count)

    // --- Construir datos del grafo ECharts ---
    const categories = [
      { name: "JAK" },
      { name: "Partidos" },
      { name: "Diputados" },
    ]

    // Nodos
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const nodes: any[] = []
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const links: any[] = []

    // Nodo central: JAK
    nodes.push({
      name: "José Antonio Kast",
      symbolSize: 50,
      category: 0,
      itemStyle: { color: "#ffffff" },
      label: {
        show: true,
        fontSize: 13,
        fontFamily: "Playfair Display, serif",
        fontWeight: "bold",
        color: "#ffffff",
      },
    })

    // Nodos de partidos + edges JAK → Partido
    for (const p of partyData) {
      const sz = 20 + Math.log(p.count + 1) * 8
      nodes.push({
        name: p.name,
        symbolSize: Math.round(sz),
        category: 1,
        itemStyle: { color: PARTY_COLORS[p.name] || "#95A5A6" },
        label: {
          show: true,
          fontSize: 11,
          color: PARTY_COLORS[p.name] || "#95A5A6",
        },
        value: p.count,
      })
      links.push({
        source: "José Antonio Kast",
        target: p.name,
        lineStyle: { width: 2, curveness: 0.1, color: "rgba(255,255,255,0.15)" },
      })
    }

    // Nodos de diputados top 30 + edges Partido → Diputado
    const topDeps = allAllies.slice(0, 30)
    for (const dep of topDeps) {
      const sz = 8 + Math.log(dep.count + 1) * 4
      nodes.push({
        name: dep.diputado,
        symbolSize: Math.round(sz),
        category: 2,
        itemStyle: { color: (PARTY_COLORS[dep.partido] || "#95A5A6") + "CC" },
        label: {
          show: dep.count >= 10,
          fontSize: 9,
          color: "#b0b0b0",
        },
        value: dep.count,
      })
      links.push({
        source: dep.partido,
        target: dep.diputado,
        lineStyle: { width: 0.5, color: "#444", curveness: 0.2 },
      })
    }

    const graphOption = {
      tooltip: {
        trigger: "item" as const,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        formatter: (params: any) => {
          if (params.dataType === "node") {
            const cat = categories[params.data.category]?.name || ""
            if (cat === "JAK") return `<strong>José Antonio Kast Rist</strong><br/>Diputado objetivo`
            if (cat === "Partidos") return `<strong>${params.name}</strong><br/>Partido<br/>${params.data.value} coautorías`
            return `<strong>${params.name}</strong><br/>${cat}<br/>${params.data.value} proyectos`
          }
          return ""
        },
      },
      legend: {
        data: categories.map(c => c.name),
        bottom: 10,
        textStyle: { color: "#b0b0b0", fontSize: 12 },
      },
      animationDuration: 1500,
      animationEasingUpdate: "quinticInOut" as const,
      series: [
        {
          type: "graph",
          layout: "force",
          data: nodes,
          links,
          categories,
          roam: true,
          draggable: true,
          force: {
            repulsion: 300,
            gravity: 0.1,
            edgeLength: [80, 200],
            friction: 0.6,
          },
          emphasis: {
            focus: "adjacency",
            lineStyle: { width: 3 },
          },
          lineStyle: {
            opacity: 0.6,
          },
        },
      ],
    }

    return { partyData, topAllies, allAllies, graphOption }
  }, [data, coautores, diputados])

  // Detalle del aliado seleccionado: proyectos en común
  const allyDetail = useMemo(() => {
    if (!selectedAlly || !data) return null

    const dipMap = new Map(diputados.map(d => [d.diputado, d.partido || d.partido_politico || null]))
    const party = normalizeParty(dipMap.get(selectedAlly) || null)
    const allyInfo = networkData.allAllies.find(a => a.diputado === selectedAlly)

    // Buscar boletines donde tanto JAK como el aliado son coautores
    const allyBoletinIds = new Set(
      coautores
        .filter(c => c.diputado === selectedAlly)
        .map(c => c.n_boletin)
    )

    const commonProjects = data.jakMociones
      .filter(m => allyBoletinIds.has(m.n_boletin))
      .sort((a, b) => (b.fecha_de_ingreso || "").localeCompare(a.fecha_de_ingreso || ""))

    return {
      diputado: selectedAlly,
      partido: party,
      count: allyInfo?.count || 0,
      projects: commonProjects,
    }
  }, [selectedAlly, data, coautores, diputados, networkData.allAllies])

  if (!data) return null

  return (
    <>
      <PageHeader
        title="Red de Influencia Política"
        subtitle="Grafo de coautorías: análisis de las alianzas parlamentarias de José Antonio Kast."
      />

      {/* Grafo de red */}
      <div className="my-12">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start mb-8">
          <div className="lg:col-span-2">
            <h3 className="text-2xl font-serif font-semibold mb-4">Mapa de Alianzas</h3>
            <p className="text-muted-foreground leading-relaxed">
              Este grafo interactivo visualiza la red de coautorías legislativas. El nodo central representa a JAK, los nodos medianos a los partidos políticos y los pequeños a los diputados individuales. El tamaño refleja la intensidad de la colaboración.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-3 text-sm">
              Puedes arrastrar nodos, hacer zoom y pasar el cursor para ver detalles.
            </p>
          </div>
          <div className="lg:col-span-3 bg-[#141414]/60 backdrop-blur-sm border border-white/5 rounded-xl p-4">
            <EChart
              option={networkData.graphOption}
              style={{ height: "600px" }}
            />
          </div>
        </div>
      </div>

      <div className="border-t border-white/5 my-8" />

      {/* Top 20 aliados */}
      <h3 className="font-serif text-xl mb-6 text-center">Top 20 Aliados Legislativos</h3>
      <p className="text-muted-foreground text-sm text-center mb-6">
        Haz clic en un aliado para ver los proyectos coautorados en común.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {networkData.topAllies.map((ally, i) => (
          <motion.div
            key={ally.diputado}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.03 }}
            onClick={() => setSelectedAlly(selectedAlly === ally.diputado ? null : ally.diputado)}
            className={`bg-[#141414]/80 backdrop-blur-sm border rounded-lg p-4 flex items-center gap-3 cursor-pointer transition-all duration-200 hover:border-white/20 ${
              selectedAlly === ally.diputado
                ? "border-[#c0392b]/50 bg-[#c0392b]/5"
                : "border-white/5"
            }`}
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
              style={{ backgroundColor: getPartyColor(ally.partido) + "33", color: getPartyColor(ally.partido) }}
            >
              {i + 1}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{ally.diputado}</p>
              <p className="text-xs text-muted-foreground">
                {ally.partido} &middot; {ally.count} proyectos
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Panel de detalle del aliado */}
      <AnimatePresence>
        {allyDetail && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden mt-6"
          >
            <div className="bg-[#141414]/90 backdrop-blur-sm border border-white/10 rounded-xl p-6 relative">
              {/* Botón cerrar */}
              <button
                onClick={() => setSelectedAlly(null)}
                className="absolute top-4 right-4 text-white/40 hover:text-white/80 transition-colors text-xl leading-none"
                aria-label="Cerrar"
              >
                &times;
              </button>

              {/* Header del aliado */}
              <div className="flex items-center gap-3 mb-5">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: getPartyColor(allyDetail.partido) + "33" }}
                >
                  <span style={{ color: getPartyColor(allyDetail.partido) }} className="text-sm font-bold">
                    {allyDetail.partido.slice(0, 2)}
                  </span>
                </div>
                <div>
                  <h4 className="font-serif text-lg font-semibold">{allyDetail.diputado}</h4>
                  <p className="text-sm text-muted-foreground">
                    <span style={{ color: getPartyColor(allyDetail.partido) }}>{allyDetail.partido}</span>
                    {" "}&middot; {allyDetail.count} proyectos en común
                  </p>
                </div>
              </div>

              {/* Lista de proyectos en común */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10 text-left text-muted-foreground uppercase text-xs tracking-wider">
                      <th className="py-2 px-2">Boletín</th>
                      <th className="py-2 px-2">Nombre Iniciativa</th>
                      <th className="py-2 px-2">Fecha</th>
                      <th className="py-2 px-2">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allyDetail.projects.map(p => (
                      <tr key={p.n_boletin} className="border-b border-white/5 hover:bg-white/5">
                        <td className="py-2 px-2 text-[#c0392b] font-mono text-xs whitespace-nowrap">{p.n_boletin}</td>
                        <td className="py-2 px-2 text-white/80 text-xs">{(p.nombre_iniciativa || "").slice(0, 100)}{(p.nombre_iniciativa || "").length > 100 ? "..." : ""}</td>
                        <td className="py-2 px-2 text-muted-foreground text-xs whitespace-nowrap">{formatDateHuman(p.fecha_de_ingreso)}</td>
                        <td className="py-2 px-2 text-muted-foreground text-xs">{p.estado_del_proyecto_de_ley}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {allyDetail.projects.length === 0 && (
                <p className="text-muted-foreground text-sm text-center py-4">No se encontraron proyectos en común.</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="border-t border-white/5 my-8" />

      {/* Tabla completa */}
      <div className="mt-8">
        <h3 className="font-serif text-xl mb-4">Detalle por Partido</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left text-muted-foreground uppercase text-xs tracking-wider">
                <th className="py-3 px-2">Partido</th>
                <th className="py-3 px-2">Diputado</th>
                <th className="py-3 px-2 text-right">Proyectos</th>
              </tr>
            </thead>
            <tbody>
              {networkData.topAllies.map(a => (
                <tr key={a.diputado} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="py-2 px-2">
                    <span className="inline-block w-2 h-2 rounded-full mr-2" style={{ backgroundColor: getPartyColor(a.partido) }} />
                    {a.partido}
                  </td>
                  <td className="py-2 px-2">{a.diputado}</td>
                  <td className="py-2 px-2 text-right font-mono">{a.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}

export default function AlianzasPage() {
  return (
    <DashboardGate>
      <AlianzasContent />
    </DashboardGate>
  )
}
