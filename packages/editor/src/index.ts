import { EditorState, Extension } from '@codemirror/state';
import { EditorView } from '@codemirror/view';
import { basicSetup } from 'codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';

export interface EditorOptions {
  parent: HTMLElement;
  initialContent: string;
  filePath: string;
  theme: 'light' | 'dark';
  onChange?: (content: string) => void;
}

export function setupEditor(options: EditorOptions) {
  let languageExtension: Extension[] = [];

  if (options.filePath.endsWith('.js') || options.filePath.endsWith('.ts') || options.filePath.endsWith('.jsx') || options.filePath.endsWith('.tsx')) {
    languageExtension = [javascript({ typescript: options.filePath.endsWith('.ts') || options.filePath.endsWith('.tsx') })];
  } else if (options.filePath.endsWith('.py')) {
    languageExtension = [python()];
  }

  const baseTheme = EditorView.theme({
    "&": {
      height: "100%",
      fontSize: "14px"
    },
    ".cm-scroller": {
      fontFamily: "var(--font-mono, monospace)"
    }
  }, { dark: options.theme === 'dark' });

  const state = EditorState.create({
    doc: options.initialContent,
    extensions: [
      basicSetup,
      baseTheme,
      ...languageExtension,
      EditorView.updateListener.of((update) => {
        if (update.docChanged && options.onChange) {
          options.onChange(update.state.doc.toString());
        }
      })
    ]
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
        changes: {
          from: 0,
          to: view.state.doc.length,
          insert: content
        }
      });
    },
    destroy: () => view.destroy()
  };
}
