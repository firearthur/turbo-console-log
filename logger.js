const vscode = require("vscode");
const logMessage = require("./log-message");

const getLastValidIndex = (arr, i) => {
  if (i < 0) {
    return false;
  } else if (arr[i]) {
    return i;
  } else {
    return getLastValidIndex(arr, i - 1);
  }
};

module.exports = logCodeIndex => {
  const editor = vscode.window.activeTextEditor;
  const { languageId } = vscode.window.activeTextEditor.document;

  if (!editor) {
    return;
  }
  const tabSize = editor.options.tabSize;
  const document = editor.document;
  const selection = editor.selection;
  const selectedVar = document.getText(selection);
  const lineOfSelectedVar = selection.active.line;

  // Check if the selection line is not the last one in the document and the selected variable is not empty
  // if (selectedVar.trim().length !== 0) {
  editor.edit(editBuilder => {
    const config = vscode.workspace.getConfiguration("turboConsoleLog");
    const logCodeMappings = config.logCode || { javascript: "console.log" };
    const noSelectionLog = config.noSelectionLog || "something";
    let concatSelection = config.concatSelection;
    let logCode = logCodeMappings[languageId];

    if (Array.isArray(logCode) && logCode.length) {
      const index = getLastValidIndex(
        logCode,
        Math.min(logCode.length - 1, logCodeIndex)
      );

      logCode = logCode[index];
    }

    if (
      // in the case of not setting concat in csharp set it to true;
      languageId === "csharp" &&
      (concatSelection === undefined || concatSelection === null)
    ) {
      concatSelection = true;
    }

    const wrapLogMessage = config.wrapLogMessage || false;
    const logMessagePrefix =
      config.logMessagePrefix.length > 0 ? config.logMessagePrefix : "TCL";
    const quote = config.quote;
    const addSemicolonInTheEnd = config.addSemicolonInTheEnd || false;
    const logMessageLine = logMessage.logMessageLine(
      document,
      lineOfSelectedVar,
      selectedVar
    );
    const insertEnclosingClass = config.insertEnclosingClass;
    const insertEnclosingFunction = config.insertEnclosingFunction;
    editBuilder.insert(
      new vscode.Position(
        logMessageLine >= document.lineCount
          ? document.lineCount
          : logMessageLine,
        0
      ),
      logMessage.message(
        logCode,
        concatSelection,
        document,
        selectedVar,
        lineOfSelectedVar,
        wrapLogMessage,
        logMessagePrefix,
        quote,
        addSemicolonInTheEnd,
        insertEnclosingClass,
        insertEnclosingFunction,
        tabSize,
        noSelectionLog
      )
    );
  });
  // }
};
