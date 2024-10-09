import * as vscode from "vscode";

export const pythonDefRegex =
  /^\s*(?:def|class|if|for|while|try|with|async)\s*(.*):\s*$/;

export const isPythonKeyword = (lineText: string): boolean =>
  pythonDefRegex.test(lineText);

function selectSameIndentation() {
  const editor = vscode.window.activeTextEditor;
  if (!editor || editor.document.languageId !== "python") {
    return;
  }

  const document = editor.document;
  const selection = editor.selection;
  const currentLine = document.lineAt(selection.active.line);

  const currentIndentation = currentLine.firstNonWhitespaceCharacterIndex;

  let startLine = selection.active.line;
  let endLine = selection.active.line;

  if (isPythonKeyword(currentLine.text)) {
    for (let i = selection.active.line + 1; i < document.lineCount; i++) {
      const line = document.lineAt(i);

      if (line.isEmptyOrWhitespace) {
        continue;
      }

      if (
        (isPythonKeyword(line.text) &&
          line.firstNonWhitespaceCharacterIndex === currentIndentation) ||
        line.firstNonWhitespaceCharacterIndex < currentIndentation
      ) {
        break;
      } else {
        endLine = i;
      }
    }
  } else {
    // Search up
    for (let i = selection.active.line - 1; i >= 0; i--) {
      const line = document.lineAt(i);
      if (
        line.firstNonWhitespaceCharacterIndex >= currentIndentation &&
        line.isEmptyOrWhitespace === false
      ) {
        startLine = i;
      } else {
        break;
      }
    }

    // Search down
    for (let i = selection.active.line + 1; i < document.lineCount; i++) {
      const line = document.lineAt(i);
      if (
        line.firstNonWhitespaceCharacterIndex >= currentIndentation &&
        line.isEmptyOrWhitespace === false
      ) {
        endLine = i;
      } else {
        break;
      }
    }
  }

  const newSelection = new vscode.Selection(
    new vscode.Position(startLine, 0),
    new vscode.Position(endLine, document.lineAt(endLine).text.length)
  );

  editor.selection = newSelection;
  editor.revealRange(newSelection);
}

export function activate(context: vscode.ExtensionContext) {
  console.log('Extension "pyselect" is now active!');

  const disposable = vscode.commands.registerCommand("pyselect.select", () => {
    selectSameIndentation();
  });

  context.subscriptions.push(disposable);
}

export function deactivate() {}
