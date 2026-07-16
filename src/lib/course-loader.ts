import type { Course } from "@/types/course"

// Der ausgewählte Elternordner enthält zwei Geschwisterordner: einen mit den
// Kurs-JSONs, einen mit den Original-PDFs. Beide Namen sind über Aliasse
// tolerant, damit die Ordnerbenennung im geteilten Laufwerk nicht exakt
// getroffen werden muss.
const COURSES_SEGMENT_ALIASES = ["courses", "kurse", "json"]
const PDF_SEGMENT_ALIASES = ["source-pdfs", "pdfs", "pdf", "dokumente"]

export interface LoadResult {
  courses: Course[]
  failedFiles: string[]
  pdfFiles: Map<string, File>
}

function parentFolderName(file: File): string | null {
  const relPath = file.webkitRelativePath || file.name
  const segments = relPath.split("/")
  // segments: [gewählter Ordner, ...Unterordner, Dateiname] — der Elternordner
  // der Datei ist das vorletzte Segment (falls vorhanden).
  return segments.length >= 3 ? segments[segments.length - 2] : null
}

function isTopLevelFile(file: File): boolean {
  const relPath = file.webkitRelativePath || file.name
  return relPath.split("/").length === 2
}

/**
 * Liest alle Dateien eines vom Nutzer ausgewählten Ordners ein (über
 * `<input type="file" webkitdirectory>`). Erwartet wird ein Elternordner mit
 * zwei Unterordnern (Kurs-JSONs und Original-PDFs), akzeptiert aber auch
 * JSON-Dateien direkt im gewählten Ordner als Fallback.
 */
export async function loadCoursesFromFileList(files: FileList): Promise<LoadResult> {
  const courses: Course[] = []
  const failedFiles: string[] = []
  const pdfFiles = new Map<string, File>()

  for (const file of Array.from(files)) {
    const parent = parentFolderName(file)?.toLowerCase() ?? null
    const isJson = file.name.toLowerCase().endsWith(".json")
    const inCoursesFolder = parent !== null && COURSES_SEGMENT_ALIASES.includes(parent)
    const inPdfFolder = parent !== null && PDF_SEGMENT_ALIASES.includes(parent)

    if (isJson && (inCoursesFolder || isTopLevelFile(file))) {
      try {
        const text = await file.text()
        const parsed = JSON.parse(text) as Course
        if (!parsed.titel) throw new Error("Feld 'titel' fehlt")
        courses.push(parsed)
      } catch {
        failedFiles.push(file.name)
      }
    } else if (inPdfFolder) {
      pdfFiles.set(file.name, file)
    }
  }

  return { courses, failedFiles, pdfFiles }
}

export function resolvePdfFile(pdfFiles: Map<string, File>, dateiname: string): File | null {
  return pdfFiles.get(dateiname) ?? null
}
