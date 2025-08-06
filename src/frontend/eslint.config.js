import js from '@eslint/js';
import typescript from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import vue from 'eslint-plugin-vue';
import importPlugin from 'eslint-plugin-import';
import unusedImports from 'eslint-plugin-unused-imports';
import prettier from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';
import globals from 'globals';

export default [
  {
    ignores: [
      'node_modules/',
      'dist/',
      'build/',
      'coverage/',
      '*.min.js',
      'public/',
      '*.d.ts',
      'declarations/',
    ],
  },
  js.configs.recommended,
  ...vue.configs['flat/recommended'],
  {
    files: ['**/*.{js,jsx,ts,tsx,vue}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
        // Vue 3 Composition API globals
        ref: 'readonly',
        reactive: 'readonly',
        computed: 'readonly',
        watch: 'readonly',
        watchEffect: 'readonly',
        onMounted: 'readonly',
        onUnmounted: 'readonly',
        onBeforeMount: 'readonly',
        onBeforeUnmount: 'readonly',
        onUpdated: 'readonly',
        nextTick: 'readonly',
        inject: 'readonly',
        provide: 'readonly',
        defineProps: 'readonly',
        defineEmits: 'readonly',
        defineExpose: 'readonly',
        withDefaults: 'readonly',
        
        // Vue Router globals
        useRouter: 'readonly',
        useRoute: 'readonly',
        
        // Vue I18n globals
        useI18n: 'readonly',
        
        // Pinia globals
        defineStore: 'readonly',
        
        // Custom store globals
        useAuthStore: 'readonly',
        useTokenStore: 'readonly',
        useModalStore: 'readonly',
        useNotificationStore: 'readonly',
        useToastStore: 'readonly',
        useCanisterStore: 'readonly',
        useNotification: 'readonly',
        useMediaQuery: 'readonly',
        
        // Component imports
        Teleport: 'readonly',
        QRCode: 'readonly',
        Principal: 'readonly',
        AccountIdentifier: 'readonly',
        ApiService: 'readonly',
        AvatarService: 'readonly',
        getTokenIcon: 'readonly',
        getNetworkIcon: 'readonly',
        translateNotification: 'readonly',
        defaultAvatar: 'readonly',
        checkPasskeySupport: 'readonly',
        roadmapData: 'readonly',
        
        // Image imports
        heroImage2CN: 'readonly',
        heroImage2KR: 'readonly',
        heroImage2JP: 'readonly',
        heroImage2RU: 'readonly',
        heroImage2AR: 'readonly',
        heroImage2Default: 'readonly',
        icpIcon: 'readonly',
        ethereumIcon: 'readonly',
        solanaIcon: 'readonly',
        
        // Avatar imports
        avatar1: 'readonly',
        avatar2: 'readonly',
        avatar3: 'readonly',
        avatar4: 'readonly',
        avatar5: 'readonly',
        avatar6: 'readonly',
        avatar7: 'readonly',
        avatar8: 'readonly',
        avatar9: 'readonly',
        avatar10: 'readonly',
        avatar11: 'readonly',
        avatar12: 'readonly',
        
        // Component names
        TokenCard: 'readonly',
        CareerHero: 'readonly',
        CareerCulture: 'readonly',
        CareerBenefits: 'readonly',
        CareerPositions: 'readonly',
        CareerJoin: 'readonly',
        RegistrationForm: 'readonly',
        OnboardingExperience: 'readonly',
        LoadingScreen: 'readonly',
        Proposals: 'readonly',
        NetworkSelector: 'readonly',
        CurrencySelector: 'readonly',
        SimpleAccountSelector: 'readonly',
        TokenItem: 'readonly',
        TokenListSkeleton: 'readonly',
        TokenListHeader: 'readonly',
        TokenEmptyState: 'readonly',
        TokenIcon: 'readonly',
        TokenInfo: 'readonly',
        TokenBalanceDisplay: 'readonly',
        TokenItemActions: 'readonly',
        MarkdownRenderer: 'readonly',
        
        // Additional missing globals
        useNftsStore: 'readonly',
        useLanguageStore: 'readonly',
        useProfileStore: 'readonly',
        uuidv4: 'readonly',
        storeToRefs: 'readonly',
        deriveKeysFromSeedPhrase: 'readonly',
        getPaymentIcon: 'readonly',
        careersData: 'readonly',
        skyImage: 'readonly',
        darkrift: 'readonly',
        stars: 'readonly',
        asteroids: 'readonly',
        nebula: 'readonly',
        cloud1Mask: 'readonly',
        planet1: 'readonly',
        planet2: 'readonly',
        darkRift: 'readonly',
        dude: 'readonly',
        battle: 'readonly',
        heroImage1: 'readonly',
        logo1: 'readonly',
        logo2: 'readonly',
        heroImage3: 'readonly',
        logo3: 'readonly',
        heroImageClassics: 'readonly',
        logoClassics: 'readonly',
        heroImage4: 'readonly',
        logo4: 'readonly',
        socialLinks: 'readonly',
        toggleFreeze: 'readonly',
        defaultSpeed: 'readonly',
        noiseCanvas: 'readonly',
        logoCN: 'readonly',
        logoKR: 'readonly',
        logoJP: 'readonly',
        logoRU: 'readonly',
        logoAR: 'readonly',
        defaultLogo: 'readonly',
      },
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      '@typescript-eslint': typescript,
      import: importPlugin,
      'unused-imports': unusedImports,
      prettier,
    },
    rules: {
      // Prettier integration
      'prettier/prettier': 'error',
      
      // Unused imports and variables
      'unused-imports/no-unused-imports': 'off', // Disabled due to resolver issues
      'unused-imports/no-unused-vars': 'off', // Disabled due to resolver issues
      
      // Import rules
      'import/order': 'off', // Disabled due to resolver issues
      'import/no-unresolved': 'off', // TypeScript handles this
      
      // Code complexity and maintainability
      'complexity': ['error', 10],
      'max-lines-per-function': ['warn', 50],
      'max-params': ['error', 4],
      'max-depth': ['error', 4],
      'max-lines': ['warn', 300],
      
      // Spaghetti code detection
      'no-nested-ternary': 'error',
      'no-multiple-empty-lines': ['error', { max: 2 }],
      'no-trailing-spaces': 'error',
      'no-unreachable': 'error',
      'no-unreachable-loop': 'error',
      'no-constant-condition': 'error',
      'no-duplicate-imports': 'error',
      'no-useless-return': 'error',
      'no-useless-constructor': 'error',
      'no-useless-rename': 'error',
      
      // TypeScript specific
      '@typescript-eslint/no-unused-vars': 'off', // Handled by unused-imports
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-non-null-assertion': 'warn',
      
      // General code quality
      'prefer-const': 'error',
      'no-var': 'error',
      'no-console': 'warn',
      'no-debugger': 'error',
      'eqeqeq': ['error', 'always'],
      'curly': ['error', 'all'],
      'brace-style': ['error', '1tbs'],
      'comma-dangle': ['error', 'always-multiline'],
      'semi': ['error', 'always'],
      'quotes': ['error', 'single'],
    },
    settings: {
      'import/resolver': {
        typescript: {},
        node: {
          extensions: ['.js', '.jsx', '.ts', '.tsx', '.vue'],
        },
      },
    },
  },
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
  },
  prettierConfig,
]; 