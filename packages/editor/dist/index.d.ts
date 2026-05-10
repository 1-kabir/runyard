import { EditorView } from "@codemirror/view";
export interface EditorOptions {
    parent: HTMLElement;
    doc: string;
    filePath: string;
    onChange?: (content: string) => void;
    onSave?: (content: string) => void;
    onSelectionChange?: (line: number, col: number) => void;
}
export declare function setupEditor(options: EditorOptions): {
    view: EditorView;
    getValue: () => string;
    setValue: (content: string) => void;
    destroy: () => void;
};
