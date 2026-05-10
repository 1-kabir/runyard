declare class AppStatusStore {
    activeFilePath: string | null;
    cursorPosition: {
        line: number;
        col: number;
    };
    gitBranch: string;
    updateActiveFile(path: string | null): void;
    updateCursor(line: number, col: number): void;
    updateGitBranch(branch: string): void;
}
export declare const appStatus: AppStatusStore;
export {};
