import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import eslintConfigPrettier from "eslint-config-prettier";

export default [
    { files: ["**/*.{js,mjs,cjs,ts}"] },
    { ignores: ["dist/**", "coverage/**", "node_modules/**", "**/.vitepress/cache/**", "public/**/*.min.js"] },
    { languageOptions: { globals: { ...globals.browser, ...globals.node } } },
    pluginJs.configs.recommended,
    ...tseslint.configs.recommended,
    eslintConfigPrettier,
    {
        rules: {
            "@typescript-eslint/no-explicit-any": "warn",
            "@typescript-eslint/no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }],
            "@typescript-eslint/no-unused-expressions": "warn",
            "no-redeclare": "warn",
            "no-constant-condition": "warn",
            "no-ex-assign": "warn",
            "no-empty": "warn",
            "no-case-declarations": "warn",
            "@typescript-eslint/no-this-alias": "warn",
            "no-func-assign": "warn",
            "no-fallthrough": "warn",
            "no-cond-assign": "warn",
            "no-irregular-whitespace": "warn",
            "no-prototype-builtins": "warn",
            "no-undef": "warn",
            "no-useless-escape": "warn",
            "no-unsafe-finally": "warn",
            "no-self-assign": "warn",
            "no-control-regex": "warn",
            "@typescript-eslint/no-require-imports": "warn",
            "getter-return": "warn",
            "no-constant-binary-expression": "warn",
            "@typescript-eslint/ban-ts-comment": "warn",
            "no-unused-private-class-members": "warn",
            "no-unreachable": "warn",
            "no-setter-return": "warn",
            "no-useless-catch": "warn",
            "valid-typeof": "warn",
            "no-sparse-arrays": "warn",
            "no-misleading-character-class": "warn"
        }
    }
];
