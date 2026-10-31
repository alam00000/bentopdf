import fs from 'fs';
import path from 'path';
import ts from 'typescript';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../src/js');
const OUT_FILE = path.resolve(__dirname, '../translations/ui-source.json');
const SKIP_DIRS = new Set(['editcore', 'types', 'i18n', 'config']);
const HELPER_ARGUMENTS = {
  showAlert: 2,
  showLoader: 1,
  showAlertModal: 2,
  showModal: 2,
};
const LETTERS = /\p{L}{2}/u;

export function extractUiStrings() {
  const files = [];
  (function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (!SKIP_DIRS.has(entry.name)) walk(full);
      } else if (/\.ts$/.test(entry.name)) {
        files.push(full);
      }
    }
  })(ROOT);

  const strings = new Map();

  const formatControlLabel = (key) =>
    key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (c) => c.toUpperCase())
      .trim();

  function add(text, file) {
    if (!LETTERS.test(text)) return;
    const entry = strings.get(text) || { files: [] };
    const relative = path.relative(ROOT, file);
    if (!entry.files.includes(relative)) entry.files.push(relative);
    strings.set(text, entry);
  }

  function isStringLike(node) {
    return ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node);
  }

  function collectLiterals(node, file) {
    if (isStringLike(node)) {
      add(node.text, file);
    } else if (ts.isParenthesizedExpression(node)) {
      collectLiterals(node.expression, file);
    } else if (ts.isConditionalExpression(node)) {
      collectLiterals(node.whenTrue, file);
      collectLiterals(node.whenFalse, file);
    } else if (
      ts.isBinaryExpression(node) &&
      (node.operatorToken.kind === ts.SyntaxKind.BarBarToken ||
        node.operatorToken.kind === ts.SyntaxKind.QuestionQuestionToken)
    ) {
      collectLiterals(node.left, file);
      collectLiterals(node.right, file);
    }
  }

  for (const file of files) {
    const source = fs.readFileSync(file, 'utf8');
    const sf = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true);
    const visit = (node) => {
      if (ts.isCallExpression(node)) {
        const callee = ts.isIdentifier(node.expression)
          ? node.expression.text
          : ts.isPropertyAccessExpression(node.expression)
            ? node.expression.name.text
            : '';
        if (
          (callee === 'trText' || callee === 'trHtml') &&
          node.arguments.length > 0
        ) {
          collectLiterals(node.arguments[0], file);
        } else if (callee in HELPER_ARGUMENTS) {
          node.arguments
            .slice(0, HELPER_ARGUMENTS[callee])
            .forEach((argument) => collectLiterals(argument, file));
        } else if (
          callee === 'addControl' &&
          node.arguments.length > 0 &&
          isStringLike(node.arguments[0])
        ) {
          add(formatControlLabel(node.arguments[0].text), file);
        }
      }
      const relative = path.relative(ROOT, file);
      if (
        relative === path.join('workflow', 'nodes', 'registry.ts') &&
        ts.isPropertyAssignment(node) &&
        ts.isIdentifier(node.name) &&
        ['label', 'description'].includes(node.name.text) &&
        isStringLike(node.initializer)
      ) {
        add(node.initializer.text, file);
      }
      if (
        relative === path.join('workflow', 'nodes', 'control-specs.ts') &&
        ts.isArrayLiteralExpression(node) &&
        node.elements.length === 2 &&
        node.elements.every(isStringLike)
      ) {
        add(node.elements[1].text, file);
      }
      ts.forEachChild(node, visit);
    };
    visit(sf);
  }

  const result = {};
  for (const text of [...strings.keys()].sort()) {
    const entry = strings.get(text);
    result[text] = {
      files: entry.files.slice(0, 3),
      fileCount: entry.files.length,
    };
  }
  return { result, fileCount: files.length };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const { result, fileCount } = extractUiStrings();
  fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });
  fs.writeFileSync(OUT_FILE, JSON.stringify(result, null, 2) + '\n');

  const words = Object.keys(result).reduce(
    (sum, text) => sum + text.split(/\s+/).length,
    0
  );
  console.log(
    `Extracted ${Object.keys(result).length} UI strings (${words} words) from ${fileCount} files.`
  );
}
