"use client"

/**
 * Wrapper de ECharts con tree-shaking y tema del Observatorio.
 * Importa solo los módulos necesarios para reducir el bundle.
 */
import { useEffect, useRef } from 'react'
import * as echarts from 'echarts/core'
import { BarChart, PieChart, GraphChart, TreemapChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  DatasetComponent,
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import { observatorioTheme, THEME_NAME } from '@/lib/echarts-theme'

// Registrar módulos una sola vez
echarts.use([
  BarChart, PieChart, GraphChart, TreemapChart,
  TitleComponent, TooltipComponent, LegendComponent,
  GridComponent, DatasetComponent,
  CanvasRenderer,
])

// Registrar tema
let themeRegistered = false
function ensureTheme() {
  if (!themeRegistered) {
    echarts.registerTheme(THEME_NAME, observatorioTheme)
    themeRegistered = true
  }
}

interface EChartProps {
  option: echarts.EChartsCoreOption
  style?: React.CSSProperties
  className?: string
  onEvents?: Record<string, (params: unknown) => void>
}

export function EChart({ option, style, className, onEvents }: EChartProps) {
  const chartRef = useRef<HTMLDivElement>(null)
  const instanceRef = useRef<echarts.ECharts | null>(null)

  useEffect(() => {
    ensureTheme()
    if (!chartRef.current) return

    const chart = echarts.init(chartRef.current, THEME_NAME, { renderer: 'canvas' })
    instanceRef.current = chart
    chart.setOption(option)

    // Registrar eventos
    if (onEvents) {
      for (const [eventName, handler] of Object.entries(onEvents)) {
        chart.on(eventName, handler)
      }
    }

    // Resize observer
    const resizeObserver = new ResizeObserver(() => chart.resize())
    resizeObserver.observe(chartRef.current)

    return () => {
      resizeObserver.disconnect()
      chart.dispose()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Actualizar opciones cuando cambien
  useEffect(() => {
    if (instanceRef.current) {
      instanceRef.current.setOption(option, true)
    }
  }, [option])

  return (
    <div
      ref={chartRef}
      className={className}
      style={{ width: '100%', height: '400px', ...style }}
    />
  )
}
