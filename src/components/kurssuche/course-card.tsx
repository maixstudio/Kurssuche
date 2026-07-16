"use client"

import { useState } from "react"
import { FileText } from "lucide-react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { Course } from "@/types/course"

const NO_VALUE = "keine Angabe"

function InfoBlock({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <h4 className="text-sm font-semibold text-foreground">{label}</h4>
      <p className="text-sm text-muted-foreground whitespace-pre-line">{value || NO_VALUE}</p>
    </div>
  )
}

function InhaltBlock({ inhalt }: { inhalt: Course["inhalt"] }) {
  if (!inhalt) return <InfoBlock label="Inhalt" value={null} />
  if (Array.isArray(inhalt)) {
    if (inhalt.length === 0) return <InfoBlock label="Inhalt" value={null} />
    return (
      <div>
        <h4 className="text-sm font-semibold text-foreground">Inhalt</h4>
        <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-0.5">
          {inhalt.map((point, i) => (
            <li key={i}>{point}</li>
          ))}
        </ul>
      </div>
    )
  }
  const sections = Object.entries(inhalt)
  if (sections.length === 0) return <InfoBlock label="Inhalt" value={null} />
  return (
    <div>
      <h4 className="text-sm font-semibold text-foreground">Inhalt</h4>
      <div className="space-y-2">
        {sections.map(([section, points]) => (
          <div key={section}>
            <p className="text-sm font-medium text-foreground">{section}</p>
            <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-0.5">
              {points.map((point, i) => (
                <li key={i}>{point}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}

interface CourseCardProps {
  course: Course
  onOpenPdf: (dateiname: string) => Promise<boolean>
  pdfAvailable: boolean
}

export function CourseCard({ course, onOpenPdf, pdfAvailable }: CourseCardProps) {
  const [pdfError, setPdfError] = useState(false)

  const naechsterTermin = course.termine.find((t) => t.start)?.start
  const kontakte = course.kontakt.filter((k) => k.name || k.telefon || k.email)

  async function handleOpenPdf() {
    setPdfError(false)
    const opened = await onOpenPdf(course.quelle.dateiname)
    if (!opened) setPdfError(true)
  }

  return (
    <Accordion type="multiple">
      <AccordionItem value={course.id} className="border rounded-lg px-4 mb-3">
        <AccordionTrigger className="hover:no-underline">
          <div className="flex flex-col items-start gap-1.5 text-left">
            <span className="font-semibold">{course.titel}</span>
            <div className="flex flex-wrap gap-1.5">
              {course.massnahmentyp && <Badge variant="secondary">{course.massnahmentyp}</Badge>}
              {course.regionen.map((r) => (
                <Badge key={r} variant="outline">
                  {r}
                </Badge>
              ))}
              {naechsterTermin && (
                <Badge variant="outline">Start {naechsterTermin}</Badge>
              )}
            </div>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <InfoBlock label="Zielgruppe" value={course.zielgruppe} />
            <InfoBlock label="Ziel" value={course.ziel} />
          </div>
          <div className="mt-4">
            <InhaltBlock inhalt={course.inhalt} />
          </div>
          <div className="mt-4">
            <InfoBlock label="Form und Dauer" value={course.form_und_dauer} />
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <h4 className="text-sm font-semibold text-foreground">Termine</h4>
              {course.termine.length === 0 ? (
                <p className="text-sm text-muted-foreground">{NO_VALUE}</p>
              ) : (
                <ul className="text-sm text-muted-foreground space-y-0.5">
                  {course.termine.map((t, i) => (
                    <li key={i}>
                      {t.kursnummer ? `${t.kursnummer} — ` : ""}
                      {t.start ?? NO_VALUE}
                      {t.anmerkung ? ` (${t.anmerkung})` : ""}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <InfoBlock
              label="Veranstaltungsort"
              value={course.veranstaltungsort.length > 0 ? course.veranstaltungsort.join(" / ") : null}
            />
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <h4 className="text-sm font-semibold text-foreground">Kontakt</h4>
              {kontakte.length === 0 ? (
                <p className="text-sm text-muted-foreground">{NO_VALUE}</p>
              ) : (
                <ul className="text-sm text-muted-foreground space-y-1">
                  {kontakte.map((k, i) => (
                    <li key={i}>
                      {[k.name, k.telefon, k.email].filter(Boolean).join(" · ") || NO_VALUE}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <InfoBlock
              label="Veranstalter"
              value={course.veranstalter?.name ? `${course.veranstalter.name}${course.veranstalter.adresse ? ", " + course.veranstalter.adresse : ""}` : null}
            />
          </div>
          <div className="mt-4 flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleOpenPdf}
              disabled={!pdfAvailable}
            >
              <FileText className="h-4 w-4" />
              Original-PDF öffnen
            </Button>
            {!pdfAvailable && (
              <span className="text-xs text-muted-foreground">PDF-Ordner nicht gefunden</span>
            )}
            {pdfError && (
              <span className="text-xs text-destructive">PDF „{course.quelle.dateiname}“ nicht gefunden</span>
            )}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}
