module.exports = {
    "env": {
        "node": 1,
        "es6": 1
    },
    "extends": "eslint:recommended",
    "globals": {
        "Atomics": "readonly",
        "SharedArrayBuffer": "readonly"
    },
    "parserOptions": {
        "ecmaVersion": 2018,
        "sourceType": "module"
    },
    "rules": {
        "strict": 1,
        "semi": ["error", "always"],
        "quotes": ["error", "double"]
    }
};
