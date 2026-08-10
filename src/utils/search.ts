/**
 * Utility functions for Advanced Smart Search in FlerDB
 * Supports:
 * - Case insensitivity
 * - Accent & diacritic insensitivity (e.g., é -> e, à -> a, ç -> c)
 * - Punctuation & space tolerance (e.g. phone numbers, hyphens, Jean-Luc -> jeanluc / jean luc)
 * - Multi-token word matching across multiple object fields
 * - Subsequence and Levenshtein typo tolerance
 */

/**
 * Normalizes text by removing diacritics/accents and converting to lowercase.
 */
export function normalizeText(text: string | null | undefined): string {
  if (!text) return '';
  return String(text)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // strip accents / diacritics
    .toLowerCase()
    .trim();
}

/**
 * Strips all non-alphanumeric characters, retaining only letters and numbers.
 */
export function cleanAlphanumeric(text: string): string {
  return text.replace(/[^\w]/g, '');
}

/**
 * Calculates Levenshtein distance between two normalized strings.
 */
export function levenshteinDistance(a: string, b: string): number {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

/**
 * Checks if query token is an ordered subsequence of target string.
 */
export function isSubsequence(queryToken: string, targetStr: string): boolean {
  let qIdx = 0;
  let tIdx = 0;
  while (qIdx < queryToken.length && tIdx < targetStr.length) {
    if (queryToken[qIdx] === targetStr[tIdx]) {
      qIdx++;
    }
    tIdx++;
  }
  return qIdx === queryToken.length;
}

/**
 * Matches a query token against a target word token using multiple matching strategies.
 */
export function matchToken(queryToken: string, targetToken: string): boolean {
  if (!queryToken || !targetToken) return false;

  // 1. Direct substring match
  if (targetToken.includes(queryToken)) return true;

  // 2. Subsequence match (for queries >= 3 chars)
  if (queryToken.length >= 3 && isSubsequence(queryToken, targetToken)) return true;

  // 3. Typo distance match (for queries > 3 chars)
  if (queryToken.length > 3) {
    const maxAllowedDistance = queryToken.length <= 5 ? 1 : 2;
    if (Math.abs(targetToken.length - queryToken.length) <= maxAllowedDistance) {
      if (levenshteinDistance(queryToken, targetToken) <= maxAllowedDistance) {
        return true;
      }
    }
    // Prefix fuzzy match
    const targetPrefix = targetToken.slice(0, queryToken.length);
    if (targetPrefix.length === queryToken.length && levenshteinDistance(queryToken, targetPrefix) <= 1) {
      return true;
    }
  }

  return false;
}

/**
 * Recursively extracts searchable text values from an item or object.
 */
function extractSearchableText(target: any): string {
  if (target === null || target === undefined) return '';
  
  if (typeof target === 'string' || typeof target === 'number' || typeof target === 'boolean') {
    return String(target);
  }

  if (typeof target === 'object') {
    const values: string[] = [];
    const visited = new Set();

    const walk = (obj: any, depth = 0) => {
      if (depth > 4 || !obj || visited.has(obj)) return;
      visited.add(obj);

      for (const key of Object.keys(obj)) {
        // Skip technical/internal key names
        if (key === 'id' || key === 'created_at' || key === 'updated_at' || key === 'assigned_user_id') {
          continue;
        }

        const val = obj[key];
        if (val !== null && val !== undefined) {
          if (typeof val === 'string' || typeof val === 'number') {
            values.push(String(val));
          } else if (typeof val === 'object') {
            walk(val, depth + 1);
          }
        }
      }
    };

    walk(target);
    return values.join(' ');
  }

  return '';
}

/**
 * Determines whether a target string, item, or object matches the search query.
 * 
 * @param target - String, number, object, or contact item to match against
 * @param query - The search text typed by the user
 */
export function advancedMatch(target: any, query: string): boolean {
  if (!query || query.trim() === '') return true;
  if (!target) return false;

  const rawText = extractSearchableText(target);
  if (!rawText) return false;

  const normalizedQuery = normalizeText(query);
  const queryTokens = normalizedQuery.split(/\s+/).filter(Boolean);
  if (queryTokens.length === 0) return true;

  const normalizedTarget = normalizeText(rawText);
  const rawTargetClean = cleanAlphanumeric(normalizedTarget);
  const queryClean = cleanAlphanumeric(normalizedQuery);

  // Strategy A: Direct alphanumeric match (great for phone numbers like 0550123456 vs (0550) 12-34-56 or names like Jean-Luc vs JeanLuc)
  if (queryClean && rawTargetClean.includes(queryClean)) {
    return true;
  }

  // Strategy B: Split target text into word tokens
  const targetWords = normalizedTarget.split(/[\s,._\-/@+()\[\]{}]+/).filter(Boolean);

  // Strategy C: Every query token must match at least one target token or substring
  return queryTokens.every(qToken => {
    // Exact substring in normalized target
    if (normalizedTarget.includes(qToken)) return true;

    // Clean version substring
    const cleanQ = cleanAlphanumeric(qToken);
    if (cleanQ && rawTargetClean.includes(cleanQ)) return true;

    // Token level fuzzy matching
    return targetWords.some(tWord => matchToken(qToken, tWord));
  });
}
