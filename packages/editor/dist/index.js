import { EditorState } from "@codemirror/state";
import { EditorView, keymap } from "@codemirror/view";
import { basicSetup } from "@codemirror/basic-setup";
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { oneDark } from "@codemirror/theme-one-dark";
export function setupEditor(options) {
    const ext = options.filePath.split('.').pop()?.toLowerCase();
    const extensions = [
        basicSetup,
        oneDark, // Dark theme as requested
        EditorView.updateListener.of((update) => {
            if (update.docChanged && options.onChange) {
                options.onChange(update.state.doc.toString());
            }
        }),
    ];
    // Language auto-detection
    if (ext === 'js' || ext === 'jsx') {
        extensions.push(javascript({ typescript: false }));
    }
    else if (ext === 'ts' || ext === 'tsx') {
        extensions.push(javascript({ typescript: true }));
    }
    else if (ext === 'py') {
        extensions.push(python());
    }
    // Keymap for save
    if (options.onSave) {
        extensions.push(keymap.of([
            {
                key: "Mod-s",
                preventDefault: true,
                run: (view) => {
                    options.onSave(view.state.doc.toString());
                    return true;
                }
            }
        ]));
    }
    const state = EditorState.create({
        doc: options.doc,
        extensions
    });
    const view = new EditorView({
        state,
        parent: options.parent
    });
    return {
        view,
        getValue: () => view.state.doc.toString(),
        setValue: (content) => {
            view.dispatch({
                changes: { from: 0, to: view.state.doc.length, insert: content }
            });
        },
        destroy: () => view.destroy()
    };
}
