import { describe, expect, it } from "vitest"
import { loadCoursesFromFolder } from "./course-loader"

function makeFileHandle(name: string, content: string): FileSystemFileHandle {
  return {
    kind: "file",
    name,
    isSameEntry: async () => false,
    queryPermission: async () => "granted",
    requestPermission: async () => "granted",
    getFile: async () => new File([content], name, { type: "application/json" }),
  } as unknown as FileSystemFileHandle
}

function makeDirHandle(
  name: string,
  entries: (FileSystemFileHandle | FileSystemDirectoryHandle)[],
  subfolders: Record<string, FileSystemDirectoryHandle> = {}
): FileSystemDirectoryHandle {
  return {
    kind: "directory",
    name,
    isSameEntry: async () => false,
    queryPermission: async () => "granted",
    requestPermission: async () => "granted",
    getDirectoryHandle: async (childName: string) => {
      const found = subfolders[childName]
      if (!found) throw new DOMException("not found", "NotFoundError")
      return found
    },
    getFileHandle: async (childName: string) => {
      const found = entries.find((e) => e.kind === "file" && e.name === childName)
      if (!found) throw new DOMException("not found", "NotFoundError")
      return found as FileSystemFileHandle
    },
    values: async function* () {
      for (const entry of entries) yield entry
    },
  } as unknown as FileSystemDirectoryHandle
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

describe("loadCoursesFromFolder", () => {
  it("loads valid JSON files from the courses subfolder", async () => {
    const coursesDir = makeDirHandle("courses", [makeFileHandle("kurs-a.json", validCourseJson)])
    const root = makeDirHandle("root", [], { courses: coursesDir })

    const result = await loadCoursesFromFolder(root)

    expect(result.courses).toHaveLength(1)
    expect(result.courses[0].titel).toBe("Kurs A")
    expect(result.failedFiles).toHaveLength(0)
  })

  it("skips a file with invalid JSON and reports it as failed", async () => {
    const coursesDir = makeDirHandle("courses", [
      makeFileHandle("kurs-a.json", validCourseJson),
      makeFileHandle("kaputt.json", "{ this is not valid json"),
    ])
    const root = makeDirHandle("root", [], { courses: coursesDir })

    const result = await loadCoursesFromFolder(root)

    expect(result.courses).toHaveLength(1)
    expect(result.failedFiles).toEqual(["kaputt.json"])
  })

  it("skips a JSON file missing the required 'titel' field", async () => {
    const coursesDir = makeDirHandle("courses", [
      makeFileHandle("ohne-titel.json", JSON.stringify({ id: "x" })),
    ])
    const root = makeDirHandle("root", [], { courses: coursesDir })

    const result = await loadCoursesFromFolder(root)

    expect(result.courses).toHaveLength(0)
    expect(result.failedFiles).toEqual(["ohne-titel.json"])
  })

  it("ignores non-JSON files in the courses folder", async () => {
    const coursesDir = makeDirHandle("courses", [
      makeFileHandle("kurs-a.json", validCourseJson),
      makeFileHandle("readme.md", "# not a course"),
    ])
    const root = makeDirHandle("root", [], { courses: coursesDir })

    const result = await loadCoursesFromFolder(root)

    expect(result.courses).toHaveLength(1)
    expect(result.failedFiles).toHaveLength(0)
  })

  it("falls back to the root folder when no courses subfolder alias matches", async () => {
    const root = makeDirHandle("root", [makeFileHandle("kurs-a.json", validCourseJson)])

    const result = await loadCoursesFromFolder(root)

    expect(result.courses).toHaveLength(1)
  })

  it("resolves the PDF sibling folder via one of its known aliases", async () => {
    const pdfDir = makeDirHandle("source-pdfs", [])
    const coursesDir = makeDirHandle("courses", [makeFileHandle("kurs-a.json", validCourseJson)])
    const root = makeDirHandle("root", [], { courses: coursesDir, "source-pdfs": pdfDir })

    const result = await loadCoursesFromFolder(root)

    expect(result.pdfFolder).toBe(pdfDir)
  })

  it("returns a null PDF folder when no alias matches", async () => {
    const coursesDir = makeDirHandle("courses", [makeFileHandle("kurs-a.json", validCourseJson)])
    const root = makeDirHandle("root", [], { courses: coursesDir })

    const result = await loadCoursesFromFolder(root)

    expect(result.pdfFolder).toBeNull()
  })
})
