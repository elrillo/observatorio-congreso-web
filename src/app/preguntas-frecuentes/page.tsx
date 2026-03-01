"use client"

import { useState } from "react"
import { PageHeader } from "@/components/PageHeader"

const FAQ_ITEMS = [
  {
    question: "¿Qué es el Observatorio Congreso?",
    answer:
      "Una plataforma de análisis ciudadano que procesa datos legislativos públicos del Sistema de Información Legislativa (SIL) del Congreso Nacional de Chile. Su objetivo es facilitar el acceso y comprensión de la actividad parlamentaria mediante visualizaciones interactivas.",
  },
  {
    question: "¿De dónde provienen los datos?",
    answer:
      "Los datos se obtienen del Sistema de Información Legislativa (SIL) del Congreso Nacional de Chile. Son datos públicos y de acceso abierto. Se complementan con información de textos de mociones extraídos de documentos oficiales.",
  },
  {
    question: "¿Qué periodo cubre este análisis?",
    answer:
      "Este análisis cubre las mociones ingresadas entre 2002 y 2018, correspondientes a los cuatro mandatos de José Antonio Kast como diputado en la Cámara de Diputados de Chile.",
  },
  {
    question: "¿Cómo se clasifican las temáticas?",
    answer:
      "Las temáticas se asignan según la comisión inicial que recibió cada proyecto de ley, agrupadas en categorías generales como Constitución y Justicia, Seguridad y Defensa, Economía y Hacienda, entre otras.",
  },
  {
    question: "¿Qué significa \"Resumen IA\"?",
    answer:
      "Son resúmenes generados por inteligencia artificial a partir del texto original de cada moción parlamentaria. Permiten conocer rápidamente el contenido de un proyecto sin necesidad de leer el documento completo.",
  },
  {
    question: "¿Puedo descargar los datos?",
    answer:
      "Sí. En la sección Descarga del footer se proporcionan los datos en formato abierto para que puedan ser utilizados en investigaciones, reportajes u otros análisis.",
  },
  {
    question: "¿Quién desarrolla esta plataforma?",
    answer:
      "Esta plataforma es desarrollada por Fundación Balmaceda. Para consultas o colaboraciones, puedes escribir a estudios@fundacionbalmaceda.cl.",
  },
]

export default function PreguntasFrecuentesPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <div className="max-w-3xl mx-auto">
      <PageHeader
        title="Preguntas Frecuentes"
        subtitle="Información sobre la plataforma, los datos y la metodología."
      />

      <div className="space-y-3 mb-16">
        {FAQ_ITEMS.map((item, i) => {
          const isOpen = openIndex === i
          return (
            <div
              key={i}
              className="bg-[#141414]/80 backdrop-blur-sm border border-white/5 rounded-xl overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(isOpen ? null : i)}
                className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-white/5 transition-colors"
              >
                <span className="font-serif text-sm md:text-base pr-4">
                  {item.question}
                </span>
                <span className="text-white/40 text-xl shrink-0 transition-transform duration-200"
                  style={{ transform: isOpen ? "rotate(45deg)" : "rotate(0deg)" }}
                >
                  +
                </span>
              </button>
              <div
                className="transition-all duration-300 ease-in-out overflow-hidden"
                style={{
                  maxHeight: isOpen ? "300px" : "0px",
                  opacity: isOpen ? 1 : 0,
                }}
              >
                <p className="px-6 pb-5 text-muted-foreground text-sm leading-relaxed text-justify">
                  {item.answer}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
