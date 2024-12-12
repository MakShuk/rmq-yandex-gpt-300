module.exports = {
  // Указываем парсер для TypeScript
  parser: '@typescript-eslint/parser',

  // Настройки парсера
  parserOptions: {
    // Путь к конфигурации TypeScript
    project: 'tsconfig.json',
    // Корневая директория для поиска tsconfig
    tsconfigRootDir: __dirname,
    // Указываем, что используются ES модули
    sourceType: 'module',
    // Включаем поддержку последних возможностей ECMAScript
    ecmaVersion: 2022,
  },

  // Подключаем плагины
  plugins: [
    '@typescript-eslint/eslint-plugin',
    'import', // Добавляем плагин для работы с импортами
    'sonarjs', // Добавляем плагин для проверки качества кода
    'security', // Добавляем плагин для проверки безопасности
  ],

  // Расширяем базовые конфигурации
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
    'plugin:sonarjs/recommended', // Добавляем правила SonarJS
    'plugin:security/recommended', // Добавляем правила безопасности
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:import/typescript',
  ],

  // Указываем, что это корневая конфигурация
  root: true,

  // Определяем окружение выполнения
  env: {
    node: true, // Node.js окружение
    jest: true, // Поддержка Jest
    es2022: true, // Современное ECMAScript окружение
  },

  // Исключаем файлы из проверки
  ignorePatterns: [
    '.eslintrc.js',
    'dist',
    'node_modules',
    'coverage',
    '*.spec.ts', // Исключаем тестовые файлы
  ],

  // Настройки правил
  rules: {
    // Отключаем префикс I для интерфейсов
    '@typescript-eslint/interface-name-prefix': 'off',

    // Требуем явного указания типов возвращаемых значений только для публичных методов
    '@typescript-eslint/explicit-function-return-type': [
      'warn',
      {
        allowExpressions: true,
        allowTypedFunctionExpressions: true,
      },
    ],

    // Требуем явного указания типов для методов классов
    '@typescript-eslint/explicit-module-boundary-types': [
      'warn',
      {
        allowArgumentsExplicitlyTypedAsAny: true,
      },
    ],

    // Разрешаем использование any, но выдаём предупреждение
    '@typescript-eslint/no-explicit-any': 'warn',

    // Запрещаем неиспользуемые переменные
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
      },
    ],

    // Требуем использования const для неизменяемых переменных
    'prefer-const': 'error',

    // Требуем правильного порядка импортов
    'import/order': [
      'error',
      {
        groups: ['builtin', 'external', 'internal', ['parent', 'sibling'], 'index'],
        'newlines-between': 'always',
        alphabetize: {
          order: 'asc',
          caseInsensitive: true,
        },
      },
    ],

    // Ограничиваем цикломатическую сложность
    'sonarjs/cognitive-complexity': ['error', 15],

    // Запрещаем дублирование строк
    'sonarjs/no-duplicate-string': ['error', 3],

    // Максимальная длина строки
    'max-len': [
      'error',
      {
        code: 100,
        ignoreComments: true,
        ignoreStrings: true,
        ignoreTemplateLiterals: true,
      },
    ],
  },

  // Настройки для определения путей импорта
  settings: {
    'import/resolver': {
      typescript: {
        alwaysTryTypes: true,
      },
    },
  },
};
