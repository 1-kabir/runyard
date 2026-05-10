class AppStatusStore {
    activeFilePath = $state(null);
    cursorPosition = $state({ line: 1, col: 1 });
    gitBranch = $state("detached");
    updateActiveFile(path) {
        this.activeFilePath = path;
    }
    updateCursor(line, col) {
        this.cursorPosition = { line, col };
    }
    updateGitBranch(branch) {
        this.gitBranch = branch;
    }
}
export const appStatus = new AppStatusStore();
