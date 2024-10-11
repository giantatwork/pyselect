import * as vscode from "vscode";

const startBlockRegex =
  /^\s*(def|class|if|for|while|try|with|async)\s*(.*)\s*:\s*$/;
const branchBlockRegex = /^\s*(else|elif|except|finally)\s*(.*)\s*:\s*$/;
const decoratorRegex = /^\s*@\w+(\.\w+)*(\(.*\))?\s*$/;
const classOrFunctionRegex = /^\s*(def|class)\s+\w+\s*(\(.*\))?\s*:\s*$/;

const isStartBlock = (line: vscode.TextLine) => {
  return startBlockRegex.test(line.text);
};
const isBranchBlock = (line: vscode.TextLine) => {
  return branchBlockRegex.test(line.text);
};
const isDecorator = (line: vscode.TextLine) => {
  return decoratorRegex.test(line.text);
};
const isClassOrFunction = (line: vscode.TextLine) => {
  return classOrFunctionRegex.test(line.text);
};

export function findBlockEnd(
  document: vscode.TextDocument,
  startLineNumber: number,
  currentIndentation: number
): number {
  const line = document.lineAt(startLineNumber);
  const startBlock = isStartBlock(line);
  const branchBlock = isBranchBlock(line);

  let endLineNumber = startLineNumber;

  for (let i = startLineNumber + 1; i < document.lineCount; i++) {
    const line = document.lineAt(i);
    if (line.isEmptyOrWhitespace) {
      continue;
    }
    if (line.firstNonWhitespaceCharacterIndex < currentIndentation) {
      break;
    }
    if (
      startBlock &&
      !isBranchBlock(line) &&
      currentIndentation === line.firstNonWhitespaceCharacterIndex
    ) {
      break;
    }
    if (
      branchBlock &&
      currentIndentation === line.firstNonWhitespaceCharacterIndex &&
      (isStartBlock(line) || isBranchBlock(line))
    ) {
      break;
    }
    if (!startBlock && !branchBlock) {
      if (isStartBlock(line)) {
        break;
      }
    }

    endLineNumber = i;
  }

  return endLineNumber;
}

export function selectBlock() {
  const editor = vscode.window.activeTextEditor;
  if (!editor || editor.document.languageId !== "python") {
    return;
  }

  const document = editor.document;
  const selection = editor.selection;

  let startLineNumber = selection.isEmpty
    ? selection.active.line
    : selection.end.line + 1;

  const startLine = document.lineAt(startLineNumber);
  if (startLine.isEmptyOrWhitespace) {
    return;
  }

  const classOrFunction = isClassOrFunction(startLine);
  let startOffset = 0;
  if (classOrFunction) {
    const previousLineNumber = startLineNumber - 1;
    if (previousLineNumber > 0) {
      const previousLine = document.lineAt(previousLineNumber);
      if (isDecorator(previousLine)) {
        startOffset = 1;
      }
    }
  }

  const currentIndentation = startLine.firstNonWhitespaceCharacterIndex;
  const endLineNumber = findBlockEnd(
    document,
    startLineNumber,
    currentIndentation
  );

  startLineNumber -= startOffset;

  if (!selection.isEmpty) {
    if (selection.start.line < startLineNumber) {
      startLineNumber = selection.start.line;
    }
  }

  const newSelection = new vscode.Selection(
    new vscode.Position(startLineNumber, 0),
    new vscode.Position(
      endLineNumber,
      document.lineAt(endLineNumber).text.length
    )
  );

  editor.selection = newSelection;
  editor.revealRange(newSelection);
}

export function activate(context: vscode.ExtensionContext) {
  vscode.window.showInformationMessage('Extension "pyselect" is now active!');
  const disposable = vscode.commands.registerCommand("pyselect.select", () => {
    selectBlock();
  });

  context.subscriptions.push(disposable);
}

export function deactivate() {}
