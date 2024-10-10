# Python Select Indentation Extension

A Visual Studio Code extension that allows users to select blocks of Python code based on indentation levels or related to specific Python keywords such as `def`, `class`, `if`, `for`, `while`, `try`, `with`, and `async`.

## Features

- **Keyword-Based Selection**: If the current line contains specific Python keywords, it will extend the selection to encompass all related lines until the indentation changes.
- **Select Same Indentation**: Automatically selects all lines of code that share the same indentation level as the currently selected line.

## Usage

1.	Open a Python file in Visual Studio Code.
2.	Place your cursor on a line that contains a keyword or any line you want to use as a reference.
3.	Execute the command Select Same Indentation. You can do this by:
    -	Pressing Ctrl+Shift+P to open the Command Palette.
    -	Typing Pyselect and selecting the command.

## Command
    • pyselect.select: Triggers the selection based on the current indentation level and/or keyword.

## Configuration

This extension does not require any additional configuration. Simply install it and start using it in your Python files.