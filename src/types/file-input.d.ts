import "react"

declare module "react" {
  interface InputHTMLAttributes<T> {
    // Non-standard attribute that lets <input type="file"> select a whole
    // folder. Works over file:// and needs no secure-context APIs, unlike
    // the File System Access API — see PROJ-1 tech design.
    webkitdirectory?: string
  }
}
