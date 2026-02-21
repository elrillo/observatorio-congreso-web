"use client"

import { useMemo } from "react"
import { useDashboard, DashboardGate } from "@/components/DashboardProvider"
import { KpiCard } from "@/components/KpiCard"
import { PageHeader } from "@/components/PageHeader"
import { StorySection } from "@/components/StorySection"
import { EChart } from "@/components/EChart"
import { valueCounts, PERIODOS } from "@/lib/legislative"
import { normalizeParty, getPartyColor, PARTY_COLORS } from "@/lib/parties"

const COLORS = ["#c0392b", "#2ecc71", "#3498db", "#f39c12", "#9b59b6", "#1abc9c", "#e67e22", "#95a5a6"]

function GeneralContent() {
  const { data, coautores, diputados } = useDashboard()
  if (!data) return null

  const { jakMociones, jakBoletinIds, foundName, total, leyesCount, tasaExito, promedioAnual, topAlly } = data

  // Estado de proyectos (donut)
  const statusCounts = valueCounts(
    jakMociones.map(m => m.estado_del_proyecto_de_ley).filter(Boolean)
  ).slice(0, 8)

  // Comisiones top (barras horizontales)
  const comisionCounts = valueCounts(
    jakMociones.map(m => m.comision_inicial || "Desconocida")
  ).slice(0, 10)

  // Producción anual
  const yearCounts = valueCounts(
    jakMociones.map(m => String(m.anio || "")).filter(s => s !== "")
  ).sort((a, b) => Number(a.name) - Number(b.name))

  // Producción por legislatura
  const periodCounts = PERIODOS.map(p => ({
    name: p,
    count: jakMociones.filter(m => m.periodo === p).length,
  }))

  // Top 5 colaboradores y Top 5 partidos
  const dipMap = useMemo(() => {
    return new Map(diputados.map(d => [d.diputado, d.partido || d.partido_politico || null]))
  }, [diputados])

  const { topAllies, topParties } = useMemo(() => {
    const jakSet = new Set(jakBoletinIds)
    const allyCounts: Record<string, number> = {}
    const partyCounts: Record<string, number> = {}

    for (const c of coautores) {
      if (jakSet.has(c.n_boletin) && c.diputado !== foundName) {
        allyCounts[c.diputado] = (allyCounts[c.diputado] || 0) + 1
        const party = normalizeParty(dipMap.get(c.diputado) || null)
        partyCounts[party] = (partyCounts[party] || 0) + 1
      }
    }

    const topAllies = Object.entries(allyCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name: name.split(" ").slice(0, 2).join(" "), count, fullName: name }))

    const topParties = Object.entries(partyCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }))

    return { topAllies, topParties }
  }, [coautores, jakBoletinIds, foundName, dipMap])

  // --- ECharts Options ---

  const donutOption = {
    tooltip: { trigger: 'item' as const, formatter: '{b}: {c} ({d}%)' },
    legend: {
      bottom: 0,
      type: 'scroll' as const,
      textStyle: { color: '#b0b0b0', fontSize: 11 },
    },
    series: [{
      type: 'pie',
      radius: ['45%', '75%'],
      center: ['50%', '45%'],
      data: statusCounts.map((s, i) => ({
        value: s.count,
        name: s.name,
        itemStyle: { color: COLORS[i % COLORS.length] },
      })),
      label: { show: false },
      emphasis: {
        label: { show: true, fontSize: 13, fontWeight: 'bold' as const, color: '#fff' },
      },
    }],
  }

  const comisionOption = {
    tooltip: { trigger: 'axis' as const, axisPointer: { type: 'shadow' as const } },
    grid: { left: 10, right: 30, top: 10, bottom: 10, containLabel: true },
    xAxis: { type: 'value' as const },
    yAxis: {
      type: 'category' as const,
      data: [...comisionCounts].reverse().map(c => c.name),
      axisLabel: {
        width: 180,
        overflow: 'truncate' as const,
        ellipsis: '...',
        fontSize: 11,
      },
    },
    series: [{
      type: 'bar',
      data: [...comisionCounts].reverse().map(c => c.count),
      itemStyle: { color: '#c0392b', borderRadius: [0, 4, 4, 0] },
      barMaxWidth: 20,
    }],
  }

  const yearOption = {
    tooltip: { trigger: 'axis' as const },
    grid: { left: 10, right: 10, top: 10, bottom: 10, containLabel: true },
    xAxis: { type: 'category' as const, data: yearCounts.map(y => y.name) },
    yAxis: { type: 'value' as const },
    series: [{
      type: 'bar',
      data: yearCounts.map(y => y.count),
      itemStyle: {
        color: {
          type: 'linear' as const, x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: '#c0392b' },
            { offset: 1, color: '#962d22' },
          ],
        },
        borderRadius: [4, 4, 0, 0],
      },
      barMaxWidth: 30,
    }],
  }

  const periodOption = {
    tooltip: { trigger: 'axis' as const },
    grid: { left: 10, right: 10, top: 10, bottom: 10, containLabel: true },
    xAxis: { type: 'category' as const, data: periodCounts.map(p => p.name) },
    yAxis: { type: 'value' as const },
    series: [{
      type: 'bar',
      data: periodCounts.map(p => ({
        value: p.count,
        itemStyle: {
          color: {
            type: 'linear' as const, x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: '#3498db' },
              { offset: 1, color: '#2471a3' },
            ],
          },
        },
      })),
      itemStyle: { borderRadius: [4, 4, 0, 0] },
      barMaxWidth: 50,
      label: {
        show: true,
        position: 'top' as const,
        color: '#b0b0b0',
        fontSize: 13,
        fontWeight: 'bold' as const,
      },
    }],
  }

  const alliesOption = {
    tooltip: { trigger: 'axis' as const, axisPointer: { type: 'shadow' as const } },
    grid: { left: 10, right: 30, top: 10, bottom: 10, containLabel: true },
    xAxis: { type: 'value' as const },
    yAxis: {
      type: 'category' as const,
      data: [...topAllies].reverse().map(a => a.name),
      axisLabel: { fontSize: 11 },
    },
    series: [{
      type: 'bar',
      data: [...topAllies].reverse().map(a => ({
        value: a.count,
        itemStyle: {
          color: getPartyColor(normalizeParty(dipMap.get(a.fullName) || null)),
          borderRadius: [0, 4, 4, 0],
        },
      })),
      barMaxWidth: 20,
    }],
  }

  const partiesOption = {
    tooltip: { trigger: 'axis' as const, axisPointer: { type: 'shadow' as const } },
    grid: { left: 10, right: 30, top: 10, bottom: 10, containLabel: true },
    xAxis: { type: 'value' as const },
    yAxis: {
      type: 'category' as const,
      data: [...topParties].reverse().map(p => p.name),
      axisLabel: { fontSize: 11 },
    },
    series: [{
      type: 'bar',
      data: [...topParties].reverse().map(p => ({
        value: p.count,
        itemStyle: {
          color: PARTY_COLORS[p.name] || '#95a5a6',
          borderRadius: [0, 4, 4, 0],
        },
      })),
      barMaxWidth: 20,
    }],
  }

  return (
    <>
      <PageHeader
        title="Análisis del Trabajo Legislativo"
        subtitle="Un recorrido por la labor y eficiencia del exdiputado Kast en la Cámara de Diputados."
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
        <KpiCard title="Total Iniciativas" value={total} subtitle="Carrera parlamentaria" />
        <KpiCard title="Aprobados / Terminados" value={leyesCount} subtitle={`Tasa: ${tasaExito.toFixed(1)}%`} />
        <KpiCard title="Promedio Anual" value={promedioAnual} subtitle="Mociones por año" />
        <KpiCard title="Aliado Histórico" value={topAlly.split(" ").slice(0, 2).join(" ")} subtitle="Mayor colaborador" />
      </div>

      <div className="border-t border-white/5 my-8" />

      {/* Sección 1: Estado de la Gestión */}
      <StorySection
        title="Estado de la Gestión"
        description={`Esta sección analiza el ciclo de vida de los ${total} proyectos presentados.\n\nAproximadamente un ${tasaExito.toFixed(1)}% de las iniciativas han logrado convertirse en ley o finalizar su tramitación, lo que representa un indicador clave de efectividad legislativa.\n\nLa mayoría de los proyectos en el Congreso a menudo quedan estancados en comisiones, un desafío común en la labor parlamentaria chilena.`}
        chart={<EChart option={donutOption} style={{ height: '380px' }} />}
        textLeft
      />

      {/* Sección 2: Áreas de Influencia */}
      <StorySection
        title="Áreas de Influencia"
        description={`El impacto legislativo se concentra principalmente en las áreas de Constitución, Seguridad y Hacienda.\n\nEste gráfico destaca las 10 comisiones donde se ha ingresado el mayor volumen de iniciativas. Una mayor cantidad de proyectos en comisiones clave sugiere un enfoque en temas de relevancia nacional y reformas estructurales.`}
        chart={<EChart option={comisionOption} style={{ height: '420px' }} />}
        textLeft={false}
      />

      {/* Sección 3: Evolución Histórica por año */}
      <StorySection
        title="Evolución Histórica"
        description={`La actividad parlamentaria no es lineal; fluctúa según los ciclos políticos y los periodos presidenciales.\n\nSe observa una intensidad variable a lo largo de los años, con picos de actividad que suelen coincidir con debates nacionales críticos o el inicio de nuevos mandatos parlamentarios.`}
        chart={<EChart option={yearOption} style={{ height: '320px' }} />}
        textLeft
      />

      {/* Sección 4: Evolución por Legislatura */}
      <StorySection
        title="Producción por Legislatura"
        description={`Una mirada agregada por periodo legislativo permite identificar en qué mandatos se concentró la mayor actividad.\n\nCada legislatura comprende cuatro años, con cortes en marzo según el calendario parlamentario chileno. Este análisis contextualiza la productividad dentro de los ciclos políticos formales.`}
        chart={<EChart option={periodOption} style={{ height: '320px' }} />}
        textLeft={false}
      />

      {/* Sección 5: Principales Colaboradores */}
      <div className="border-t border-white/5 my-8" />
      <h2 className="font-serif text-2xl text-center mb-2">Principales Colaboradores</h2>
      <p className="text-muted-foreground text-center text-sm mb-8 max-w-2xl mx-auto">
        Los diputados y partidos políticos con mayor frecuencia de coautoría en las iniciativas legislativas.
      </p>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        <div className="bg-[#141414]/80 backdrop-blur-sm border border-white/10 rounded-xl p-6">
          <h3 className="font-serif text-lg mb-4 text-center">Top 5 Aliados</h3>
          <EChart option={alliesOption} style={{ height: '250px' }} />
        </div>
        <div className="bg-[#141414]/80 backdrop-blur-sm border border-white/10 rounded-xl p-6">
          <h3 className="font-serif text-lg mb-4 text-center">Top 5 Partidos</h3>
          <EChart option={partiesOption} style={{ height: '250px' }} />
        </div>
      </div>
    </>
  )
}

export default function GeneralPage() {
  return (
    <DashboardGate>
      <GeneralContent />
    </DashboardGate>
  )
}
