module.exports = {
  root: true,
  extends: ['umi', 'prettier', 'prettier/react'],
  globals: {
    luckysheet: true,
    pdfjsLib: true
  },
  parser: 'babel-eslint',
  plugins: ['react', 'prettier'],
  env: {
    browser: true,
    node: true,
    es6: true,
    mocha: true,
    jest: true,
    jasmine: true
  },
  rules: {
    'prettier/prettier': ['warn', {}, {}],
    'react/jsx-no-bind': 'off',
    'react/no-deprecated': 'off',
    'jsx-a11y/href-no-hash': 'off',
    'jsx-a11y/alt-text': 'off',
    'no-unused-vars': 'off',
    eqeqeq: 'off',
    'no-unreachable': 'off',
    radix: 'off',
    'array-callback-return': 'off',
    'no-unused-expressions': 'off'
  },
  parserOptions: {
    ecmaVersion: 7,
    sourceType: 'module',
    ecmaFeatures: {
      legacyDecorators: true,
      experimentalObjectRestSpread: true
    }
  },
  settings: {
    polyfills: ['fetch', 'Promise'],
    react: {
      version: 'detect'
    }
  }
}
// https://www.jianshu.com/p/dd07cca0a48e
// "rules": {
//   "generator-star-spacing": [0],
//   "consistent-return": [0],
//   "react/forbid-prop-types": [0],
//   "react/jsx-filename-extension": [
//     1,
//     {
//       "extensions": [".js"]
//     }
//   ],
//   "global-require": [1],
//   "import/prefer-default-export": [0],
//   "react/jsx-no-bind": [0],
//   "react/prop-types": [0],
//   "react/prefer-stateless-function": [0],
//   "react/jsx-wrap-multilines": [
//     "error",
//     {
//       "declaration": "parens-new-line",
//       "assignment": "parens-new-line",
//       "return": "parens-new-line",
//       "arrow": "parens-new-line",
//       "condition": "parens-new-line",
//       "logical": "parens-new-line",
//       "prop": "ignore"
//     }
//   ],
//   "no-else-return": [0],
//   "no-restricted-syntax": [0],
//   "import/no-extraneous-dependencies": [0],
//   "no-use-before-define": [0],
//   "jsx-a11y/no-static-element-interactions": [0],
//   "jsx-a11y/no-noninteractive-element-interactions": [0],
//   "jsx-a11y/click-events-have-key-events": [0],
//   "jsx-a11y/anchor-is-valid": [0],
//   "no-nested-ternary": [0],
//   "arrow-body-style": [0],
//   "import/extensions": [0],
//   "no-bitwise": [0],
//   "no-cond-assign": [0],
//   "import/no-unresolved": [0],
//   "object-curly-newline": [0],
//   "function-paren-newline": [0],
//   "no-restricted-globals": [0],
//   "react/jsx-no-duplicate-props": [2],
//   "require-yield": [1],
//   "compat/compat": "error",
//   "linebreak-style": "off",
//   "no-unused-vars": [0], //声明未使用
//   "max-len": "off",
//   "semi": "off",
//   "comma-dangle": "off",
//   "prefer-destructuring": "off",
//   "padded-blocks": "off",
//   "dot-notation": "off",
//   "no-shadow": "off",
//   "quotes": "off",
//   "arrow-parens":"off",
//   "no-script-url": [1],
//   "react/no-array-index-key": "off",
//   "react/no-multi-comp": "off",
//   "prefer-template": "off",
//   "react/jsx-indent": "off",
//   "no-param-reassign": "off",
//   "import/no-named-default": "off",
//   "jsx-a11y/label-has-for": "off",
//   "no-unused-expressions": "off",
//   "guard-for-in": "off",
//   "object-shorthand": "off",
//   "no-multi-spaces": [2],
//   "radix": "off",
//   "react/sort-comp": "off",
//   "no-plusplus": "off",
//   "comma-spacing": 1,
//   "key-spacing": [2],
//   "eqeqeq": "off"
// },
