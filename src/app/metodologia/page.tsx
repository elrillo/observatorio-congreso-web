import { PageHeader } from "@/components/PageHeader"

export default function MetodologiaPage() {
  return (
    <>
      <PageHeader
        title="Metodología de Datos"
        subtitle="Transparencia en el proceso de recopilación, procesamiento y análisis de datos legislativos."
      />

      <div className="max-w-3xl mx-auto space-y-12 mb-20">
        {/* Fuentes de Datos */}
        <section>
          <h3 className="text-xl font-serif font-semibold mb-4 border-b border-white/10 pb-2">
            Fuentes de Datos
          </h3>
          <p className="text-muted-foreground leading-relaxed text-justify">
            Los datos utilizados en esta plataforma provienen exclusivamente de fuentes públicas oficiales del Congreso Nacional de Chile. La información legislativa fue obtenida del Sistema de Información Legislativa (SIL), que registra todas las mociones, mensajes y proyectos de ley tramitados en el Congreso. Los textos completos de los boletines fueron extraídos de los documentos PDF disponibles en la Biblioteca del Congreso Nacional (BCN).
          </p>
        </section>

        {/* Proceso de Recopilación */}
        <section>
          <h3 className="text-xl font-serif font-semibold mb-4 border-b border-white/10 pb-2">
            Proceso de Recopilación
          </h3>
          <p className="text-muted-foreground leading-relaxed text-justify">
            El proceso de recopilación se realizó en varias etapas. En primer lugar, se identificaron las 255 mociones parlamentarias presentadas por José Antonio Kast Rist durante su periodo como diputado (2002-2018). Posteriormente, se recopiló la información de coautores, comisiones, estados de tramitación y fechas relevantes. Los textos de los proyectos de ley fueron extraídos mediante procesamiento automatizado de documentos PDF.
          </p>
        </section>

        {/* Análisis con Inteligencia Artificial */}
        <section>
          <h3 className="text-xl font-serif font-semibold mb-4 border-b border-white/10 pb-2">
            Análisis con Inteligencia Artificial
          </h3>
          <p className="text-muted-foreground leading-relaxed text-justify">
            La capa de análisis de inteligencia artificial utiliza un enfoque heurístico basado en keywords para clasificar temáticamente las mociones, determinar el tipo de iniciativa (Punitiva, Propositiva o Administrativa) y generar resúmenes ejecutivos extractivos. El análisis de sentimiento se realiza mediante un score normalizado entre -1.0 y 1.0 que evalúa el tono general del texto legislativo.
          </p>
        </section>

        {/* Normalización y Calidad */}
        <section>
          <h3 className="text-xl font-serif font-semibold mb-4 border-b border-white/10 pb-2">
            Normalización y Calidad de Datos
          </h3>
          <p className="text-muted-foreground leading-relaxed text-justify">
            Los nombres de diputados fueron normalizados para resolver variantes ortográficas y de formato. Los partidos políticos fueron estandarizados según sus denominaciones oficiales. Se realizaron múltiples etapas de validación cruzada para asegurar la integridad de los datos, incluyendo verificación de boletines, fechas y relaciones de coautoría.
          </p>
        </section>

        {/* Limitaciones */}
        <section>
          <h3 className="text-xl font-serif font-semibold mb-4 border-b border-white/10 pb-2">
            Limitaciones
          </h3>
          <p className="text-muted-foreground leading-relaxed text-justify">
            Esta plataforma se enfoca exclusivamente en las mociones parlamentarias y no incluye otras formas de actividad legislativa como indicaciones, votaciones en sala o intervenciones en debate. El análisis de IA es heurístico y puede contener imprecisiones en la clasificación temática o en los resúmenes generados. Los datos reflejan el estado registrado al momento de la última sincronización con las fuentes oficiales.
          </p>
        </section>
      </div>
    </>
  )
}
