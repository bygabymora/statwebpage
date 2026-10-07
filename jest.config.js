module.exports = {
  testEnvironment: "node",
  testPathIgnorePatterns: ["/node_modules/", "/.next/"],
  transform: {
    // Babel config lives here (not in a root babel.config.js) so Next.js
    // keeps compiling the app with SWC instead of falling back to Babel.
    "^.+\\.(js|jsx|ts|tsx)$": ["babel-jest", { presets: ["next/babel"] }],
  },
  // Add this line to handle ES modules in node_modules if necessary
  // transformIgnorePatterns: ['/node_modules/(?!your-es-module-dependency).+\\.js$'],
};
