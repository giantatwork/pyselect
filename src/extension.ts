import * as vscode from "vscode";

const startBlockRegex =
  /^\s*(def|class|if|for|while|try|with|async)\s*(.*)\s*:\s*$/;
const branchBlockRegex = /^\s*(else|elif|except|finally)\s*(.*)\s*:\s*$/;
const decoratorRegex = /^\s*@\w+(\.\w+)*(\(.*\))?\s*$/;
const classOrFunctionRegex = /^\s*(def|class)\s+\w+\s*(\(.*\))?\s*:\s*$/;

const findStartBlock = (line: vscode.TextLine) => {
  return startBlockRegex.test(line.text);
};
const findBranchBlock = (line: vscode.TextLine) => {
  return branchBlockRegex.test(line.text);
};
const findDecorator = (line: vscode.TextLine) => {
  return decoratorRegex.test(line.text);
};
const findClassOrFunction = (line: vscode.TextLine) => {
  return classOrFunctionRegex.test(line.text);
};

export function findBlockStart(
  document: vscode.TextDocument,
  startLineNumber: number,
  currentIndentation: number
): number {
  for (let i = startLineNumber - 1; i >= 0; i--) {
    const line = document.lineAt(i);
    if (
      line.firstNonWhitespaceCharacterIndex !== currentIndentation ||
      line.isEmptyOrWhitespace
    ) {
      break;
    }
    startLineNumber = i;
  }
  return startLineNumber;
}

export function findBlockEnd(
  document: vscode.TextDocument,
  startLineNumber: number,
  currentIndentation: number,
  startBlock: boolean,
  branchBlock: boolean
): number {
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
      !findBranchBlock(line) &&
      currentIndentation === line.firstNonWhitespaceCharacterIndex
    ) {
      break;
    }
    if (
      branchBlock &&
      currentIndentation === line.firstNonWhitespaceCharacterIndex &&
      (findStartBlock(line) ||
        findBranchBlock(line) ||
        (!findStartBlock(line) && !findBranchBlock(line)))
    ) {
      break;
    }
    if (!startBlock && !branchBlock) {
      if (findStartBlock(line)) {
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

  const classOrFunction = findClassOrFunction(startLine);
  let startOffset = 0;
  if (classOrFunction) {
    const previousLineNumber = startLineNumber - 1;
    if (previousLineNumber > 0) {
      const previousLine = document.lineAt(previousLineNumber);
      if (findDecorator(previousLine)) {
        startOffset = 1;
      }
    }
  }
  const startBlock = findStartBlock(startLine);
  const branchBlock = findBranchBlock(startLine);
  const currentIndentation = startLine.firstNonWhitespaceCharacterIndex;

  if (!startBlock && !branchBlock) {
    startLineNumber = findBlockStart(
      document,
      startLineNumber,
      currentIndentation
    );
  }

  const endLineNumber = findBlockEnd(
    document,
    startLineNumber,
    currentIndentation,
    startBlock,
    branchBlock
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
