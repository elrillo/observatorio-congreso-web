import { PageHeader } from "@/components/PageHeader"

export default function TerminosPage() {
  return (
    <>
      <PageHeader
        title="Términos de Uso"
        subtitle="Condiciones que rigen el uso de la plataforma Observatorio Congreso."
      />

      <div className="max-w-3xl mx-auto space-y-12 mb-20">
        {/* Uso del Sitio */}
        <section>
          <h3 className="text-xl font-serif font-semibold mb-4 border-b border-white/10 pb-2">
            Uso del Sitio
          </h3>
          <p className="text-muted-foreground leading-relaxed text-justify">
            Esta plataforma es un proyecto de análisis ciudadano con fines informativos y educativos. El contenido está diseñado para facilitar el acceso público a información legislativa y promover la transparencia parlamentaria. Los usuarios pueden consultar, compartir y citar la información presentada, siempre que se otorgue el crédito correspondiente a Observatorio Congreso como fuente.
          </p>
        </section>

        {/* Propiedad Intelectual */}
        <section>
          <h3 className="text-xl font-serif font-semibold mb-4 border-b border-white/10 pb-2">
            Propiedad Intelectual
          </h3>
          <p className="text-muted-foreground leading-relaxed text-justify">
            Los datos legislativos utilizados en esta plataforma son de dominio público y provienen del Sistema de Información Legislativa (SIL) del Congreso Nacional de Chile. Las visualizaciones, análisis, diseño y código fuente de la plataforma son propiedad de Observatorio Congreso. El uso comercial del contenido de esta plataforma requiere autorización previa por escrito.
          </p>
        </section>

        {/* Limitación de Responsabilidad */}
        <section>
          <h3 className="text-xl font-serif font-semibold mb-4 border-b border-white/10 pb-2">
            Limitación de Responsabilidad
          </h3>
          <p className="text-muted-foreground leading-relaxed text-justify">
            La información presentada se ofrece &ldquo;tal cual&rdquo; y sin garantías de ningún tipo. Observatorio Congreso no se responsabiliza por errores u omisiones en los datos, ni por decisiones tomadas con base en la información proporcionada. Los análisis generados mediante inteligencia artificial son aproximaciones y no deben ser considerados como interpretaciones jurídicas definitivas.
          </p>
        </section>

        {/* Modificaciones */}
        <section>
          <h3 className="text-xl font-serif font-semibold mb-4 border-b border-white/10 pb-2">
            Modificaciones
          </h3>
          <p className="text-muted-foreground leading-relaxed text-justify">
            Nos reservamos el derecho de modificar estos términos en cualquier momento. Los cambios serán efectivos desde su publicación en esta página. El uso continuado de la plataforma después de la publicación de cambios constituye la aceptación de los términos modificados.
          </p>
        </section>

        {/* Contacto */}
        <section>
          <h3 className="text-xl font-serif font-semibold mb-4 border-b border-white/10 pb-2">
            Contacto
          </h3>
          <p className="text-muted-foreground leading-relaxed text-justify">
            Para consultas sobre estos términos de uso, puede contactarnos a través de los canales indicados en la sección &ldquo;Conecta&rdquo; del pie de página.
          </p>
        </section>
      </div>
    </>
  )
}
