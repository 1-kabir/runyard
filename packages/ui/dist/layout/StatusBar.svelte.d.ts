declare const StatusBar: import("svelte").Component<Record<string, never>, {
    updateActiveFile: (path: string) => void;
    updateCursor: (line: number, col: number) => void;
}, "">;
type StatusBar = ReturnType<typeof StatusBar>;
export default StatusBar;
