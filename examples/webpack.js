"use strict";

const fs = require("fs");
const path = require("path");

const _ = require("lodash");

const testFiles = {
  "additional-pass": ["simple"],
  "async-commons-chunk": [
    "all-selected",
    "duplicate",
    "existing-name",
    "nested",
    "simple"
  ],
  "code-generation": ["require-context-id", "use-strict"],
  "commons-chunk-plugin": [
    "correct-order",
    "extract-async-from-entry",
    "hot",
    "hot-multi",
    "inverted-order",
    "library",
    "move-entry",
    "move-to-grandparent",
    "simple"
  ],
  compiletime: ["error-not-found", "warn-not-found"],
  "context-exclusion": ["simple"],
  "context-replacement": ["System.import", "a", "b", "c", "d"],
  "custom-hash-function": ["xxhash"],
  defaulter: ["immutable-config"],
  delegated: ["simple"],
  "delegated-hash": ["simple"],
  devtools: ["harmony-eval", "harmony-eval-source-map"],
  "dll-plugin": ["0-create-dll"],
  entry: [
    "function",
    "function-promise",
    "issue-1068",
    "require-entry-point",
    "single-entry-point"
  ],
  errors: ["entry-not-found", "import-missing", "multi-entry-missing-module"],
  externals: [
    "externals-in-chunk",
    "externals-in-commons-chunk",
    "harmony",
    "non-umd-externals-umd",
    "non-umd-externals-umd2",
    "optional-externals-cjs",
    "optional-externals-root",
    "optional-externals-umd",
    "optional-externals-umd2",
    "optional-externals-umd2-mixed"
  ],
  "filename-template": ["module-filename-template"],
  "hash-length": ["hashed-module-ids", "output-filename"],
  ignore: [
    "only-resource",
    "only-resource-context",
    "resource-and-context",
    "resource-and-context-contextmodule"
  ],
  issues: ["issue-3596"],
  library: ["0-create-library", "1-use-library", "a", "b", "umd"],
  loaders: [
    "generate-ident",
    "hot-in-context",
    "issue-3320",
    "pre-post-loader",
    "remaining-request"
  ],
  "no-parse": ["module.exports", "no-parse-function"],
  output: ["function", "string"],
  parsing: [
    "context",
    "extended-api",
    "harmony-global",
    "harmony-this",
    "harmony-this-concat",
    "issue-336",
    "issue-4857",
    "issue-5624",
    "node-source-plugin",
    "node-source-plugin-off",
    "relative-filedirname",
    "require.main",
    "system.import"
  ],
  performance: ["many-async-imports", "many-exports"],
  plugins: [
    "banner-plugin",
    "banner-plugin-hashing",
    "define-plugin",
    "environment-plugin",
    "lib-manifest-plugin",
    "loader-options-plugin",
    "min-chunk-size",
    "profiling-plugin",
    "progress-plugin",
    "provide-plugin"
  ],
  records: ["issue-295", "issue-2991"],
  "rule-set": [
    "chaining",
    "compiler",
    "custom",
    "query",
    "resolve-options",
    "simple",
    "simple-use-array-fn",
    "simple-use-fn-array"
  ],
  runtime: ["opt-in-finally"],
  "scope-hoisting": [
    "create-dll-plugin",
    "dll-plugin",
    "named-modules",
    "strictThisContextOnImports"
  ],
  "side-effects": ["side-effects-override"],
  simple: [
    "empty-config",
    "multi-compiler",
    "multi-compiler-functions",
    "multi-compiler-functions-export"
  ],
  "source-map": [
    "exclude-chunks-source-map",
    "exclude-modules-source-map",
    "line-to-line",
    "module-names",
    "namespace-source-path",
    "namespace-source-path.library",
    "nosources",
    "relative-source-map-path",
    "source-map-filename-contenthash",
    "sources-array-production"
  ],
  target: [
    "buffer",
    "buffer-default",
    "node-dynamic-import",
    "strict-mode-global",
    "umd-auxiliary-comments-object",
    "umd-auxiliary-comments-string",
    "umd-named-define",
    "web",
    "webworker"
  ]
};

module.exports = _.transform(
  testFiles,
  (map, list, category) => {
    _.forEach(list, testName => {
      const title = `${category}/${testName}`;
      map[title] = {
        prepare(dirpath, done) {
          const webpackPath = path.join(dirpath, "lib/webpack.js");
          const config = createConfig(dirpath, category, testName)[title];
          const webpack = require(webpackPath);
          if (!config) {
            return done(new Error("Config not found"));
          }
          done(null, { webpack, config });
        },
        execute({ webpack, config }, done) {
          webpack(config, done);
        }
      };
    });
  },
  {}
);
// module.exports = {
// 	test: {
// 		prepare(dirpath, done) {
// 			const webpackPath = path.join(dirpath, "lib/webpack.js");
// 			const contextPath = path.join(dirpath, "test/configCases/parsing/context");
// 			const webpack = require(webpackPath);
// 			const createConfig = () => ({
// 				module:
// 				{ unknownContextRegExp: /^\.\//,
// 					unknownContextCritical: false,
// 					exprContextRegExp: /^\.\//,
// 					exprContextCritical: false },
// 				context: contextPath,
// 				mode: "production",
// 				optimization: { minimize: false },
// 				entry: "./index.js",
// 				target: "async-node",
// 				output:
// 				{ path: contextPath,
// 					pathinfo: true,
// 					filename: "bundle0.js"
// 				}
// 			});
// 			done(null, { webpack, createConfig });
// 		},
// 		execute({ webpack, createConfig }, done) {
// 			webpack(createConfig(), done);
// 		}
// 	}
// }

function createConfig(dirpath, categoryName, testName) {
  dirpath = path.join(dirpath, "test");
  const prepareOptions = require(path.join(dirpath, "../lib/prepareOptions"));
  const casesPath = path.join(dirpath, "configCases");
  let categories = fs.readdirSync(casesPath);

  categories = categories.map(cat => {
    return {
      name: cat,
      tests: fs
        .readdirSync(path.join(casesPath, cat))
        .filter(folder => {
          return folder.indexOf("_") < 0;
        })
        .sort()
        .filter(testName => {
          const testDirectory = path.join(casesPath, cat, testName);
          const filterPath = path.join(testDirectory, "test.filter.js");
          if (fs.existsSync(filterPath) && !require(filterPath)()) {
            return false;
          }
          return true;
        })
    };
  });

  // filter
  categories = categories.filter(c => c.name === categoryName);
  categories.forEach(
    c => (c.tests = c.tests.filter(name => name === testName))
  );

  const opts = {};
  categories.forEach(category => {
    const { name } = category;
    category.tests.forEach(testName => {
      try {
        const testDirectory = path.join(casesPath, category.name, testName);
        const outputDirectory = path.join(
          dirpath,
          "js",
          "config",
          category.name,
          testName
        );
        const options = prepareOptions(
          require(path.join(testDirectory, "webpack.config.js"))
        );
        const optionsArr = [].concat(options);
        optionsArr.forEach((options, idx) => {
          if (!options.context) options.context = testDirectory;
          if (!options.mode) options.mode = "production";
          if (!options.optimization) options.optimization = {};
          if (options.optimization.minimize === undefined)
            options.optimization.minimize = false;
          if (!options.entry) options.entry = "./index.js";
          if (!options.target) options.target = "async-node";
          if (!options.output) options.output = {};
          if (!options.output.path) options.output.path = outputDirectory;
          if (typeof options.output.pathinfo === "undefined")
            options.output.pathinfo = true;
          if (!options.output.filename)
            options.output.filename = "bundle" + idx + ".js";
        });
        opts[`${name}/${testName}`] = options;
      } catch (e) {
        console.log(`Skipped ${name}:${testName}. message: ${e.message}`);
      }
    });
  });
  return opts;
}
