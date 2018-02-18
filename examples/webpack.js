"use strict";

const path = require("path");

const _ = require("lodash");

const { testFiles, copyConfig, createConfig } = require("./common");

module.exports = _.transform(
  testFiles,
  (map, list, category) => {
    _.forEach(list, testName => {
      const title = `${category}/${testName}`;
      map[title] = {
        prepare(dirpath, done) {
          const webpack = require(path.join(dirpath, "lib/webpack.js"));
          const config = createConfig(dirpath, category, testName)[title];
          if (!config) {
            return done(new Error("Config not found"));
          }
          done(null, { webpack, config });
        },
        execute({ webpack, config }, done) {
          webpack(copyConfig(config), done);
        }
      };
    });
  },
  {}
);
