import { PageHeader } from "@/components/PageHeader"

export default function DescargaPage() {
  return (
    <>
      <PageHeader
        title="Descarga de Datos"
        subtitle="Accede a los datasets utilizados en esta plataforma para tu propia investigación."
      />

      <div className="max-w-3xl mx-auto space-y-12 mb-20">
        {/* Datasets Disponibles */}
        <section>
          <h3 className="text-xl font-serif font-semibold mb-4 border-b border-white/10 pb-2">
            Datasets Disponibles
          </h3>
          <p className="text-muted-foreground leading-relaxed text-justify mb-6">
            Ponemos a disposición los datos legislativos utilizados en esta plataforma para fomentar la investigación ciudadana y académica. Los datasets incluyen información sobre mociones, coautorías, análisis de inteligencia artificial y textos legislativos.
          </p>

          <div className="space-y-4">
            {[
              {
                name: "Mociones Parlamentarias",
                description: "255 proyectos de ley con fechas, estados, comisiones y clasificaciones.",
                format: "CSV",
                rows: "255 registros",
              },
              {
                name: "Coautorías",
                description: "Relaciones de coautoría entre diputados para cada moción.",
                format: "CSV",
                rows: "~2,500 registros",
              },
              {
                name: "Análisis IA",
                description: "Clasificaciones temáticas, tipos de iniciativa, sentimiento y resúmenes ejecutivos.",
                format: "CSV / JSON",
                rows: "255 registros",
              },
              {
                name: "Textos Legislativos",
                description: "Textos completos extraídos de los boletines en PDF.",
                format: "JSON",
                rows: "37+ documentos",
              },
            ].map((dataset) => (
              <div
                key={dataset.name}
                className="bg-[#141414]/80 backdrop-blur-sm border border-white/10 rounded-xl p-5 hover:border-white/20 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-serif font-semibold">{dataset.name}</h4>
                  <div className="flex gap-2">
                    <span className="text-xs bg-[#6e20d3]/20 text-[#6e20d3] px-2 py-0.5 rounded">
                      {dataset.format}
                    </span>
                  </div>
                </div>
                <p className="text-muted-foreground text-sm mb-2 text-justify">{dataset.description}</p>
                <p className="text-white/30 text-xs">{dataset.rows}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 bg-[#141414]/60 border border-white/10 rounded-xl p-6 text-center">
            <p className="text-muted-foreground text-sm mb-4">
              Los datasets estarán disponibles para descarga próximamente.
            </p>
            <button
              disabled
              className="px-6 py-2.5 rounded-full border border-[#6e20d3]/30 text-[#6e20d3] text-sm font-semibold cursor-not-allowed opacity-70"
            >
              Próximamente
            </button>
          </div>
        </section>

        {/* Formato y Estructura */}
        <section>
          <h3 className="text-xl font-serif font-semibold mb-4 border-b border-white/10 pb-2">
            Formato y Estructura
          </h3>
          <p className="text-muted-foreground leading-relaxed text-justify">
            Los archivos CSV utilizan codificación UTF-8 con separador de coma. Los archivos JSON siguen una estructura estandarizada con documentación de cada campo. Todos los identificadores de boletín siguen el formato oficial del Congreso (ej: &ldquo;3064-06&rdquo;). Las fechas están en formato ISO 8601 (YYYY-MM-DD).
          </p>
        </section>

        {/* Licencia */}
        <section>
          <h3 className="text-xl font-serif font-semibold mb-4 border-b border-white/10 pb-2">
            Licencia de Uso
          </h3>
          <p className="text-muted-foreground leading-relaxed text-justify">
            Los datos legislativos son de dominio público. Los análisis y clasificaciones generados por Observatorio Congreso se distribuyen bajo licencia Creative Commons Attribution 4.0 (CC BY 4.0). Esto permite su uso, modificación y redistribución siempre que se otorgue crédito a Observatorio Congreso como fuente original del análisis.
          </p>
        </section>
      </div>
    </>
  )
}
