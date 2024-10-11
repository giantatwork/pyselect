# PySelect

PySelect is a Visual Studio Code extension that helps Python developers quickly select entire code blocks (functions, classes, if-statements, loops, etc.) by simply placing the cursor at the start or within a block of code. This is especially useful when refactoring or analyzing code, as it eliminates the need for manually selecting a block line by line.

## Features

- Automatically Select Code Blocks: Place the cursor at the start or inside a function, class, or control structure (like if, for, or while), and PySelect will highlight the entire block for you.
- Support for Decorators: If a function or class has decorators, the selection will automatically include them.
- Branch Block Detection: Selects corresponding else, elif, except, and finally blocks in a seamless manner.
- Efficient Block Detection: Skips empty lines and maintains proper indentation when selecting blocks.

## How to Install

1. Download and install the extension via the Visual Studio Code marketplace or from source.
2. Once installed, activate the extension via the command palette.

## How to Use

1.	Open a Python file in Visual Studio Code.
2.	Place the cursor inside any function, class, or block (e.g., if, for, while, etc.).
3.	Use the command palette (Ctrl+Shift+P or Cmd+Shift+P on macOS) and type PySelect: Select Block or run the command directly via the shortcut:
- Command: PySelect: Select Block
4.	The entire block, including decorators (if present), will be selected.

## Extension Commands
Command	Description
`PySelect: Select Block` selects the code block.