const path = require("path");
const fs = require("fs");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const RemoveEmptyScriptsPlugin = require("webpack-remove-empty-scripts");
const { getDevServer, GleekitWebpackHelper } = require("gleekit/webpack");

const helper = new GleekitWebpackHelper({ sourceDir: "apps" });
const config = {
  ...helper.getAll(),
  infrastructureLogging: {
    level: "verbose",
  },
  module: {
    rules: [
      {
        test: /\.(js|mjs|jsx|ts|tsx)$/,
        exclude: /node_modules\/(?!(wallace)\/).*/,
        use: [
          {
            loader: "babel-loader",
          },
        ],
      },
      {
        test: /\.module\.(css|scss)$/,
        use: [
          // MiniCssExtractPlugin.loader,
          "style-loader",
          "css-modules-typescript-loader",
          {
            loader: "css-loader",
            options: {
              esModule: true,
              modules: {
                localIdentName: "[name]__[local]__[hash:base64:5]",
                exportLocalsConvention: "camelCase",
                exportOnlyLocals: false,
                namedExport: false,
              },
            },
          },
          "sass-loader",
        ],
      },
      {
        test: /\.(css|scss)$/,
        exclude: /\.module\.(css|scss)$/,
        use: [MiniCssExtractPlugin.loader, "css-loader", "sass-loader"],
      },
    ],
  },
  resolve: {
    fallback: { crypto: false },
    extensions: [".ts", ".tsx", ".js", ".jsx"],
  },
  plugins: [
    // This is necessary are we're creating entries for CSS, but that emits empty JS
    // files, so we delete those.
    new RemoveEmptyScriptsPlugin(),
    new MiniCssExtractPlugin({
      filename: ({ chunk }) => `${chunk.name}.css`,
    }),
    ...helper.getPlugins(),
  ],
};

const configureForEnv = (config) => {
  config.mode = process.env.NODE_ENV || "development";
  if (config.mode === "production") {
    config.optimization = {
      minimize: true,
    };
  } else {
    config.devtool = "eval-source-map";
    // config.devtool = "inline-source-map";
  }
};

module.exports = function () {
  configureForEnv(config);
  console.log(config);
  return config;
};
