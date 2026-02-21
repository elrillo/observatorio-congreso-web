/**
 * Tema oscuro personalizado para Apache ECharts.
 * Colores y estilos alineados con el diseño del Observatorio Congreso.
 */

export const THEME_NAME = 'observatorio-dark'

export const observatorioTheme = {
  color: [
    '#c0392b', '#2ecc71', '#3498db', '#f39c12',
    '#9b59b6', '#1abc9c', '#e67e22', '#95a5a6',
    '#e74c3c', '#2980b9', '#27ae60', '#f1c40f',
  ],
  backgroundColor: 'transparent',
  textStyle: {
    color: '#b0b0b0',
    fontFamily: 'Merriweather, serif',
  },
  title: {
    textStyle: {
      color: '#ffffff',
      fontFamily: 'Playfair Display, serif',
      fontSize: 16,
    },
    subtextStyle: {
      color: '#b0b0b0',
    },
  },
  tooltip: {
    backgroundColor: '#1a1a1a',
    borderColor: '#333',
    borderWidth: 1,
    textStyle: {
      color: '#ffffff',
      fontSize: 12,
    },
    extraCssText: 'border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.4);',
  },
  legend: {
    textStyle: {
      color: '#b0b0b0',
      fontSize: 11,
    },
    pageTextStyle: {
      color: '#b0b0b0',
    },
  },
  categoryAxis: {
    axisLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } },
    axisTick: { lineStyle: { color: 'rgba(255,255,255,0.1)' } },
    axisLabel: { color: '#b0b0b0', fontSize: 11 },
    splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } },
  },
  valueAxis: {
    axisLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } },
    axisTick: { lineStyle: { color: 'rgba(255,255,255,0.1)' } },
    axisLabel: { color: '#b0b0b0', fontSize: 11 },
    splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } },
  },
  bar: {
    itemStyle: {
      borderRadius: [4, 4, 0, 0],
    },
  },
  pie: {
    itemStyle: {
      borderColor: '#0c0d0e',
      borderWidth: 2,
    },
  },
  graph: {
    lineStyle: {
      color: '#444',
      width: 0.5,
    },
  },
}
