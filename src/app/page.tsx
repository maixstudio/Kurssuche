"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { FolderOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useCourseData } from "@/hooks/use-course-data"
import {
  FilterPanel,
  createEmptyFilterState,
  courseMatchesFilters,
  type FilterState,
} from "@/components/kurssuche/filter-panel"
import { CourseCard } from "@/components/kurssuche/course-card"

export default function Home() {
  const {
    status,
    courses,
    failedFiles,
    errorMessage,
    requestFolder,
    pickNewFolder,
    getPdfFile,
    pdfFolderAvailable,
  } = useCourseData()
  const [filters, setFilters] = useState<FilterState>(createEmptyFilterState())

  const sortedCourses = useMemo(
    () => [...courses].sort((a, b) => a.titel.localeCompare(b.titel, "de")),
    [courses]
  )
  const filteredCourses = useMemo(
    () => sortedCourses.filter((c) => courseMatchesFilters(c, filters)),
    [sortedCourses, filters]
  )

  // PDF-Blob-URLs freigeben, sobald der geöffnete Tab genug Zeit zum Laden
  // hatte, und alle noch offenen beim Verlassen der Seite (BUG-2).
  const objectUrlsRef = useRef<string[]>([])
  useEffect(() => {
    const urls = objectUrlsRef.current
    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [])

  async function handleOpenPdf(dateiname: string): Promise<boolean> {
    const file = await getPdfFile(dateiname)
    if (!file) return false
    const url = URL.createObjectURL(file)
    objectUrlsRef.current.push(url)
    window.open(url, "_blank", "noopener,noreferrer")
    setTimeout(() => URL.revokeObjectURL(url), 60_000)
    return true
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Kurssuche</h1>
        <p className="text-sm text-muted-foreground">
          Durchsuchbare AMS-Kursangebote — Daten werden aus dem geteilten Datenordner geladen.
        </p>
      </header>

      {status === "unsupported" && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-4 text-sm text-destructive">
          Dieser Browser unterstützt den Ordnerzugriff nicht, der für die Kurssuche benötigt wird.
          Bitte öffne die Anwendung mit Microsoft Edge.
        </div>
      )}

      {(status === "needs-permission" || status === "error") && (
        <div className="rounded-lg border p-6 text-center">
          {status === "error" && errorMessage && (
            <p className="mb-3 text-sm text-destructive">{errorMessage}</p>
          )}
          <p className="mb-3 text-sm text-muted-foreground">
            Wähle den Datenordner aus, um alle Kurse zu laden.
          </p>
          <Button onClick={() => requestFolder()}>
            <FolderOpen className="h-4 w-4" />
            Alle Kurse laden
          </Button>
        </div>
      )}

      {(status === "checking" || status === "loading") && (
        <div className="space-y-3">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      )}

      {status === "ready" && courses.length === 0 && (
        <div className="rounded-lg border p-6 text-center">
          <p className="mb-3 text-sm text-muted-foreground">
            Keine Kursdaten in diesem Ordner gefunden.
          </p>
          {failedFiles.length > 0 && (
            <p className="mb-3 text-xs text-destructive">
              {failedFiles.length} Datei(en) konnten nicht gelesen werden: {failedFiles.join(", ")}
            </p>
          )}
          <Button onClick={() => pickNewFolder()}>
            <FolderOpen className="h-4 w-4" />
            Anderen Ordner wählen
          </Button>
        </div>
      )}

      {status === "ready" && courses.length > 0 && (
        <>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground">
            <span>
              {courses.length} {courses.length === 1 ? "Kurs" : "Kurse"} geladen
              {filteredCourses.length !== courses.length &&
                ` — ${filteredCourses.length} passend zur Filterauswahl`}
            </span>
            {failedFiles.length > 0 && (
              <span className="text-destructive">
                {failedFiles.length} Datei(en) konnten nicht geladen werden: {failedFiles.join(", ")}
              </span>
            )}
          </div>

          <div className="mb-6">
            <FilterPanel courses={courses} filters={filters} onChange={setFilters} />
          </div>

          {filteredCourses.length === 0 ? (
            <div className="rounded-lg border p-8 text-center text-sm text-muted-foreground">
              Keine Kurse gefunden. Passe die Filterauswahl an.
            </div>
          ) : (
            <div>
              {filteredCourses.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  onOpenPdf={handleOpenPdf}
                  pdfAvailable={pdfFolderAvailable}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
