import { describe, expect, it } from "vitest"
import { loadCoursesFromFileList, resolvePdfFile } from "./course-loader"

function makeFile(relativePath: string, content: string): File {
  const name = relativePath.split("/").pop()!
  const file = new File([content], name)
  Object.defineProperty(file, "webkitRelativePath", { value: relativePath })
  return file
}

function makeFileList(files: File[]): FileList {
  const list: Record<number, File> & { length: number; item: (i: number) => File | null } = {
    length: files.length,
    item: (i: number) => files[i] ?? null,
  }
  files.forEach((f, i) => (list[i] = f))
  return list as unknown as FileList
}

const validCourseJson = JSON.stringify({
  id: "kurs-a",
  titel: "Kurs A",
  regionen: ["Bregenz"],
  themen_tags: [],
  zielgruppe_tags: [],
  termine: [],
  veranstaltungsort: [],
  kontakt: [],
  quelle: { dateiname: "kurs-a.pdf" },
})

describe("loadCoursesFromFileList", () => {
  it("loads valid JSON files from a courses subfolder", async () => {
    const files = makeFileList([makeFile("Kurssuche/courses/kurs-a.json", validCourseJson)])

    const result = await loadCoursesFromFileList(files)

    expect(result.courses).toHaveLength(1)
    expect(result.courses[0].titel).toBe("Kurs A")
    expect(result.failedFiles).toHaveLength(0)
  })

  it("also accepts JSON files placed directly in the selected top-level folder", async () => {
    const files = makeFileList([makeFile("Kurssuche/kurs-a.json", validCourseJson)])

    const result = await loadCoursesFromFileList(files)

    expect(result.courses).toHaveLength(1)
  })

  it("skips a file with invalid JSON and reports it as failed", async () => {
    const files = makeFileList([
      makeFile("Kurssuche/courses/kurs-a.json", validCourseJson),
      makeFile("Kurssuche/courses/kaputt.json", "{ das ist kein gueltiges json"),
    ])

    const result = await loadCoursesFromFileList(files)

    expect(result.courses).toHaveLength(1)
    expect(result.failedFiles).toEqual(["kaputt.json"])
  })

  it("skips a JSON file missing the required 'titel' field", async () => {
    const files = makeFileList([makeFile("Kurssuche/courses/ohne-titel.json", JSON.stringify({ id: "x" }))])

    const result = await loadCoursesFromFileList(files)

    expect(result.courses).toHaveLength(0)
    expect(result.failedFiles).toEqual(["ohne-titel.json"])
  })

  it("ignores non-JSON files in the courses folder", async () => {
    const files = makeFileList([
      makeFile("Kurssuche/courses/kurs-a.json", validCourseJson),
      makeFile("Kurssuche/courses/readme.md", "# not a course"),
    ])

    const result = await loadCoursesFromFileList(files)

    expect(result.courses).toHaveLength(1)
    expect(result.failedFiles).toHaveLength(0)
  })

  it("collects PDFs from a recognized sibling folder alias", async () => {
    const files = makeFileList([
      makeFile("Kurssuche/courses/kurs-a.json", validCourseJson),
      makeFile("Kurssuche/source-pdfs/kurs-a.pdf", "PDF-INHALT"),
    ])

    const result = await loadCoursesFromFileList(files)

    expect(result.pdfFiles.size).toBe(1)
    expect(resolvePdfFile(result.pdfFiles, "kurs-a.pdf")).not.toBeNull()
    expect(resolvePdfFile(result.pdfFiles, "unbekannt.pdf")).toBeNull()
  })

  it("returns no PDFs when no matching sibling folder is present", async () => {
    const files = makeFileList([makeFile("Kurssuche/courses/kurs-a.json", validCourseJson)])

    const result = await loadCoursesFromFileList(files)

    expect(result.pdfFiles.size).toBe(0)
  })
})
