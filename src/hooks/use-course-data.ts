"use client"

import { useCallback, useEffect, useState } from "react"
import type { Course } from "@/types/course"
import {
  hasReadPermission,
  isFileSystemAccessSupported,
  loadCoursesFromFolder,
  loadSavedDirectoryHandle,
  pickDataFolder,
  requestReadPermission,
  resolvePdfFile,
  saveDirectoryHandle,
} from "@/lib/course-loader"

export type CourseDataStatus =
  | "checking"
  | "unsupported"
  | "needs-permission"
  | "loading"
  | "ready"
  | "error"

export function useCourseData() {
  const [status, setStatus] = useState<CourseDataStatus>("checking")
  const [courses, setCourses] = useState<Course[]>([])
  const [failedFiles, setFailedFiles] = useState<string[]>([])
  const [pdfFolderHandle, setPdfFolderHandle] = useState<FileSystemDirectoryHandle | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const loadFromHandle = useCallback(async (handle: FileSystemDirectoryHandle) => {
    setStatus("loading")
    try {
      const result = await loadCoursesFromFolder(handle)
      setCourses(result.courses)
      setFailedFiles(result.failedFiles)
      setPdfFolderHandle(result.pdfFolder)
      setStatus("ready")
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Unbekannter Fehler beim Einlesen.")
      setStatus("error")
    }
  }, [])

  useEffect(() => {
    ;(async () => {
      if (!isFileSystemAccessSupported()) {
        setStatus("unsupported")
        return
      }
      const saved = await loadSavedDirectoryHandle()
      if (!saved) {
        setStatus("needs-permission")
        return
      }
      const granted = await hasReadPermission(saved)
      if (granted) {
        await loadFromHandle(saved)
      } else {
        setStatus("needs-permission")
      }
    })()
  }, [loadFromHandle])

  const requestFolder = useCallback(async () => {
    try {
      const saved = await loadSavedDirectoryHandle()
      if (saved) {
        const granted = await requestReadPermission(saved)
        if (granted) {
          await loadFromHandle(saved)
          return
        }
      }
      const picked = await pickDataFolder()
      await saveDirectoryHandle(picked)
      await loadFromHandle(picked)
    } catch (err) {
      // AbortError = Nutzer hat den Dialog abgebrochen, kein Fehlerzustand nötig
      if (err instanceof Error && err.name === "AbortError") return
      setErrorMessage(err instanceof Error ? err.message : "Ordner konnte nicht geöffnet werden.")
      setStatus("error")
    }
  }, [loadFromHandle])

  /** Always opens the picker, even if a folder is already saved — for "Anderen Ordner wählen". */
  const pickNewFolder = useCallback(async () => {
    try {
      const picked = await pickDataFolder()
      await saveDirectoryHandle(picked)
      await loadFromHandle(picked)
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return
      setErrorMessage(err instanceof Error ? err.message : "Ordner konnte nicht geöffnet werden.")
      setStatus("error")
    }
  }, [loadFromHandle])

  const getPdfFile = useCallback(
    (dateiname: string) => resolvePdfFile(pdfFolderHandle, dateiname),
    [pdfFolderHandle]
  )

  return {
    status,
    courses,
    failedFiles,
    errorMessage,
    requestFolder,
    pickNewFolder,
    getPdfFile,
    pdfFolderAvailable: pdfFolderHandle !== null,
  }
}
