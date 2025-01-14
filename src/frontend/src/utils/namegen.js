import * as bip39 from 'bip39';

/**
 * Generates a random name based on BIP39 word list.
 * Includes multiple algorithms for diversity and ensures names are <= 12 characters.
 * Optimized for futuristic, space-themed, and Web3 games.
 * @returns {string} Generated name.
 */
function generateName() {
  const words = bip39.wordlists.english; // Use the English BIP39 word list

  // Helper to validate name length
  const validateLength = (name) => {
    return name.length <= 12 ? name : null;
  };

  // Helper to exclude problematic or repetitive names like "null"
  const isValidName = (name) => {
    const disallowed = ["null", "undefined", "test", "debug"];
    return !disallowed.includes(name.toLowerCase());
  };

  // Affixes for prefix/suffix addition
  const prefixes = ["Neo", "Cyber", "Astro", "Quantum", "Luna", "Star", "Nova", "Terra", "Flux", "Zeta", "Orion", "Galactic"];
  const suffixes = ["tron", "craft", "forge", "quest", "nova", "ion", "oid", "ite", "ium", "pulse", "beam", "orbit"];

  // Synonym pairs for thematic combinations
  const synonymPairs = [
    ["fast", "speed"],
    ["bright", "light"],
    ["storm", "wind"],
    ["cloud", "sky"],
    ["orbit", "galaxy"],
    ["cosmic", "infinity"],
    ["stellar", "luminous"],
    ["warp", "drive"],
    ["space", "void"],
    ["crypto", "block"]
  ];

  // Add affixes to a name
  const addAffixes = (name) => {
    if (Math.random() > 0.5) {
      const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
      if (validateLength(prefix + name)) return prefix + name;
    } else {
      const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
      if (validateLength(name + suffix)) return name + suffix;
    }
    return validateLength(name); // Fallback to original name
  };

  // Randomly choose an algorithm
  const algorithms = [
    // Combine 2 random words if combined length <= 12
    () => {
      let word1 = words[Math.floor(Math.random() * words.length)];
      let word2 = words[Math.floor(Math.random() * words.length)];
      if ((word1.length + word2.length) <= 12) {
        return addAffixes(word1 + word2);
      }
      return validateLength(word1) || validateLength(word2);
    },

    // Single word + random number if within limit
    () => {
      const word = words[Math.floor(Math.random() * words.length)];
      const number = Math.floor(Math.random() * 10000).toString();
      const combined = word + number;
      return addAffixes(validateLength(combined) || validateLength(word));
    },

    // Acronym from 3 random words, always <= 12
    () => {
      const word1 = words[Math.floor(Math.random() * words.length)];
      const word2 = words[Math.floor(Math.random() * words.length)];
      const word3 = words[Math.floor(Math.random() * words.length)];
      return addAffixes((word1[0] + word2[0] + word3[0]).toUpperCase() + Math.floor(Math.random() * 10));
    },

    // Shuffle letters of a word if <= 12
    () => {
      const word = words[Math.floor(Math.random() * words.length)].split('');
      for (let i = word.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [word[i], word[j]] = [word[j], word[i]];
      }
      return addAffixes(validateLength(word.join('')));
    },

    // Compress a word by removing vowels, ensuring <= 12
    () => {
      const word = words[Math.floor(Math.random() * words.length)];
      const compressed = word.replace(/[aeiou]/g, '');
      return addAffixes(validateLength(compressed));
    },

    // Syllable-based name generation
    () => {
      const syllables = ["ba", "be", "bi", "bo", "bu", "da", "de", "di", "do", "du", "ka", "ke", "ki", "ko", "ku", "xa", "xe", "xi", "xo", "xu"];
      let name = '';
      while (name.length <= 12) {
        name += syllables[Math.floor(Math.random() * syllables.length)];
      }
      return addAffixes(validateLength(name));
    },

    // Synonym pair combination
    () => {
      const pair = synonymPairs[Math.floor(Math.random() * synonymPairs.length)];
      const combined = pair[0] + pair[1];
      return addAffixes(validateLength(combined) || validateLength(pair[0]) || validateLength(pair[1]));
    },
  ];

  let generatedName;
  do {
    const chosenAlgorithm = algorithms[Math.floor(Math.random() * algorithms.length)];
    generatedName = chosenAlgorithm();
  } while (!generatedName || !isValidName(generatedName)); // Ensure valid name is returned

  return generatedName;
}

export { generateName };
