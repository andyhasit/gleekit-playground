const { GleekitWebpackHelper } = require("gleekit/webpack");

const helper = new GleekitWebpackHelper({
  useSass: true,
  useTailwind: true,
});
const config = helper.getConfig();

module.exports = function () {
  console.log(config);
  return config;
};
