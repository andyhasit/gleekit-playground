const { GleekitWebpackHelper } = require("gleekit/webpack");

const helper = new GleekitWebpackHelper();
const config = helper.getConfig();

module.exports = function () {
  console.log(config);
  return config;
};
