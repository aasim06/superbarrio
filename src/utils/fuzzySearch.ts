import { GroceryProduct } from "@/types/grocery";
import { getProductLocalized } from "@/data/groceryData";

/**
 * Normalizes text by removing diacritics / accents, lowercase, and trimming.
 * e.g. "Plátanos!" -> "platanos"
 */
export function normalizeSearchText(text: string): string {
  if (!text) return "";
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove accents (á->a, é->e, etc.)
    .replace(/[^\w\s]/g, " ") // Replace punctuation with space
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Standard Levenshtein Distance for edit distance calculation
 */
export function levenshteinDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;

  // Swap to ensure n <= m to save space
  const row = new Array(n + 1);
  for (let j = 0; j <= n; j++) row[j] = j;

  for (let i = 1; i <= m; i++) {
    let prev = i - 1;
    row[0] = i;
    for (let j = 1; j <= n; j++) {
      const cur = row[j];
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      row[j] = Math.min(
        row[j] + 1,       // deletion
        row[j - 1] + 1,   // insertion
        prev + cost       // substitution
      );
      prev = cur;
    }
  }
  return row[n];
}

/**
 * Common Spanish / English grocery synonyms and colloquial terms
 */
const GROCERY_SYNONYMS: Record<string, string[]> = {
  platano: ["banana", "bananas", "platano", "platanos", "cambur", "guineo"],
  banana: ["platano", "platanos", "banana", "bananas"],
  patata: ["papa", "papas", "patata", "patatas", "potato", "potatoes"],
  papa: ["patata", "patatas", "papa", "papas"],
  aguacate: ["palta", "avocado", "aguacate", "avocados"],
  palta: ["aguacate", "aguacates", "palta"],
  tomate: ["jitomate", "tomato", "tomatoes", "tomate", "tomates"],
  fresa: ["frutilla", "frutillas", "strawberry", "strawberries", "fresa", "fresas"],
  naranja: ["orange", "oranges", "naranja", "naranjas"],
  limon: ["lemon", "lemons", "lima", "limon", "limones"],
  sandia: ["watermelon", "sandia", "sandias"],
  melon: ["cantaloupe", "honeydew", "melon", "melones"],
  manzana: ["apple", "apples", "manzana", "manzanas"],
  leche: ["milk", "leche"],
  huevo: ["egg", "eggs", "huevo", "huevos"],
  pan: ["bread", "pan", "hogaza", "barra"],
  pollo: ["chicken", "pollo", "pechuga"],
  carne: ["meat", "beef", "ternera", "carne"],
  aceite: ["oil", "olive", "aceite", "oliva"],
  queso: ["cheese", "queso"],
};

/**
 * Evaluates whether a target word matches the query with typo tolerance.
 * Returns score: 100 for exact, 80-95 for fuzzy typo, 0 for no match.
 */
function evaluateWordFuzzy(targetWord: string, queryWord: string): { match: boolean; score: number } {
  if (targetWord === queryWord) {
    return { match: true, score: 100 };
  }

  // Target word contains query word as prefix or substring
  if (targetWord.startsWith(queryWord) && queryWord.length >= 3) {
    return { match: true, score: 95 };
  }
  if (targetWord.includes(queryWord) && queryWord.length >= 4) {
    return { match: true, score: 90 };
  }

  // Synonym check
  for (const [key, syns] of Object.entries(GROCERY_SYNONYMS)) {
    if (syns.includes(queryWord) && (targetWord.includes(key) || syns.includes(targetWord))) {
      return { match: true, score: 92 };
    }
  }

  // Typo tolerance based on query length:
  // - Length 3: max 1 edit (e.g. "pna" -> "pan", "uav" -> "uva")
  // - Length 4-6: max 1 edit (e.g. "platno" -> "platano", "tomto" -> "tomate")
  // - Length 7+: max 2 edits (e.g. "zanahria" -> "zanahoria")
  const dist = levenshteinDistance(targetWord, queryWord);
  const maxAllowedDist = queryWord.length <= 4 ? 1 : queryWord.length <= 7 ? 2 : 3;

  if (dist <= maxAllowedDist) {
    // Distance penalty
    const penalty = dist * 10;
    return { match: true, score: Math.max(70, 88 - penalty) };
  }

  return { match: false, score: 0 };
}

export interface FuzzySearchResult {
  matches: boolean;
  score: number;
  isExact: boolean;
  matchedWord?: string;
  suggestedWord?: string;
}

/**
 * Fuzzy matches a grocery product against a search query
 */
export function fuzzyMatchProduct(
  product: GroceryProduct,
  rawQuery: string,
  locale: string = "es"
): FuzzySearchResult {
  const normQuery = normalizeSearchText(rawQuery);
  if (!normQuery) {
    return { matches: true, score: 100, isExact: true };
  }

  const loc = getProductLocalized(product, locale);
  const normName = normalizeSearchText(loc.name);
  const normNameEn = normalizeSearchText(product.nameEn || "");
  const normDesc = normalizeSearchText(loc.description || "");
  const normCategory = normalizeSearchText(product.category || "");

  // 1. Direct Substring Check (Exact Match)
  if (
    normName.includes(normQuery) ||
    normNameEn.includes(normQuery) ||
    normCategory.includes(normQuery) ||
    normDesc.includes(normQuery)
  ) {
    return { matches: true, score: 100, isExact: true, matchedWord: loc.name };
  }

  const queryWords = normQuery.split(" ").filter(Boolean);
  const targetWords = [...normName.split(" "), ...normNameEn.split(" ")].filter(
    (w) => w.length > 2
  );

  let totalScore = 0;
  let matchesCount = 0;
  let bestCandidateWord = "";
  let minDistance = 999;

  for (const qWord of queryWords) {
    let bestWordScore = 0;
    let matchedWord = "";

    for (const tWord of targetWords) {
      const evalResult = evaluateWordFuzzy(tWord, qWord);
      if (evalResult.match && evalResult.score > bestWordScore) {
        bestWordScore = evalResult.score;
        matchedWord = tWord;
        const dist = levenshteinDistance(tWord, qWord);
        if (dist < minDistance) {
          minDistance = dist;
          bestCandidateWord = tWord;
        }
      }
    }

    if (bestWordScore > 0) {
      matchesCount++;
      totalScore += bestWordScore;
    }
  }

  if (matchesCount === queryWords.length && queryWords.length > 0) {
    const avgScore = Math.round(totalScore / queryWords.length);
    return {
      matches: true,
      score: avgScore,
      isExact: false,
      matchedWord: bestCandidateWord,
      suggestedWord: bestCandidateWord,
    };
  }

  return { matches: false, score: 0, isExact: false };
}

/**
 * Searches a list of products with fuzzy typo tolerance,
 * and extracts the best auto-suggested correction term.
 */
export function searchGroceryWithFuzzy(
  products: GroceryProduct[],
  rawQuery: string,
  locale: string = "es"
): {
  results: GroceryProduct[];
  didYouMean?: string;
  isCorrected: boolean;
} {
  const normQuery = normalizeSearchText(rawQuery);
  if (!normQuery) {
    return { results: products, isCorrected: false };
  }

  const scored: Array<{ product: GroceryProduct; result: FuzzySearchResult }> = [];
  let foundAnyExact = false;
  const wordFrequency: Record<string, number> = {};

  for (const product of products) {
    const r = fuzzyMatchProduct(product, rawQuery, locale);
    if (r.matches) {
      scored.push({ product, result: r });
      if (r.isExact) {
        foundAnyExact = true;
      }
      if (r.suggestedWord) {
        wordFrequency[r.suggestedWord] = (wordFrequency[r.suggestedWord] || 0) + 1;
      }
    }
  }

  // Sort descending by score, then by rating
  scored.sort((a, b) => {
    if (b.result.score !== a.result.score) {
      return b.result.score - a.result.score;
    }
    return (b.product.rating || 0) - (a.product.rating || 0);
  });

  const results = scored.map((s) => s.product);

  // If there are results but none were exact substring matches, determine "Did you mean?"
  let didYouMean: string | undefined = undefined;
  let isCorrected = false;

  if (results.length > 0 && !foundAnyExact) {
    // Find the word with highest frequency / lowest distance
    let bestWord = "";
    let maxFreq = 0;
    for (const [w, freq] of Object.entries(wordFrequency)) {
      if (freq > maxFreq) {
        maxFreq = freq;
        bestWord = w;
      }
    }

    if (bestWord && bestWord !== normQuery) {
      // Capitalize first letter
      didYouMean = bestWord.charAt(0).toUpperCase() + bestWord.slice(1);
      isCorrected = true;
    }
  }

  return {
    results,
    didYouMean,
    isCorrected,
  };
}
