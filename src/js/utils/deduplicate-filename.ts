export function deduplicateFileName(
  name: string,
  usedNames: Set<string>
): string {
  if (!usedNames.has(name)) {
    usedNames.add(name);
    return name;
  }

  const dotIndex = name.lastIndexOf('.');
  const hasExtension = dotIndex > 0;
  const baseName = hasExtension ? name.slice(0, dotIndex) : name;
  const extension = hasExtension ? name.slice(dotIndex) : '';

  let counter = 1;
  let candidate = `${baseName} (${counter})${extension}`;
  while (usedNames.has(candidate)) {
    counter++;
    candidate = `${baseName} (${counter})${extension}`;
  }

  usedNames.add(candidate);
  return candidate;
}

export function makeUniqueFileKey(index: number, name: string): string {
  return `${index}_${name}`;
}
