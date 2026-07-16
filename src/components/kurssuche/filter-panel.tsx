"use client"

import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { Course, FilterKey } from "@/types/course"
import { FILTER_CATEGORIES, getCourseFilterValues } from "@/types/course"

export type FilterState = Record<FilterKey, Set<string>>

export function createEmptyFilterState(): FilterState {
  return {
    massnahmentyp: new Set(),
    regionen: new Set(),
    themen_tags: new Set(),
    zielgruppe_tags: new Set(),
  }
}

function collectOptions(courses: Course[], key: FilterKey): { value: string; count: number }[] {
  const counts = new Map<string, number>()
  for (const course of courses) {
    for (const value of getCourseFilterValues(course, key)) {
      counts.set(value, (counts.get(value) ?? 0) + 1)
    }
  }
  return [...counts.entries()]
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => a.value.localeCompare(b.value, "de"))
}

interface FilterPanelProps {
  courses: Course[]
  filters: FilterState
  onChange: (filters: FilterState) => void
}

export function FilterPanel({ courses, filters, onChange }: FilterPanelProps) {
  const activeCount = FILTER_CATEGORIES.reduce((sum, c) => sum + filters[c.key].size, 0)

  function toggle(key: FilterKey, value: string) {
    const next: FilterState = {
      massnahmentyp: new Set(filters.massnahmentyp),
      regionen: new Set(filters.regionen),
      themen_tags: new Set(filters.themen_tags),
      zielgruppe_tags: new Set(filters.zielgruppe_tags),
    }
    if (next[key].has(value)) {
      next[key].delete(value)
    } else {
      next[key].add(value)
    }
    onChange(next)
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base">Filter</CardTitle>
        {activeCount > 0 && (
          <Button variant="ghost" size="sm" onClick={() => onChange(createEmptyFilterState())}>
            Filter zurücksetzen ({activeCount})
          </Button>
        )}
      </CardHeader>
      <CardContent className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {FILTER_CATEGORIES.map(({ key, label }) => {
          const options = collectOptions(courses, key)
          if (options.length === 0) return null
          return (
            <div key={key}>
              <h3 className="mb-2 text-sm font-semibold text-foreground">{label}</h3>
              <ul className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
                {options.map(({ value, count }) => {
                  const id = `filter-${key}-${value}`
                  return (
                    <li key={value} className="flex items-center gap-2">
                      <Checkbox
                        id={id}
                        checked={filters[key].has(value)}
                        onCheckedChange={() => toggle(key, value)}
                      />
                      <label htmlFor={id} className="flex-1 cursor-pointer text-sm leading-none">
                        {value}
                      </label>
                      <span className="text-xs text-muted-foreground">{count}</span>
                    </li>
                  )
                })}
              </ul>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}

export function courseMatchesFilters(course: Course, filters: FilterState): boolean {
  for (const { key } of FILTER_CATEGORIES) {
    const selected = filters[key]
    if (selected.size === 0) continue
    const courseValues = getCourseFilterValues(course, key)
    const matchesAny = courseValues.some((v) => selected.has(v))
    if (!matchesAny) return false
  }
  return true
}
