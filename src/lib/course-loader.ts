import type { Course } from "@/types/course"

const DB_NAME = "kurssuche"
const STORE_NAME = "handles"
const HANDLE_KEY = "datenordner"

// Der ausgewählte Elternordner enthält zwei Geschwisterordner: einen mit den
// Kurs-JSONs, einen mit den Original-PDFs. Beide Namen sind über Aliasse
// tolerant, damit die Ordnerbenennung im geteilten Laufwerk nicht exakt
// getroffen werden muss.
const COURSES_SUBFOLDER_ALIASES = ["courses", "kurse", "json"]
const PDF_SUBFOLDER_ALIASES = ["source-pdfs", "pdfs", "pdf", "dokumente"]

export function isFileSystemAccessSupported(): boolean {
  return typeof window !== "undefined" && typeof window.showDirectoryPicker === "function"
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1)
    request.onupgradeneeded = () => {
      request.result.createObjectStore(STORE_NAME)
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export async function saveDirectoryHandle(handle: FileSystemDirectoryHandle): Promise<void> {
  const db = await openDb()
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite")
    tx.objectStore(STORE_NAME).put(handle, HANDLE_KEY)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

export async function loadSavedDirectoryHandle(): Promise<FileSystemDirectoryHandle | null> {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly")
    const request = tx.objectStore(STORE_NAME).get(HANDLE_KEY)
    request.onsuccess = () => resolve((request.result as FileSystemDirectoryHandle) ?? null)
    request.onerror = () => reject(request.error)
  })
}

/** Checks current permission without prompting the user. */
export async function hasReadPermission(handle: FileSystemDirectoryHandle): Promise<boolean> {
  const state = await handle.queryPermission({ mode: "read" })
  return state === "granted"
}

/** Prompts the user for permission (must be called from a user gesture). */
export async function requestReadPermission(handle: FileSystemDirectoryHandle): Promise<boolean> {
  const state = await handle.requestPermission({ mode: "read" })
  return state === "granted"
}

export async function pickDataFolder(): Promise<FileSystemDirectoryHandle> {
  if (!window.showDirectoryPicker) {
    throw new Error("File System Access API wird von diesem Browser nicht unterstützt.")
  }
  return window.showDirectoryPicker({ id: "kurssuche-daten", mode: "read" })
}

async function findSubfolder(
  parent: FileSystemDirectoryHandle,
  aliases: string[]
): Promise<FileSystemDirectoryHandle | null> {
  for (const alias of aliases) {
    try {
      return await parent.getDirectoryHandle(alias)
    } catch {
      // try next alias
    }
  }
  return null
}

export interface LoadResult {
  courses: Course[]
  failedFiles: string[]
  pdfFolder: FileSystemDirectoryHandle | null
}

export async function loadCoursesFromFolder(root: FileSystemDirectoryHandle): Promise<LoadResult> {
  const coursesFolder = (await findSubfolder(root, COURSES_SUBFOLDER_ALIASES)) ?? root
  const pdfFolder = await findSubfolder(root, PDF_SUBFOLDER_ALIASES)

  const courses: Course[] = []
  const failedFiles: string[] = []

  for await (const entry of coursesFolder.values()) {
    if (entry.kind !== "file" || !entry.name.toLowerCase().endsWith(".json")) continue
    try {
      const file = await (entry as FileSystemFileHandle).getFile()
      const text = await file.text()
      const parsed = JSON.parse(text) as Course
      if (!parsed.titel) throw new Error("Feld 'titel' fehlt")
      courses.push(parsed)
    } catch {
      failedFiles.push(entry.name)
    }
  }

  return { courses, failedFiles, pdfFolder }
}

/** Resolves a File object for the PDF belonging to a course, if the PDF folder is known. */
export async function resolvePdfFile(
  pdfFolder: FileSystemDirectoryHandle | null,
  dateiname: string
): Promise<File | null> {
  if (!pdfFolder) return null
  try {
    const handle = await pdfFolder.getFileHandle(dateiname)
    return await handle.getFile()
  } catch {
    return null
  }
}
