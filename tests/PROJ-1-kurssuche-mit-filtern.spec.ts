import { test, expect } from "@playwright/test"
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "fs"
import { tmpdir } from "os"
import { join } from "path"

/**
 * The app selects a folder via <input type="file" webkitdirectory> — no
 * secure-context API involved (this replaced the File System Access API
 * after it turned out to be blocked when the app is opened via file://,
 * see BUG-3 below). Playwright's setInputFiles() can upload a real
 * directory to a webkitdirectory input directly, so these tests build
 * actual temp folders instead of mocking browser APIs.
 */
function buildTestFolder() {
  const root = mkdtempSync(join(tmpdir(), "kurssuche-e2e-"))
  const coursesDir = join(root, "courses")
  const pdfDir = join(root, "source-pdfs")
  mkdirSync(coursesDir)
  mkdirSync(pdfDir)

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

  writeFileSync(join(coursesDir, "kurs-a.json"), JSON.stringify(kursA))
  writeFileSync(join(coursesDir, "kurs-b.json"), JSON.stringify(kursB))
  writeFileSync(join(coursesDir, "kurs-c.json"), JSON.stringify(kursC))
  writeFileSync(join(coursesDir, "kaputt.json"), "{ das ist kein gueltiges json")
  writeFileSync(join(pdfDir, "kurs-a.pdf"), "PDF-INHALT-A")

  return root
}

function buildEmptyTestFolder() {
  const root = mkdtempSync(join(tmpdir(), "kurssuche-e2e-empty-"))
  mkdirSync(join(root, "courses"))
  // Playwright's setInputFiles cannot upload a directory containing zero
  // files at all, so this placeholder (ignored by the app — not JSON) keeps
  // the fixture uploadable while still testing the "no course data" path.
  writeFileSync(join(root, "README.txt"), "placeholder")
  return root
}

async function selectFolder(page: import("@playwright/test").Page, folderPath: string) {
  await page.locator('input[type="file"]').setInputFiles(folderPath)
}

test.describe("PROJ-1 Kurssuche mit Filtern", () => {
  let folder: string
  let emptyFolder: string

  test.beforeAll(() => {
    folder = buildTestFolder()
    emptyFolder = buildEmptyTestFolder()
  })

  test.afterAll(() => {
    rmSync(folder, { recursive: true, force: true })
    rmSync(emptyFolder, { recursive: true, force: true })
  })

  test("lädt Kurse nach Ordnerauswahl und zeigt sie alphabetisch sortiert", async ({ page }) => {
    await page.goto("/")
    await selectFolder(page, folder)
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
    await selectFolder(page, folder)
    await expect(page.getByText("kaputt.json", { exact: false })).toBeVisible()
    await expect(page.getByText("3 Kurse geladen", { exact: false })).toBeVisible()
  })

  test("Themen-Filter: ODER innerhalb einer Kategorie zeigt Kurse mit mindestens einem Tag", async ({
    page,
  }) => {
    await page.goto("/")
    await selectFolder(page, folder)
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
    await selectFolder(page, folder)
    await expect(page.getByText("3 Kurse geladen", { exact: false })).toBeVisible()

    await page.getByRole("checkbox", { name: "Bregenz" }).check()
    await page.getByRole("checkbox", { name: "Pflege" }).check()
    await expect(page.getByText("Keine Kurse gefunden", { exact: false })).toBeVisible()
  })

  test("ein Kurs ohne Region verschwindet bei aktivem Regionsfilter, ist ohne Filter sichtbar", async ({
    page,
  }) => {
    await page.goto("/")
    await selectFolder(page, folder)
    await expect(page.getByText("Kurs C", { exact: false })).toBeVisible()

    await page.getByRole("checkbox", { name: "Bregenz" }).check()
    await expect(page.getByText("Kurs C", { exact: false })).not.toBeVisible()
  })

  test("aufgeklappte Kurskarte zeigt alle Details, fehlende Felder als 'keine Angabe'", async ({ page }) => {
    await page.goto("/")
    await selectFolder(page, folder)
    await page.getByText("Kurs B", { exact: false }).click()

    await expect(page.getByText("keine Angabe").first()).toBeVisible()
  })

  test("Original-PDF öffnen springt zum richtigen Dokument in einem neuen Tab", async ({
    page,
    context,
  }) => {
    await page.goto("/")
    await selectFolder(page, folder)
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
    await selectFolder(page, folder)
    await page.getByText("Kurs B", { exact: false }).click()

    await page.getByRole("button", { name: "Original-PDF öffnen" }).click()
    await expect(page.getByText("nicht gefunden", { exact: false })).toBeVisible()
  })

  test("BUG-1 Regression: leerer Ordner zeigt eigene Meldung mit Möglichkeit, einen anderen Ordner zu wählen", async ({
    page,
  }) => {
    await page.goto("/")
    await selectFolder(page, emptyFolder)

    await expect(page.getByText("Keine Kursdaten in diesem Ordner gefunden")).toBeVisible()
    await expect(page.getByText("Keine Kurse gefunden. Passe die Filterauswahl an.")).not.toBeVisible()

    await selectFolder(page, folder)
    await expect(page.getByText("Kurs A", { exact: false })).toBeVisible()
  })

  test("BUG-2 Regression: PDF-Blob-URL wird nach dem Öffnen wieder freigegeben", async ({ page }) => {
    await page.clock.install()
    await page.goto("/")
    await page.addInitScript(() => {
      ;(window as unknown as { __revokedUrls: string[] }).__revokedUrls = []
      const original = URL.revokeObjectURL.bind(URL)
      URL.revokeObjectURL = (url: string) => {
        ;(window as unknown as { __revokedUrls: string[] }).__revokedUrls.push(url)
        original(url)
      }
    })
    await page.reload()
    await selectFolder(page, folder)
    await page.getByText("Kurs A", { exact: false }).click()

    const popupPromise = page.context().waitForEvent("page")
    await page.getByRole("button", { name: "Original-PDF öffnen" }).click()
    const popup = await popupPromise
    await popup.waitForLoadState()

    await page.clock.fastForward(61_000)
    const revokedUrls = await page.evaluate(
      () => (window as unknown as { __revokedUrls: string[] }).__revokedUrls
    )
    expect(revokedUrls).toContain(popup.url())
  })

  test("BUG-3 Regression: 'Anderen Ordner wählen' ist jederzeit verfügbar, auch mit geladenen Kursen", async ({
    page,
  }) => {
    await page.goto("/")
    await selectFolder(page, folder)
    await expect(page.getByText("3 Kurse geladen", { exact: false })).toBeVisible()

    await expect(page.getByRole("button", { name: "Anderen Ordner wählen" })).toBeVisible()
  })
})
