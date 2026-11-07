/** Localize display literals only, preserving selectors, IDs, enum values and URLs. */
import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';
const ui = JSON.parse(fs.readFileSync('public/locales/ar/ui.json', 'utf8'));
const walk = (dir) =>
  fs
    .readdirSync(dir, { withFileTypes: true })
    .flatMap((e) =>
      e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]
    );
let count = 0;
for (const file of walk('src/js').filter(
  (f) => /\.(ts|js)$/.test(f) && !f.includes('/i18n/')
)) {
  const source = fs.readFileSync(file, 'utf8');
  const ast = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true);
  const edits = [];
  const visit = (node) => {
    if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
      let parent = node.parent;
      let display = false;
      // Search ancestors for explicit presentation APIs, not arbitrary strings.
      for (let i = 0; parent && i < 4; i++, parent = parent.parent) {
        if (ts.isCallExpression(parent) || ts.isNewExpression(parent)) {
          const expr = parent.expression.getText(ast);
          if (
            /^(trText|trHtml|alert|confirm|prompt|showAlert|showLoader|Error|TypeError|console\.(log|warn|error|info|debug))$/.test(
              expr
            )
          )
            display = true;
          break;
        }
        if (
          ts.isBinaryExpression(parent) &&
          /\.(textContent|innerText|placeholder|title)$/.test(
            parent.left.getText(ast)
          )
        )
          display = true;
      }
      if (display && ui[node.text] && ui[node.text] !== node.text)
        edits.push({
          start: node.getStart(ast),
          end: node.end,
          text: JSON.stringify(ui[node.text]),
        });
    }
    ts.forEachChild(node, visit);
  };
  visit(ast);
  let result = source;
  for (const edit of edits.reverse())
    result = result.slice(0, edit.start) + edit.text + result.slice(edit.end);
  if (edits.length) {
    fs.writeFileSync(file, result);
    count += edits.length;
  }
}
console.log(`تم تعريب ${count} نصًا في واجهات الأدوات.`);
