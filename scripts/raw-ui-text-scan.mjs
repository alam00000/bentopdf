import fs from 'fs';
import path from 'path';
import ts from 'typescript';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SOURCE_ROOT = path.resolve(__dirname, '../src/js');
const SKIPPED_DIRECTORIES = new Set(['editcore', 'types', 'i18n', 'config']);
const EXEMPT_FILES = new Set(['logic/email-to-pdf.ts', 'utils/comic-info.ts']);
const TRANSLATING_HELPERS = {
  showAlert: 2,
  showLoader: 1,
  showAlertModal: 2,
  showModal: 2,
};
const NATIVE_DIALOGS = { alert: 1, confirm: 1 };
const HELPER_ARGUMENTS = { ...TRANSLATING_HELPERS, ...NATIVE_DIALOGS };
const TEXT_PROPERTIES = new Set([
  'textContent',
  'title',
  'placeholder',
  'alt',
  'ariaLabel',
]);
const TEXT_ATTRIBUTES = new Set(['title', 'placeholder', 'aria-label', 'alt']);
const LETTERS = /\p{L}{2}/u;
const CSS_RULE = /[#.\w-]+\s*\{[^}]*:[^}]*\}/;
const KEY_COMBINATION = /^(?:(?:Ctrl|Cmd|Alt|Shift|⌘|⌥|⇧)\s*\+\s*)+\S$/;

function sourceFiles(root) {
  const files = [];
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (!SKIPPED_DIRECTORIES.has(entry.name)) walk(full);
      } else if (/\.ts$/.test(entry.name)) {
        files.push(full);
      }
    }
  };
  walk(root);
  return files;
}

function isStringLike(node) {
  return ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node);
}

function calleeName(call) {
  if (ts.isIdentifier(call.expression)) return call.expression.text;
  if (ts.isPropertyAccessExpression(call.expression)) {
    return call.expression.name.text;
  }
  return '';
}

function rawLiterals(node, found = []) {
  if (isStringLike(node)) {
    if (LETTERS.test(node.text) && !KEY_COMBINATION.test(node.text)) {
      found.push(node);
    }
  } else if (ts.isTemplateExpression(node)) {
    const staticText = [
      node.head.text,
      ...node.templateSpans.map((span) => span.literal.text),
    ].join(' ');
    if (LETTERS.test(staticText)) found.push(node);
  } else if (ts.isParenthesizedExpression(node)) {
    rawLiterals(node.expression, found);
  } else if (ts.isConditionalExpression(node)) {
    rawLiterals(node.whenTrue, found);
    rawLiterals(node.whenFalse, found);
  } else if (ts.isBinaryExpression(node)) {
    const kind = node.operatorToken.kind;
    if (
      kind === ts.SyntaxKind.BarBarToken ||
      kind === ts.SyntaxKind.QuestionQuestionToken ||
      kind === ts.SyntaxKind.PlusToken
    ) {
      rawLiterals(node.left, found);
      rawLiterals(node.right, found);
    }
  } else if (ts.isAsExpression(node) || ts.isNonNullExpression(node)) {
    rawLiterals(node.expression, found);
  }
  return found;
}

function isTranslatingCall(node) {
  const call = node.parent;
  return (
    call &&
    ts.isCallExpression(call) &&
    ['trText', 'trHtml', 't', 'translate'].includes(calleeName(call))
  );
}

function rawHtmlText(node) {
  let pieces;
  if (isStringLike(node)) {
    pieces = [node.text];
  } else if (ts.isTemplateExpression(node)) {
    pieces = [node.head.text, ...node.templateSpans.map((s) => s.literal.text)];
  } else {
    return false;
  }
  const html = pieces.join('\u0000');
  if (!/<[a-z][\w-]*[\s>/]/i.test(html)) return false;
  for (const match of html.matchAll(/>([^<>]+)(?=<)/g)) {
    const tagStart = html.lastIndexOf('<', match.index);
    const tag = html.slice(tagStart, match.index + 1);
    if (/data-i18n/.test(tag) || /^<\/?(script|style)/i.test(tag)) continue;
    const visible = match[1]
      .replace(/\u0000/g, ' ')
      .replace(/&\w+;|&#\d+;/g, ' ');
    if (LETTERS.test(visible)) return true;
  }
  for (const match of html.matchAll(
    /<[^<>]*?\s(?:title|placeholder|aria-label|alt)="([^"]*)"[^<>]*>/g
  )) {
    if (/data-i18n/.test(match[0])) continue;
    if (LETTERS.test(match[1].replace(/\u0000/g, ' '))) return true;
  }
  return false;
}

export function scanRawUiText(root = SOURCE_ROOT) {
  const findings = [];
  for (const file of sourceFiles(root)) {
    if (EXEMPT_FILES.has(path.relative(root, file))) continue;
    const source = fs.readFileSync(file, 'utf8');
    const sf = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true);
    const report = (node, kind) => {
      const { line } = sf.getLineAndCharacterOfPosition(node.getStart(sf));
      findings.push({
        file: path.relative(root, file),
        line: line + 1,
        kind,
        text: node.getText(sf).replace(/\s+/g, ' ').slice(0, 100),
      });
    };
    const visit = (node) => {
      if (ts.isCallExpression(node)) {
        const name = calleeName(node);
        if (name in HELPER_ARGUMENTS) {
          node.arguments.slice(0, HELPER_ARGUMENTS[name]).forEach((argument) =>
            rawLiterals(argument)
              .filter(
                (raw) => !(name in TRANSLATING_HELPERS && isStringLike(raw))
              )
              .forEach((raw) => report(raw, name))
          );
        } else if (
          name === 'setAttribute' &&
          node.arguments.length === 2 &&
          isStringLike(node.arguments[0]) &&
          TEXT_ATTRIBUTES.has(node.arguments[0].text)
        ) {
          rawLiterals(node.arguments[1]).forEach((raw) =>
            report(raw, 'setAttribute')
          );
        }
      }
      if (
        ts.isNewExpression(node) &&
        ts.isIdentifier(node.expression) &&
        node.expression.text === 'Option' &&
        node.arguments &&
        node.arguments.length > 0
      ) {
        rawLiterals(node.arguments[0]).forEach((raw) => report(raw, 'Option'));
      }
      if (
        ts.isBinaryExpression(node) &&
        node.operatorToken.kind === ts.SyntaxKind.EqualsToken &&
        ts.isPropertyAccessExpression(node.left) &&
        TEXT_PROPERTIES.has(node.left.name.text)
      ) {
        rawLiterals(node.right)
          .filter((raw) => !CSS_RULE.test(raw.getText()))
          .forEach((raw) => report(raw, node.left.name.text));
      }
      if (
        (isStringLike(node) || ts.isTemplateExpression(node)) &&
        !isTranslatingCall(node) &&
        rawHtmlText(node)
      ) {
        report(node, 'html');
      }
      ts.forEachChild(node, visit);
    };
    visit(sf);
  }
  return findings;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const findings = scanRawUiText();
  const byKind = {};
  for (const finding of findings)
    byKind[finding.kind] = (byKind[finding.kind] || 0) + 1;
  console.log(`${findings.length} raw UI text sites`, JSON.stringify(byKind));
  for (const finding of findings.slice(0, Number(process.argv[2] || 25))) {
    console.log(
      `${finding.file}:${finding.line} [${finding.kind}] ${finding.text}`
    );
  }
  process.exitCode = findings.length > 0 ? 1 : 0;
}
