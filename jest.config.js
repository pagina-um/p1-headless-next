module.exports = {
  testEnvironment: "node",
  transform: {
    "^.+\\.(ts|tsx)$": "ts-jest",
  },
  moduleNameMapper: {
    // Must match the tsconfig paths alias ("@/*" -> "./src/*"). This previously
    // pointed at <rootDir>, which only went unnoticed because the sole test
    // imported a type — erased at compile time, so it never resolved at runtime.
    "^@/(.*)$": "<rootDir>/src/$1",
  },
};
