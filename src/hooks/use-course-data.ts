"use client"

import { useCallback, useState } from "react"
import type { Course } from "@/types/course"
import { loadCoursesFromFileList, resolvePdfFile } from "@/lib/course-loader"

export type CourseDataStatus = "idle" | "loading" | "ready" | "error"

export function useCourseData() {
  const [status, setStatus] = useState<CourseDataStatus>("idle")
  const [courses, setCourses] = useState<Course[]>([])
  const [failedFiles, setFailedFiles] = useState<string[]>([])
  const [pdfFiles, setPdfFiles] = useState<Map<string, File>>(new Map())
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const loadFromFileList = useCallback(async (files: FileList) => {
    setStatus("loading")
    try {
      const result = await loadCoursesFromFileList(files)
      setCourses(result.courses)
      setFailedFiles(result.failedFiles)
      setPdfFiles(result.pdfFiles)
      setStatus("ready")
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Unbekannter Fehler beim Einlesen.")
      setStatus("error")
    }
  }, [])

  const getPdfFile = useCallback(
    async (dateiname: string) => resolvePdfFile(pdfFiles, dateiname),
    [pdfFiles]
  )

  return {
    status,
    courses,
    failedFiles,
    errorMessage,
    loadFromFileList,
    getPdfFile,
    pdfFolderAvailable: pdfFiles.size > 0,
  }
}
