const path = require("path");
const fs = require("fs");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const RemoveEmptyScriptsPlugin = require("webpack-remove-empty-scripts");
const { getDevServer } = require("gleekit/webpack");

const COPY_PATTERNS = [];

const config = {
  entry: {},
  devServer: getDevServer(__dirname),
  output: {
    path: path.resolve(__dirname, "dist/"),
  },
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
      // {
      //   test: /\.css$/,
      //   use: ["style-loader", "css-loader"],
      // },
      // {
      //   test: /\.(css|scss)$/,
      //   use: [
      //     // MiniCssExtractPlugin.loader, // extracts CSS into file

      //     // "css-loader", // resolves @import and url()
      //     // "sass-loader", // compiles SCSS → CSS
      //     "style-loader",
      //     {
      //       loader: "css-loader",
      //       options: {
      //         modules: true,
      //       },
      //     },
      //   ],
      // },
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
  ],
};

const addCopyPattern = (src, dest) => {
  COPY_PATTERNS.push({
    from: src,
    to: dest,
  });
};

/*
This collects all manifest files from apps dir and loads them as webpack
entries.
TODO: should we load from settings instead?
*/
const loadApps = (config) => {
  const entries = [];
  fs.readdirSync("./apps").forEach((app) => {
    if (app.startsWith("_")) return;
    const manifestPath = `./apps/${app}/manifest.json`;
    if (fs.existsSync(manifestPath)) {
      addCopyPattern(manifestPath, `${app}/manifest.json`);
      const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
      console.log(`Loaded ${app} from ${manifestPath}`);
      manifest.entries.forEach(([src, out]) => {
        // Needed as we're loading CSS as entries.
        const entryName = `${app}/${out.replace(/\.(css|js)$/, "")}`;
        entries.push({
          import: `./apps/${app}/${src}`,
          name: entryName,
        });
      });
    }
  });
  config.entry = Object.fromEntries(entries.map((e) => [e.name, e.import]));
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
  loadApps(config);
  configureForEnv(config);
  if (COPY_PATTERNS.length > 0) {
    config.plugins.push(
      new CopyWebpackPlugin({
        patterns: COPY_PATTERNS,
      })
    );
  }
  return config;
};
