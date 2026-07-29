import { URL } from 'url';

/**
 * Decodes HTML entities like &#039;, &amp;, &quot;, etc.
 * @param {string} str 
 * @returns {string}
 */
export function decodeHtmlEntities(str) {
  if (!str || typeof str !== 'string') return str;
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&rsquo;/g, "'")
    .replace(/&lsquo;/g, "'");
}

/**
 * Validates that a string is a valid HTTP/HTTPS URL.
 * @param {string} urlString 
 * @returns {boolean}
 */
export function isValidUrl(urlString) {
  try {
    const url = new URL(urlString);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (e) {
    return false;
  }
}

/**
 * Recursively searches a JSON object for a schema.org/Recipe type.
 * @param {any} obj 
 * @returns {object|null}
 */
export function findRecipeInJson(obj) {
  if (!obj || typeof obj !== 'object') return null;

  if (Array.isArray(obj)) {
    for (const item of obj) {
      const found = findRecipeInJson(item);
      if (found) return found;
    }
    return null;
  }

  const type = obj['@type'];
  if (type === 'Recipe' || (Array.isArray(type) && type.includes('Recipe'))) {
    return obj;
  }

  if (obj['@graph'] && Array.isArray(obj['@graph'])) {
    const found = findRecipeInJson(obj['@graph']);
    if (found) return found;
  }

  for (const key of Object.keys(obj)) {
    if (obj[key] && typeof obj[key] === 'object') {
      const found = findRecipeInJson(obj[key]);
      if (found) return found;
    }
  }

  return null;
}

/**
 * Parses an ingredient string into name, quantity, and unit.
 * @param {string} rawString 
 * @returns {object}
 */
export function parseIngredient(rawString) {
  rawString = rawString.trim();
  if (!rawString) return null;

  // List of common units (plural and singular) sorted by length descending
  const units = [
    'tablespoons', 'tablespoon', 'teaspoons', 'teaspoon', 
    'milliliters', 'milliliter', 'kilograms', 'kilogram', 
    'packages', 'package', 'pinches', 'cloves', 'ounces', 
    'slices', 'pounds', 'bounds', 'grams', 'g', 
    'tbsp', 'tbs', 'tsp', 'cups', 'cup', 'oz', 'ml', 'kg', 
    'l', 'lbs', 'lb', 'pinch', 'clove', 'can', 'cans', 
    'slice', 'pkg'
  ];

  // Regex to match quantity: numbers, fractions (like 1/2), decimals (like 1.5), vulgar fractions (like ½), ranges (like 1-2)
  const quantityRegex = /^([0-9\s\/\.\-\u00BC-\u00BE\u2150-\u215E]+)/i;
  const match = rawString.match(quantityRegex);

  let quantity = '';
  let rest = rawString;

  if (match) {
    quantity = match[1].trim();
    rest = rawString.slice(match[0].length).trim();
  }

  // Check if the next word is a unit
  let unit = '';
  const firstWordMatch = rest.match(/^([a-zA-Z]+)\b/);
  if (firstWordMatch) {
    const word = firstWordMatch[1].toLowerCase();
    if (units.includes(word)) {
      unit = firstWordMatch[1];
      rest = rest.slice(firstWordMatch[0].length).trim();
    }
  }

  // Strip leading "of " if present
  let name = rest;
  if (name.toLowerCase().startsWith('of ')) {
    name = name.slice(3).trim();
  }

  if (!name) {
    name = rawString;
    quantity = '';
    unit = '';
  }

  return {
    name: decodeHtmlEntities(name),
    quantity: quantity || '',
    unit: unit || ''
  };
}

/**
 * Formats instructions into a single unified string.
 * @param {any} instructions 
 * @returns {string}
 */
export function formatInstructions(instructions) {
  if (!instructions) return '';
  
  let formatted = '';
  if (typeof instructions === 'string') {
    formatted = instructions;
  } else if (Array.isArray(instructions)) {
    formatted = instructions.map((step) => {
      if (typeof step === 'string') {
        return step;
      }
      if (step && typeof step === 'object') {
        if (step['@type'] === 'HowToStep') {
          return step.text || step.name || '';
        }
        if (step['@type'] === 'HowToSection' && Array.isArray(step.itemListElement)) {
          const sectionName = step.name ? `${step.name}:\n` : '';
          const sectionSteps = step.itemListElement
            .map(s => {
              if (typeof s === 'string') return s;
              if (s && typeof s === 'object') return s.text || s.name || '';
              return '';
            })
            .filter(Boolean)
            .join('\n');
          return `${sectionName}${sectionSteps}`;
        }
        return step.text || step.name || JSON.stringify(step);
      }
      return '';
    }).filter(Boolean).join('\n');
  } else if (typeof instructions === 'object') {
    formatted = instructions.text || instructions.name || '';
  }

  return decodeHtmlEntities(formatted);
}

/**
 * Parses ISO 8601 Duration string to minutes.
 * @param {string} duration 
 * @returns {number}
 */
export function parseISO8601Duration(duration) {
  if (!duration || typeof duration !== 'string') return 0;
  
  const regex = /P(?:(\d+(?:\.\d+)?)Y)?(?:(\d+(?:\.\d+)?)M)?(?:(\d+(?:\.\d+)?)W)?(?:(\d+(?:\.\d+)?)D)?(?:T(?:(\d+(?:\.\d+)?)H)?(?:(\d+(?:\.\d+)?)M)?(?:(\d+(?:\.\d+)?)S)?)?/;
  const match = duration.match(regex);
  if (!match) return 0;

  const years = Number(match[1] || 0);
  const months = Number(match[2] || 0);
  const weeks = Number(match[3] || 0);
  const days = Number(match[4] || 0);
  const hours = Number(match[5] || 0);
  const minutes = Number(match[6] || 0);
  const seconds = Number(match[7] || 0);
  
  return Math.ceil(
    years * 365 * 24 * 60 +
      months * 30 * 24 * 60 +
      weeks * 7 * 24 * 60 +
      days * 24 * 60 +
      hours * 60 +
      minutes +
      seconds / 60,
  );
}

/**
 * Formats recipe duration metadata for display and storage.
 * @param {string} duration
 * @returns {string|null}
 */
export function formatDuration(duration) {
  if (!duration || typeof duration !== 'string') return null;

  const minutes = parseISO8601Duration(duration);
  if (minutes) return `${minutes} min`;

  return decodeHtmlEntities(duration.trim()) || null;
}

/**
 * Maps imported recipe categories to the app's supported category list.
 * @param {string|null} rawCategory
 * @returns {string}
 */
export function normalizeCategory(rawCategory) {
  if (!rawCategory || typeof rawCategory !== 'string') return 'Other';

  const category = rawCategory.toLowerCase();

  if (category.includes('appetizer') || category.includes('starter')) {
    return 'Appetizer';
  }

  if (category.includes('dessert') || category.includes('sweet')) {
    return 'Dessert';
  }

  if (
    category.includes('main') ||
    category.includes('dinner') ||
    category.includes('lunch') ||
    category.includes('meal') ||
    category.includes('entree') ||
    category.includes('entrée')
  ) {
    return 'Main';
  }

  return 'Other';
}

/**
 * Formats recipe yield metadata for display and storage.
 * @param {string|number|Array|null} rawYield
 * @returns {string|null}
 */
export function formatServings(rawYield) {
  if (rawYield === null || rawYield === undefined) return null;

  const yieldText = Array.isArray(rawYield) ? rawYield.join(' ') : String(rawYield);
  const servings = decodeHtmlEntities(yieldText.trim());

  return servings || null;
}

/**
 * Extracts an image URL from schema.org image metadata.
 * @param {string|Array|object|null} image
 * @returns {string|null}
 */
export function extractImageUrl(image) {
  if (!image) return null;

  if (typeof image === 'string') {
    return decodeHtmlEntities(image.trim()) || null;
  }

  if (Array.isArray(image)) {
    for (const item of image) {
      const imageUrl = extractImageUrl(item);
      if (imageUrl) return imageUrl;
    }

    return null;
  }

  if (typeof image === 'object') {
    return extractImageUrl(image.url || image.contentUrl || image.thumbnailUrl);
  }

  return null;
}

/**
 * Fetches recipe page and extracts JSON-LD recipe metadata.
 * @param {string} url 
 * @returns {Promise<object>}
 */
export async function fetchAndExtractRecipe(url) {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36'
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch page: Status ${response.status}`);
  }

  const html = await response.text();

  // Search for JSON-LD scripts
  const regex = /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match;
  let recipeData = null;

  while ((match = regex.exec(html)) !== null) {
    try {
      const json = JSON.parse(match[1].trim());
      recipeData = findRecipeInJson(json);
      if (recipeData) break;
    } catch (e) {
      // Continue to next script block if parsing fails
    }
  }

  if (!recipeData) {
    throw new Error('No valid recipe metadata (JSON-LD) found on the page.');
  }

  // Extract fields
  const title = decodeHtmlEntities(recipeData.name || recipeData.headline || '');
  if (!title) {
    throw new Error('Recipe metadata found, but title/name is missing.');
  }

  // Extract ingredients
  const rawIngredients = recipeData.recipeIngredient || recipeData.ingredients || [];
  if (!Array.isArray(rawIngredients) || rawIngredients.length === 0) {
    throw new Error('Recipe metadata found, but ingredients are missing or empty.');
  }

  const ingredients = rawIngredients
    .map(parseIngredient)
    .filter(Boolean);

  // Extract instructions
  const instructions = formatInstructions(recipeData.recipeInstructions);
  if (!instructions) {
    throw new Error('Recipe metadata found, but instructions are missing or empty.');
  }

  // Extract cook time
  const cookTimeStr = recipeData.totalTime || recipeData.cookTime || recipeData.prepTime || '';
  const cookTime = formatDuration(cookTimeStr);
  const servings = formatServings(recipeData.recipeYield || recipeData.yield);
  const imageUrl = extractImageUrl(recipeData.image);

  // Extract category
  let category = null;
  if (recipeData.recipeCategory) {
    if (Array.isArray(recipeData.recipeCategory)) {
      category = decodeHtmlEntities(recipeData.recipeCategory[0]);
    } else if (typeof recipeData.recipeCategory === 'string') {
      category = decodeHtmlEntities(recipeData.recipeCategory);
    }
  }

  return {
    title,
    category: normalizeCategory(category),
    cook_time: cookTime,
    servings,
    image_url: imageUrl,
    instructions,
    source_url: url,
    ingredients
  };
}
