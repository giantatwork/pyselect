import * as assert from "assert";

import * as vscode from "vscode";

import { isPythonKeyword } from "../extension";

suite("Extension Test Suite", () => {
  const testInputs = [
    "    try:", // true
    "while True:", // true
    "def example():", // true
    "for i in range(5):", // true
    "if condition:", // true
    "class MyClass:", // true
    "async def func():", // true
    "    if x:", // true
    "def no_colon()", // false (no colon)
    "    while True:  ", // true
    "    with open('file') as f:", // true
  ];

  testInputs.forEach((input) => {
    console.log(`"${input}": ${isPythonKeyword(input)}`);
  });
});
