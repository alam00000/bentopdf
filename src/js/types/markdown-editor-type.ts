export interface MarkdownItOptions {
  html: boolean;
  breaks: boolean;
  linkify: boolean;
  typographer: boolean;
  highlight?: (str: string, lang: string) => string;
}

export interface MarkdownItToken {
  attrSet(name: string, value: string): void;
  [key: string]: unknown;
}

export interface MarkdownItRendererSelf {
  renderToken(
    tokens: MarkdownItToken[],
    idx: number,
    options: MarkdownItOptions
  ): string;
}

export type MarkdownItRenderRule = (
  tokens: MarkdownItToken[],
  idx: number,
  options: MarkdownItOptions,
  env: unknown,
  self: MarkdownItRendererSelf
) => string;
