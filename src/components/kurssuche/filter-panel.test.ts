import { describe, expect, it } from "vitest"
import { courseMatchesFilters, createEmptyFilterState } from "./filter-panel"
import type { Course } from "@/types/course"

function makeCourse(overrides: Partial<Course> = {}): Course {
  return {
    id: "test-course",
    titel: "Testkurs",
    massnahmentyp: "Orientierung",
    regionen: ["Bregenz"],
    themen_tags: ["IT"],
    zielgruppe_tags: ["Frauen"],
    termine: [],
    veranstaltungsort: [],
    kontakt: [],
    quelle: { dateiname: "test.pdf" },
    ...overrides,
  }
}

describe("courseMatchesFilters", () => {
  it("matches everything when no filter is active", () => {
    const course = makeCourse()
    expect(courseMatchesFilters(course, createEmptyFilterState())).toBe(true)
  })

  it("applies OR logic within a single category", () => {
    const course = makeCourse({ themen_tags: ["IT"] })
    const filters = createEmptyFilterState()
    filters.themen_tags.add("IT")
    filters.themen_tags.add("Pflege")
    expect(courseMatchesFilters(course, filters)).toBe(true)
  })

  it("applies AND logic across categories", () => {
    const course = makeCourse({ regionen: ["Bregenz"], themen_tags: ["IT"] })
    const filters = createEmptyFilterState()
    filters.regionen.add("Bregenz")
    filters.themen_tags.add("Pflege") // course does not have this tag
    expect(courseMatchesFilters(course, filters)).toBe(false)
  })

  it("excludes a course missing the filtered field (e.g. no regionen)", () => {
    const course = makeCourse({ regionen: [] })
    const filters = createEmptyFilterState()
    filters.regionen.add("Bregenz")
    expect(courseMatchesFilters(course, filters)).toBe(false)
  })

  it("keeps a course with a missing field visible when that filter is inactive", () => {
    const course = makeCourse({ regionen: [] })
    expect(courseMatchesFilters(course, createEmptyFilterState())).toBe(true)
  })

  it("filters by massnahmentyp using the single-value field", () => {
    const course = makeCourse({ massnahmentyp: "Qualifizierung" })
    const filters = createEmptyFilterState()
    filters.massnahmentyp.add("Orientierung")
    expect(courseMatchesFilters(course, filters)).toBe(false)
  })
})
