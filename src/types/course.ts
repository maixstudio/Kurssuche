export interface CourseTermin {
  kursnummer?: string | null
  start?: string | null
  anmerkung?: string | null
}

export interface CourseKontakt {
  name?: string | null
  telefon?: string | null
  email?: string | null
  bereich?: string | null
}

export interface CourseVeranstalter {
  name?: string | null
  adresse?: string | null
  telefon?: string | null
  email?: string | null
}

export interface CourseQuelle {
  dateiname: string
  ausstellungsdatum?: string | null
}

export interface Course {
  id: string
  titel: string
  massnahmentyp?: string | null
  regionen: string[]
  teilregion?: string | null
  themen_tags: string[]
  zielgruppe_tags: string[]
  sprachniveau?: string | null
  altersgrenze?: { von: number | null; bis: number | null } | null
  zielgruppe?: string | null
  ziel?: string | null
  inhalt?: Record<string, string[]> | string[] | null
  form_und_dauer?: string | null
  termine: CourseTermin[]
  veranstaltungsort: string[]
  kontakt: CourseKontakt[]
  veranstalter?: CourseVeranstalter | null
  anmeldung_hinweis?: string | null
  quelle: CourseQuelle
}

/** Filter categories a course can be matched against. UND between categories, ODER within one. */
export type FilterKey = "massnahmentyp" | "regionen" | "themen_tags" | "zielgruppe_tags"

export const FILTER_CATEGORIES: { key: FilterKey; label: string }[] = [
  { key: "massnahmentyp", label: "Maßnahmentyp" },
  { key: "regionen", label: "Region" },
  { key: "themen_tags", label: "Themen" },
  { key: "zielgruppe_tags", label: "Zielgruppe" },
]

export function getCourseFilterValues(course: Course, key: FilterKey): string[] {
  if (key === "massnahmentyp") {
    return course.massnahmentyp ? [course.massnahmentyp] : []
  }
  return course[key] ?? []
}
