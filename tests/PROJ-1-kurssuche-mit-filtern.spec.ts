import { test, expect, type Page } from "@playwright/test"

/**
 * The File System Access API's folder picker is a native OS dialog that
 * cannot be driven by Playwright. These tests replace `showDirectoryPicker`
 * and `indexedDB` with in-page fakes (installed before the app's scripts
 * run) so the app's real loading/filtering/rendering logic is exercised
 * end-to-end without a real folder or a real permission prompt.
 */
async function installFakeFileSystem(page: Page) {
  await page.addInitScript(() => {
    const kursA = {
      id: "kurs-a",
      titel: "Kurs A – Metalltechnik",
      massnahmentyp: "Orientierung",
      regionen: ["Bregenz"],
      themen_tags: ["IT"],
      zielgruppe_tags: ["Frauen"],
      zielgruppe: "Zielgruppe von Kurs A",
      ziel: "Ziel von Kurs A",
      inhalt: ["Erster Punkt", "Zweiter Punkt"],
      form_und_dauer: "6 Wochen",
      termine: [{ kursnummer: "M 1", start: "01.03.2026" }],
      veranstaltungsort: ["Adresse A"],
      kontakt: [{ name: "Kontakt A", email: "a@example.at" }],
      veranstalter: { name: "Veranstalter A" },
      quelle: { dateiname: "kurs-a.pdf" },
    }
    const kursB = {
      id: "kurs-b",
      titel: "Kurs B – Pflege",
      massnahmentyp: "Qualifizierung",
      regionen: ["Dornbirn"],
      themen_tags: ["Pflege"],
      zielgruppe_tags: [],
      termine: [],
      veranstaltungsort: [],
      kontakt: [],
      quelle: { dateiname: "kurs-b.pdf" },
    }
    const kursC = {
      id: "kurs-c",
      titel: "Kurs C – Ohne Region",
      massnahmentyp: "Training",
      regionen: [],
      themen_tags: ["IT"],
      zielgruppe_tags: [],
      termine: [],
      veranstaltungsort: [],
      kontakt: [],
      quelle: { dateiname: "kurs-c.pdf" },
    }

    function fileHandle(name: string, content: string) {
      return {
        kind: "file",
        name,
        getFile: async () => new File([content], name),
        queryPermission: async () => "granted",
        requestPermission: async () => "granted",
      }
    }
    function dirHandle(
      name: string,
      entries: unknown[],
      subfolders: Record<string, unknown> = {}
    ) {
      return {
        kind: "directory",
        name,
        values: async function* () {
          for (const e of entries) yield e
        },
        getDirectoryHandle: async (childName: string) => {
          if (subfolders[childName]) return subfolders[childName]
          throw new DOMException("not found", "NotFoundError")
        },
        getFileHandle: async (childName: string) => {
          const found = (entries as { kind: string; name: string }[]).find(
            (e) => e.kind === "file" && e.name === childName
          )
          if (!found) throw new DOMException("not found", "NotFoundError")
          return found
        },
        queryPermission: async () => "granted",
        requestPermission: async () => "granted",
      }
    }

    const coursesDir = dirHandle("courses", [
      fileHandle("kurs-a.json", JSON.stringify(kursA)),
      fileHandle("kurs-b.json", JSON.stringify(kursB)),
      fileHandle("kurs-c.json", JSON.stringify(kursC)),
      fileHandle("kaputt.json", "{ das ist kein gueltiges json"),
    ])
    const pdfDir = dirHandle("source-pdfs", [fileHandle("kurs-a.pdf", "PDF-INHALT-A")])
    const root = dirHandle("root", [], { courses: coursesDir, "source-pdfs": pdfDir })
    Object.defineProperty(window, "showDirectoryPicker", {
      value: async () => root,
      writable: true,
      configurable: true,
    })

    // Minimal fake IndexedDB — mirrors just enough of the real API surface
    // that src/lib/course-loader.ts's save/load-handle functions work.
    // Persists a "granted" flag in localStorage so it survives page reloads
    // (a fresh addInitScript run creates a new `root`, but the same flag).
    // `window.indexedDB` is a getter-only accessor on Window.prototype, so a
    // plain assignment silently no-ops — defineProperty is required.
    const GRANTED_KEY = "kurssuche-mock-granted"
    const fakeIndexedDB = {
      open: () => {
        const request: Record<string, unknown> = {}
        setTimeout(() => {
          const db = {
            createObjectStore: () => {},
            transaction: () => {
              const tx: Record<string, unknown> = {}
              const store = {
                put: () => {
                  localStorage.setItem(GRANTED_KEY, "1")
                  return {}
                },
                get: () => {
                  const r: Record<string, unknown> = {
                    result: localStorage.getItem(GRANTED_KEY) === "1" ? root : undefined,
                  }
                  setTimeout(() => (r.onsuccess as (() => void) | undefined)?.(), 0)
                  return r
                },
              }
              tx.objectStore = () => store
              setTimeout(() => (tx.oncomplete as (() => void) | undefined)?.(), 0)
              return tx
            },
          }
          request.result = db
          ;(request.onsuccess as (() => void) | undefined)?.()
        }, 0)
        return request
      },
    }
    Object.defineProperty(window, "indexedDB", {
      value: fakeIndexedDB,
      writable: true,
      configurable: true,
    })
  })
}

test.beforeEach(async ({ page }) => {
  await installFakeFileSystem(page)
})

test("lädt Kurse nach Klick auf 'Alle Kurse laden' und zeigt sie alphabetisch sortiert", async ({
  page,
}) => {
  await page.goto("/")
  await page.getByRole("button", { name: "Alle Kurse laden" }).click()
  await expect(page.getByText("3 Kurse geladen", { exact: false })).toBeVisible()

  const titles = await page.locator("button", { hasText: "Kurs" }).allTextContents()
  const order = titles.map((t) => t.trim()).filter((t) => t.startsWith("Kurs"))
  expect(order[0]).toContain("Kurs A")
  expect(order[1]).toContain("Kurs B")
  expect(order[2]).toContain("Kurs C")
})

test("meldet eine fehlerhafte JSON-Datei, ohne das Laden der übrigen Kurse zu blockieren", async ({
  page,
}) => {
  await page.goto("/")
  await page.getByRole("button", { name: "Alle Kurse laden" }).click()
  await expect(page.getByText("kaputt.json", { exact: false })).toBeVisible()
  await expect(page.getByText("3 Kurse geladen", { exact: false })).toBeVisible()
})

test("merkt sich die Ordnerfreigabe und lädt beim erneuten Öffnen automatisch", async ({ page }) => {
  await page.goto("/")
  await page.getByRole("button", { name: "Alle Kurse laden" }).click()
  await expect(page.getByText("3 Kurse geladen", { exact: false })).toBeVisible()

  await page.reload()
  await expect(page.getByText("3 Kurse geladen", { exact: false })).toBeVisible()
  await expect(page.getByRole("button", { name: "Alle Kurse laden" })).not.toBeVisible()
})

test("Themen-Filter: ODER innerhalb einer Kategorie zeigt Kurse mit mindestens einem Tag", async ({
  page,
}) => {
  await page.goto("/")
  await page.getByRole("button", { name: "Alle Kurse laden" }).click()
  await expect(page.getByText("3 Kurse geladen", { exact: false })).toBeVisible()

  await page.getByRole("checkbox", { name: "IT" }).check()
  await expect(page.getByText("Kurs A", { exact: false })).toBeVisible()
  await expect(page.getByText("Kurs C", { exact: false })).toBeVisible()
  await expect(page.getByText("Kurs B", { exact: false })).not.toBeVisible()
})

test("Region + Thema kombiniert: UND zwischen Kategorien liefert keine Treffer und zeigt Hinweis", async ({
  page,
}) => {
  await page.goto("/")
  await page.getByRole("button", { name: "Alle Kurse laden" }).click()
  await expect(page.getByText("3 Kurse geladen", { exact: false })).toBeVisible()

  await page.getByRole("checkbox", { name: "Bregenz" }).check()
  await page.getByRole("checkbox", { name: "Pflege" }).check()
  await expect(page.getByText("Keine Kurse gefunden", { exact: false })).toBeVisible()
})

test("ein Kurs ohne Region verschwindet bei aktivem Regionsfilter, ist ohne Filter sichtbar", async ({
  page,
}) => {
  await page.goto("/")
  await page.getByRole("button", { name: "Alle Kurse laden" }).click()
  await expect(page.getByText("Kurs C", { exact: false })).toBeVisible()

  await page.getByRole("checkbox", { name: "Bregenz" }).check()
  await expect(page.getByText("Kurs C", { exact: false })).not.toBeVisible()
})

test("aufgeklappte Kurskarte zeigt alle Details, fehlende Felder als 'keine Angabe'", async ({
  page,
}) => {
  await page.goto("/")
  await page.getByRole("button", { name: "Alle Kurse laden" }).click()
  await page.getByText("Kurs B", { exact: false }).click()

  await expect(page.getByText("keine Angabe").first()).toBeVisible()
})

test("Original-PDF öffnen springt zum richtigen Dokument in einem neuen Tab", async ({ page, context }) => {
  await page.goto("/")
  await page.getByRole("button", { name: "Alle Kurse laden" }).click()
  await page.getByText("Kurs A", { exact: false }).click()

  const [popup] = await Promise.all([
    context.waitForEvent("page"),
    page.getByRole("button", { name: "Original-PDF öffnen" }).click(),
  ])
  await popup.waitForLoadState()
  expect(popup.url()).toContain("blob:")
})

test("fehlendes PDF zeigt eine Fehlermeldung statt eines leeren Tabs", async ({ page }) => {
  await page.goto("/")
  await page.getByRole("button", { name: "Alle Kurse laden" }).click()
  await page.getByText("Kurs B", { exact: false }).click()

  await page.getByRole("button", { name: "Original-PDF öffnen" }).click()
  await expect(page.getByText("nicht gefunden", { exact: false })).toBeVisible()
})
