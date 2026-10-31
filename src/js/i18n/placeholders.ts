export const fillPlaceholders = (
  text: string,
  params?: Record<string, string | number>
): string => {
  if (!params) return text;
  return text.replace(/\{\{(\w+)\}\}/g, (match, name: string) =>
    Object.prototype.hasOwnProperty.call(params, name)
      ? String(params[name])
      : match
  );
};
