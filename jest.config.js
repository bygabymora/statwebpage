module.exports = {
  testEnvironment: "node",
  testPathIgnorePatterns: ["/node_modules/", "/.next/"],
  transform: {
    "^.+\\.(js|jsx|ts|tsx)$": "babel-jest",
  },
  // Add this line to handle ES modules in node_modules if necessary
  // transformIgnorePatterns: ['/node_modules/(?!your-es-module-dependency).+\\.js$'],
};
