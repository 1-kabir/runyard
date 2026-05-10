class AppStatusStore {
  activeFilePath = $state<string | null>(null);
  cursorPosition = $state<{ line: number; col: number }>({ line: 1, col: 1 });
  gitBranch = $state<string>("detached");

  updateActiveFile(path: string | null) {
    this.activeFilePath = path;
  }

  updateCursor(line: number, col: number) {
    this.cursorPosition = { line, col };
  }

  updateGitBranch(branch: string) {
    this.gitBranch = branch;
  }
}

export const appStatus = new AppStatusStore();
