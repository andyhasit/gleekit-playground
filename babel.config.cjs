module.exports = {
  plugins: [
    [
      "babel-plugin-wallace",
      {
        flags: {
          allowBase: true,
          allowDismount: false,
          allowHub: true,
          allowMethods: true,
          allowParts: true,
          allowRepeaterSiblings: true,
          allowStubs: true,
        },
      },
    ],
    "@babel/plugin-syntax-jsx",
  ],
  presets: ["@babel/preset-typescript"],
};
