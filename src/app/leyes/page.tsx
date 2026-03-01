"use client"

import { useMemo } from "react"
import { useDashboard, DashboardGate } from "@/components/DashboardProvider"
import { PageHeader } from "@/components/PageHeader"
import { KpiCard } from "@/components/KpiCard"
import { EChart } from "@/components/EChart"
import { BoletinCard } from "@/components/BoletinCard"
import { getCoauthorsForBoletines } from "@/lib/queries"
import { SUCCESS_PATTERN, valueCounts } from "@/lib/legislative"

function LeyesContent() {
  const { data, coautores, diputados } = useDashboard()

  const dipMap = useMemo(() => {
    return new Map(diputados.map(d => [d.diputado, d.partido || d.partido_politico || null]))
  }, [diputados])

  const leyes = useMemo(() => {
    if (!data) return []
    return data.jakMociones.filter(m => SUCCESS_PATTERN.test(m.estado_del_proyecto_de_ley))
  }, [data])

  // Tiempo promedio de tramitación (movido desde Estado)
  const avgDays = useMemo(() => {
    const leyesConFechas = leyes.filter(m => m.publicado_en_diario_oficial && m.fecha_de_ingreso)
    if (leyesConFechas.length === 0) return "N/A"

    const totalDays = leyesConFechas.reduce((sum, m) => {
      const pub = new Date(m.publicado_en_diario_oficial!).getTime()
      const ing = new Date(m.fecha_de_ingreso!).getTime()
      return sum + Math.round((pub - ing) / (1000 * 60 * 60 * 24))
    }, 0)

    return Math.round(totalDays / leyesConFechas.length)
  }, [leyes])

  // Charts data
  const leyesPorAnio = useMemo(() => {
    return valueCounts(
      leyes.map(m => String(m.anio || "")).filter(s => s !== "")
    ).sort((a, b) => Number(a.name) - Number(b.name))
  }, [leyes])

  const leyesPorComision = useMemo(() => {
    return valueCounts(
      leyes.map(m => m.comision_inicial || "Desconocida")
    ).slice(0, 10).reverse()
  }, [leyes])

  // ECharts options
  const barAnioOption = useMemo(() => ({
    tooltip: {
      trigger: "axis" as const,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      formatter: (params: any) => {
        const p = params[0]
        return `<strong>${p.name}</strong><br/>${p.value} leyes`
      },
    },
    grid: { left: 40, right: 20, top: 20, bottom: 40 },
    xAxis: {
      type: "category" as const,
      data: leyesPorAnio.map(d => d.name),
      axisLabel: { color: "#b0b0b0", fontSize: 12 },
      axisLine: { lineStyle: { color: "rgba(255,255,255,0.1)" } },
    },
    yAxis: {
      type: "value" as const,
      axisLabel: { color: "#b0b0b0", fontSize: 12 },
      splitLine: { lineStyle: { color: "rgba(255,255,255,0.05)" } },
    },
    series: [
      {
        type: "bar",
        data: leyesPorAnio.map(d => d.count),
        itemStyle: {
          color: "#5bc2ba",
          borderRadius: [4, 4, 0, 0],
        },
        barMaxWidth: 40,
      },
    ],
  }), [leyesPorAnio])

  const barComisionOption = useMemo(() => ({
    tooltip: {
      trigger: "axis" as const,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      formatter: (params: any) => {
        const p = params[0]
        return `<strong>${p.name}</strong><br/>${p.value} leyes`
      },
    },
    grid: { left: 200, right: 30, top: 20, bottom: 20 },
    xAxis: {
      type: "value" as const,
      axisLabel: { color: "#b0b0b0", fontSize: 12 },
      splitLine: { lineStyle: { color: "rgba(255,255,255,0.05)" } },
    },
    yAxis: {
      type: "category" as const,
      data: leyesPorComision.map(d => d.name.length > 28 ? d.name.slice(0, 28) + "..." : d.name),
      axisLabel: { color: "#b0b0b0", fontSize: 11 },
      axisLine: { lineStyle: { color: "rgba(255,255,255,0.1)" } },
    },
    series: [
      {
        type: "bar",
        data: leyesPorComision.map(d => d.count),
        itemStyle: {
          color: "#eda744",
          borderRadius: [0, 4, 4, 0],
        },
        barMaxWidth: 30,
      },
    ],
  }), [leyesPorComision])

  if (!data) return null

  if (leyes.length === 0) {
    return (
      <>
        <PageHeader title="Leyes y Proyectos Terminados" />
        <p className="text-center text-muted-foreground">No se encontraron leyes o proyectos terminados.</p>
      </>
    )
  }

  return (
    <>
      <PageHeader
        title="Leyes y Proyectos Terminados"
        subtitle="Análisis de proyectos que finalizaron su tramitación exitosamente."
      />

      {/* KPI: Tiempo promedio de tramitación */}
      <div className="my-8 bg-[#141414]/60 backdrop-blur-sm border border-white/5 rounded-xl py-6">
        <KpiCard
          title="Tiempo Promedio de Tramitación"
          value={typeof avgDays === "number" ? `${avgDays} días` : avgDays}
          subtitle="Desde ingreso a publicación en Diario Oficial"
        />
      </div>

      {/* Productividad por año */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-center my-12">
        <div className="lg:col-span-2">
          <h3 className="text-2xl font-serif font-semibold mb-4">Productividad Legislativa</h3>
          <p className="text-muted-foreground leading-relaxed text-justify">
            Se han consolidado {leyes.length} leyes a lo largo de los años. Este gráfico muestra en qué años se originaron los proyectos que finalmente tuvieron éxito.
          </p>
        </div>
        <div className="lg:col-span-3">
          <EChart
            option={barAnioOption}
            style={{ height: "300px" }}
          />
        </div>
      </div>

      {/* Por comisión */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-center my-12">
        <div className="lg:col-span-3 order-2 lg:order-1">
          <EChart
            option={barComisionOption}
            style={{ height: "350px" }}
          />
        </div>
        <div className="lg:col-span-2 order-1 lg:order-2">
          <h3 className="text-2xl font-serif font-semibold mb-4">Áreas de Éxito</h3>
          <p className="text-muted-foreground leading-relaxed text-justify">
            Las comisiones listadas representan los nichos donde el trabajo legislativo ha sido más efectivo, logrando la aprobación final de las leyes.
          </p>
        </div>
      </div>

      <div className="border-t border-white/5 my-8" />

      {/* Listado detallado con BoletinCards */}
      <h3 className="font-serif text-xl mb-6 text-center">Listado Detallado de Leyes</h3>
      <div className="space-y-6">
        {leyes.map((ley, i) => {
          const leyCoauthors = getCoauthorsForBoletines(coautores, [ley.n_boletin], data.foundName)
          return (
            <BoletinCard
              key={ley.n_boletin}
              mocion={ley}
              coauthors={leyCoauthors}
              dipMap={dipMap}
              index={i}
              fullWidth
              showResumenIA
            />
          )
        })}
      </div>
    </>
  )
}

export default function LeyesPage() {
  return (
    <DashboardGate>
      <LeyesContent />
    </DashboardGate>
  )
}
