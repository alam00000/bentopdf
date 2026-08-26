/**
 * Escapes special regex characters in a search string.
 */
function escapeRegex(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Calculates a search relevance score for a tool given its title and description.
 * Higher scores indicate stronger, more direct matches.
 *
 * Scoring Hierarchy:
 * - 100 pts: Exact title match
 * -  80 pts: Title starts with query
 * -  60 pts: Query matches a Unicode-aware word start in the title
 * -  40 pts: Query is contained anywhere in the title
 * -  20 pts: Query matches a Unicode-aware word start in the description
 * -  10 pts: Query is contained anywhere in the description
 * -   0 pts: No match
 */
export function calculateSearchRelevance(
  title: string,
  description: string,
  query: string
): number {
  const normalizedQuery = query.toLowerCase().trim();
  if (!normalizedQuery) {
    return 0;
  }

  const normalizedTitle = title.toLowerCase().trim();
  const normalizedDescription = description.toLowerCase().trim();

  // Tier 1: Exact title match
  if (normalizedTitle === normalizedQuery) {
    return 100;
  }

  // Tier 2: Title starts with query
  if (normalizedTitle.startsWith(normalizedQuery)) {
    return 80;
  }

  // Tier 3: Query matches a Unicode-aware word boundary in the title
  const escapedQuery = escapeRegex(normalizedQuery);
  const wordBoundaryRegex = new RegExp(
    `(?<![\\p{L}\\p{N}])${escapedQuery}`,
    'iu'
  );
  if (wordBoundaryRegex.test(normalizedTitle)) {
    return 60;
  }

  // Tier 4: Query is contained anywhere in the title
  if (normalizedTitle.includes(normalizedQuery)) {
    return 40;
  }

  // Tier 5: Query matches a Unicode-aware word boundary in the description
  if (wordBoundaryRegex.test(normalizedDescription)) {
    return 20;
  }

  // Tier 6: Query is contained anywhere in the description
  if (normalizedDescription.includes(normalizedQuery)) {
    return 10;
  }

  return 0;
}
