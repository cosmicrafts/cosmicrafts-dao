// File: /utils/languageMapping.js

export const languageCountryMapping = {
      en: ['US', 'GB', 'AU', 'CA', 'NZ', 'IE'], // English-speaking countries
      es: ['ES', 'MX', 'AR', 'CO', 'CL', 'PE', 'VE'], // Spanish-speaking countries
      fr: ['FR', 'CA', 'BE', 'CH'], // French-speaking countries
      de: ['DE', 'AT', 'CH'], // German-speaking countries
      pt: ['PT', 'BR', 'AO', 'MZ'], // Portuguese-speaking countries
      ru: ['RU', 'BY', 'KZ'], // Russian-speaking countries
      ar: ['AE', 'SA', 'EG', 'IQ', 'DZ'], // Arabic-speaking countries
      vi: ['VN'], // Vietnamese
      ko: ['KR'], // Korean
      ja: ['JP'], // Japanese
      zh: ['CN', 'HK', 'TW'], // Chinese
      tr: ['TR'], // Turkish
    };

    export const languageToNat8Mapping = {
      en: 0,
      es: 1,
      fr: 2,
      de: 3,
      pt: 4,
      ru: 5,
      ar: 6,
      vi: 7,
      ko: 8,
      ja: 9,
      zh: 10,
      tr: 11,
    };

    export const nat8ToLanguageMapping = {
      0: 'en',
      1: 'es',
      2: 'fr',
      3: 'de',
      4: 'pt',
      5: 'ru',
      6: 'ar',
      7: 'vi',
      8: 'ko',
      9: 'ja',
      10: 'zh',
      11: 'tr',
    };
    
    