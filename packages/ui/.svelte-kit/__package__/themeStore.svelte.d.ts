declare class ThemeStore {
    current: "light" | "dark";
    constructor();
    load(): void;
    save(): void;
    toggle(): void;
    set(theme: "light" | "dark"): void;
    apply(): void;
}
export declare const theme: ThemeStore;
export {};
