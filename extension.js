const vscode = require('vscode')

function activate(context) {
  const decoration = vscode.window.createTextEditorDecorationType({
    backgroundColor: '#22364AAA',
    borderRadius: '4px'
  })

  function updateDecorations(editor) {
    if (!editor) return
    const text = editor.document.getText()
    const ranges = []

    // beginsql ... endsql blocks
    const beginEndRegex = /(^|\n)[^\S\n]*--\s*(beginsql|begin-sql)[\s\S]*?(?:(^|\n)[^\S\n]*--\s*(endsql|end-sql))/gi
    let m
    while ((m = beginEndRegex.exec(text)) !== null) {
      const start = editor.document.positionAt(m.index + (m[1] ? m[1].length : 0))
      const end = editor.document.positionAt(beginEndRegex.lastIndex)
      ranges.push(new vscode.Range(start, end))
    }

    // single-line -- sql ... ; blocks
    const lineSqlRegex = /(^|\n)[^\S\n]*--\s*sql.*?;(?=\s*(\n|$))/gi
    while ((m = lineSqlRegex.exec(text)) !== null) {
      const start = editor.document.positionAt(m.index + (m[1] ? m[1].length : 0))
      const end = editor.document.positionAt(lineSqlRegex.lastIndex)
      ranges.push(new vscode.Range(start, end))
    }

    // Go raw string ` ... ` starting with SQL keywords (case-insensitive)
    const goRawSqlRegex = /`\s*(select|insert|delete|update|drop|alter|create|set|truncate|grant|revoke)\b[\s\S]*?`/gi
    while ((m = goRawSqlRegex.exec(text)) !== null) {
      const start = editor.document.positionAt(m.index)
      const end = editor.document.positionAt(goRawSqlRegex.lastIndex)
      ranges.push(new vscode.Range(start, end))
    }

    // Double-quoted string "..." starting with SQL keywords (supports escaped quotes)
    const dblSqlRegex = /"\s*(select|insert|delete|update|drop|alter|create|set|truncate|grant|revoke)\b(?:\\.|[^"\\])*"/gi
    while ((m = dblSqlRegex.exec(text)) !== null) {
      const start = editor.document.positionAt(m.index)
      const end = editor.document.positionAt(dblSqlRegex.lastIndex)
      ranges.push(new vscode.Range(start, end))
    }

    // Single-quoted string '...' starting with SQL keywords (supports escaped quotes)
    const sglSqlRegex = /'\s*(select|insert|delete|update|drop|alter|create|set|truncate|grant|revoke)\b(?:\\.|[^'\\])*'/gi
    while ((m = sglSqlRegex.exec(text)) !== null) {
      const start = editor.document.positionAt(m.index)
      const end = editor.document.positionAt(sglSqlRegex.lastIndex)
      ranges.push(new vscode.Range(start, end))
    }

    editor.setDecorations(decoration, ranges)
  }

  function triggerUpdate() {
    const editor = vscode.window.activeTextEditor
    updateDecorations(editor)
  }

  context.subscriptions.push(
    vscode.window.onDidChangeActiveTextEditor(triggerUpdate),
    vscode.workspace.onDidChangeTextDocument(triggerUpdate),
    vscode.workspace.onDidOpenTextDocument(triggerUpdate)
  )

  triggerUpdate()
}

function deactivate() {}

module.exports = { activate, deactivate }