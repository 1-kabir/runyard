import { EditorState, type Extension } from "@codemirror/state";
import { EditorView, keymap } from "@codemirror/view";
import { basicSetup } from "codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { oneDark } from "@codemirror/theme-one-dark";
import { history, historyKeymap } from "@codemirror/commands";
import { indentWithTab } from "@codemirror/commands";

export interface EditorOptions {
  parent: HTMLElement;
  doc: string;
  filePath: string;
  onChange?: (content: string) => void;
  onSave?: (content: string) => void;
  onSelectionChange?: (line: number, col: number) => void;
}

export function setupEditor(options: EditorOptions) {
  const ext = options.filePath.split('.').pop()?.toLowerCase();

  const extensions: Extension[] = [
    basicSetup,
    oneDark,
    history(),
    keymap.of([
      ...historyKeymap,
      indentWithTab
    ]),
    EditorView.updateListener.of((update) => {
...

        options.onChange(update.state.doc.toString());
      }
      if (update.selectionSet && options.onSelectionChange) {
        const pos = update.state.selection.main.head;
        const line = update.state.doc.lineAt(pos);
        options.onSelectionChange(line.number, pos - line.from + 1);
      }
    }),
  ];

  // Language auto-detection
  if (ext === 'js' || ext === 'jsx') {
    extensions.push(javascript({ typescript: false }));
  } else if (ext === 'ts' || ext === 'tsx') {
    extensions.push(javascript({ typescript: true }));
  } else if (ext === 'py') {
    extensions.push(python());
  }

  // Keymap for save
  if (options.onSave) {
    extensions.push(keymap.of([
      {
        key: "Mod-s",
        preventDefault: true,
        run: (view) => {
          options.onSave!(view.state.doc.toString());
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
    setValue: (content: string) => {
      view.dispatch({
        changes: { from: 0, to: view.state.doc.length, insert: content }
      });
    },
    destroy: () => view.destroy()
  };
}
