module.exports = {
  env: {
    node: true,
    es6: true,
    browser: true,
  },
  extends: ['eslint:recommended', 'plugin:react/recommended'],
  parser: 'babel-eslint',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
      modules: true,
      experimentalObjectRestSpread: true,
    },
  },
  rules: {
    'no-console': 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',

    // Best Practices
    eqeqeq: 'error',
    'no-invalid-this': 'error',
    'no-return-assign': 'error',
    // 'no-unused-expressions': ['error', { allowTernary: true }],
    'no-useless-concat': 'error',
    'no-useless-return': 'error',

    // Variable
    // 'init-declarations': 'error',
    // -----------------------------------
    // 'no-use-before-define': 'off',
    'react/react-in-jsx-scope': 'off',
    // 'react/display-name': 'off',
    'no-use-before-define': [
      'error',
      { functions: false, classes: false, variables: false },
    ],
    'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'react/prop-types': 'off',
    'no-useless-escape': 'off',
    'react/no-unescaped-entities': 'off',
    // -------------------------------------
    // "no-unused-vars": ["error", { varsIgnorePattern: "^[A-Z]" }],

    // Stylistic Issues
    // "array-bracket-newline": ["error", { multiline: true, minItems: null }],
    'array-bracket-spacing': 'error',
    'brace-style': ['error', '1tbs', { allowSingleLine: true }],
    'block-spacing': 'error',
    // "comma-dangle": "error",
    'comma-spacing': 'error',
    'comma-style': 'error',
    'computed-property-spacing': 'error',
    'func-call-spacing': 'error',
    // "implicit-arrow-linebreak": ["error", "beside"],
    // indent: ['error', 4],
    'keyword-spacing': 'error',
    // "multiline-ternary": ["error", "never"],
    // 'no-lonely-if': 'error',
    'no-mixed-operators': 'off',
    'no-multiple-empty-lines': ['error', { max: 2, maxEOF: 1 }],
    'no-tabs': 'error',
    // 'no-unneeded-ternary': 'error',
    'no-whitespace-before-property': 'error',
    // "nonblock-statement-body-position": "error",
    'object-property-newline': [
      'error',
      { allowAllPropertiesOnSameLine: true },
    ],
    'quote-props': ['error', 'as-needed'],
    // quotes: ['error', 'prefer-single'],
    // semi: ['error', 'never'],
    'semi-spacing': 'error',
    'space-before-blocks': 'error',
    // 'space-before-function-paren': 'error',
    'space-in-parens': 'error',
    'space-infix-ops': 'error',
    'space-unary-ops': 'error',

    // ES6
    'arrow-spacing': 'error',
    // "no-confusing-arrow": "error",
    'no-duplicate-imports': 'error',
    'no-var': 'error',
    'object-shorthand': 'error',
    'prefer-const': 'error',
    'prefer-template': 'error',
  },

  // rules: {
  //   'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
  //   'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
  //   semi: ['error', 'never'],
  //   'max-len': 'off',
  //   camelcase: ['error', { properties: 'never', ignoreDestructuring: true, ignoreImports: true }]
  // }
};
