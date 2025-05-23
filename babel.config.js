module.exports = {
  presets: [
    ['@babel/preset-env', { targets: { node: 'current' } }],
    '@babel/preset-react' // For JSX, if any in your tests or transformed files
  ]
};
