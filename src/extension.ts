import * as vscode from "vscode";

export const pythonDefRegex =
  /^\s*(?:def|class|if|else|elif|for|while|try|except|finally|with|async)\s*(.*):\s*$/;

export const isPythonKeyword = (lineText: string): boolean =>
  pythonDefRegex.test(lineText);

/**
 * Find the start of the block by moving upward from the current line.
 */
export function findBlockStart(
  document: vscode.TextDocument,
  startLine: number,
  currentIndentation: number
): number {
  for (let i = startLine - 1; i >= 0; i--) {
    const line = document.lineAt(i);
    if (line.isEmptyOrWhitespace) {
      continue;
    }
    if (line.firstNonWhitespaceCharacterIndex < currentIndentation) {
      break;
    } else {
      startLine = i;
    }
  }
  return startLine;
}

/**
 * Find the end of the block by moving downward from the current line.
 * Stop if indentation is lower than current line or if Python keyword is found.
 */
export function findBlockEnd(
  document: vscode.TextDocument,
  startLine: number,
  currentIndentation: number
): number {
  let endLine = startLine;
  for (let i = startLine + 1; i < document.lineCount; i++) {
    const line = document.lineAt(i);
    if (line.isEmptyOrWhitespace) {
      continue;
    }
    if (
      line.firstNonWhitespaceCharacterIndex < currentIndentation ||
      (line.firstNonWhitespaceCharacterIndex === currentIndentation &&
        isPythonKeyword(line.text))
    ) {
      break;
    } else {
      endLine = i;
    }
  }
  return endLine;
}

export function selectPythonBlock() {
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

  if (!isPythonKeyword(currentLine.text)) {
    startLine = findBlockStart(
      document,
      selection.active.line,
      currentIndentation
    );
  }

  endLine = findBlockEnd(document, selection.active.line, currentIndentation);

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
    selectPythonBlock();
  });

  context.subscriptions.push(disposable);
}

export function deactivate() {}
