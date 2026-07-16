export {}

declare global {
  interface FileSystemHandlePermissionDescriptor {
    mode?: "read" | "readwrite"
  }

  interface FileSystemHandle {
    readonly kind: "file" | "directory"
    readonly name: string
    isSameEntry(other: FileSystemHandle): Promise<boolean>
    queryPermission(descriptor?: FileSystemHandlePermissionDescriptor): Promise<PermissionState>
    requestPermission(descriptor?: FileSystemHandlePermissionDescriptor): Promise<PermissionState>
  }

  interface FileSystemFileHandle extends FileSystemHandle {
    readonly kind: "file"
    getFile(): Promise<File>
  }

  interface FileSystemDirectoryHandle extends FileSystemHandle {
    readonly kind: "directory"
    getDirectoryHandle(name: string, options?: { create?: boolean }): Promise<FileSystemDirectoryHandle>
    getFileHandle(name: string, options?: { create?: boolean }): Promise<FileSystemFileHandle>
    values(): AsyncIterableIterator<FileSystemDirectoryHandle | FileSystemFileHandle>
  }

  interface Window {
    showDirectoryPicker?: (options?: { id?: string; mode?: "read" | "readwrite" }) => Promise<FileSystemDirectoryHandle>
  }
}
