module.exports = {
    parser: "@typescript-eslint/parser", // Specifies the ESLint parser
    extends: [
      "plugin:@typescript-eslint/recommended", // Uses the recommended rules from the @typescript-eslint/eslint-plugin
      "plugin:react/recommended"
    ],
    parserOptions: {
      ecmaVersion: 2018, // Allows for the parsing of modern ECMAScript features
      sourceType: "module" // Allows for the use of imports
    },
    rules: {
        // Place to specify ESLint rules. Can be used to overwrite rules specified from the extended configs
        // e.g. "@typescript-eslint/explicit-function-return-type": "off",
        "@typescript-eslint/explicit-function-return-type": "off",
        '@typescript-eslint/member-delimiter-style': ['error', {
            "multiline": {
              "delimiter": "none",
              "requireLast": false
            },
            "singleline": {
              "delimiter": "comma",
              "requireLast": false
            }
        }]
    }
}