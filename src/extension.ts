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
  branchBlock: boolean,
  decoratorBlock: boolean
): number {
  let endLineNumber = startLineNumber;

  for (let i = startLineNumber + 1; i < document.lineCount; i++) {
    const line = document.lineAt(i);
    if (line.firstNonWhitespaceCharacterIndex < currentIndentation) {
      break;
    }

    const lineStartBlock = findStartBlock(line);
    const lineDecorator = findDecorator(line);

    if (!startBlock && !branchBlock && !decoratorBlock) {
      if (lineStartBlock || lineDecorator || line.isEmptyOrWhitespace) {
        break;
      }
    }
    if (line.isEmptyOrWhitespace) {
      continue;
    }

    const lineBranchBlock = findBranchBlock(line);

    if (
      startBlock &&
      (!lineBranchBlock || lineDecorator) &&
      currentIndentation === line.firstNonWhitespaceCharacterIndex
    ) {
      break;
    }
    if (
      branchBlock &&
      currentIndentation === line.firstNonWhitespaceCharacterIndex &&
      (lineStartBlock ||
        lineBranchBlock ||
        (!lineStartBlock && lineBranchBlock))
    ) {
      break;
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

  let startLine = document.lineAt(startLineNumber);
  if (startLine.isEmptyOrWhitespace) {
    return;
  }

  let startOffset = 0;
  let decorator: boolean = false;

  if (findClassOrFunction(startLine)) {
    const previousLineNumber = startLineNumber - 1;
    if (previousLineNumber > 0) {
      const previousLine = document.lineAt(previousLineNumber);
      if (findDecorator(previousLine)) {
        startOffset = 1;
      }
    }
  } else if (findDecorator(startLine)) {
    startLineNumber += 1;
    startLine = document.lineAt(startLineNumber);
    startOffset = 1;
    decorator = true;
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
    branchBlock,
    decorator
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
  vscode.window.showInformationMessage(
    'Extension "pylineselect" is now active!'
  );
  const disposable = vscode.commands.registerCommand(
    "pylineselect.select",
    () => {
      selectBlock();
    }
  );

  context.subscriptions.push(disposable);
}

export function deactivate() {}
