class AppStatusStore {
  activeFilePath = $state<string | null>(null);
  cursorPosition = $state<{ line: number; col: number }>({ line: 1, col: 1 });
  gitBranch = $state<string>("detached");
  // Tracks files that were just opened from the explorer
  justOpenedFiles = $state<Set<string>>(new Set());

  updateActiveFile(path: string | null) {
    this.activeFilePath = path;
  }

  markAsJustOpened(path: string) {
    this.justOpenedFiles.add(path);
  }

  consumeJustOpened(path: string): boolean {
    if (this.justOpenedFiles.has(path)) {
      this.justOpenedFiles.delete(path);
      return true;
    }
    return false;
  }

  updateCursor(line: number, col: number) {
    this.cursorPosition = { line, col };
  }

  updateGitBranch(branch: string) {
    this.gitBranch = branch;
  }
}

export const appStatus = new AppStatusStore();
