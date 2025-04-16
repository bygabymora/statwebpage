module.exports = {
    presets: ["next/babel"],
    plugins: [],
    overrides: [
      {
        test: /\.js$/,
        presets: [
          [
            "@babel/preset-env",
            {
              targets: {
                esmodules: true,
              },
              exclude: ["@babel/plugin-transform-classes"],
            },
          ],
        ],
      },
    ],
  };