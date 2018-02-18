"use strict";

const path = require("path");

const _ = require("lodash");

const { createConfig } = require("./common");

const testClasses = {
  parsing: {
    context: {
      factoryNames: ["ContextModuleFactory", "NormalModuleFactory"]
    }
  }
};

module.exports = _.transform(testClasses, (map, testNames, category) => {
  _.forOwn(testNames, ({ factoryNames }, testName) => {
    _.forEach(factoryNames, factoryName => {
      const title = `${category}/${testName}/${factoryName}`;
      map[title] = {
        prepare(dirpath, done) {
          getFactory(dirpath, category, testName, factoryName, done);
        },
        execute({ compiler, module, dependency }, done) {
          const { factory, dependencies } = dependency;
          factory.create(
            {
              contextInfo: {
                issuer: module.nameForCondition && module.nameForCondition(),
                compiler: compiler.name
              },
              resolveOptions: module.resolveOptions,
              context: module.context,
              dependencies
            },
            done
          );
        }
      };
    });
  });
});

function getFactory(dirpath, category, testName, factoryName, callback) {
  const webpack = require(path.join(dirpath, "lib/webpack.js"));
  const title = `${category}/${testName}`;
  const config = createConfig(dirpath, category, testName)[title];
  if (!config) {
    return callback(new Error("Config not found"));
  }
  const compiler = webpack(config);
  const params = compiler.newCompilationParams();
  const compilation = compiler.newCompilation(params);
  const { addModuleDependencies } = compilation;
  compilation.addModuleDependencies = (...args) => {
    const [module, dependencies] = args;
    const dependency = _.find(dependencies, dep => dep.factory.constructor.name === factoryName);
    if (dependency) {
      callback(null, { compiler, module, dependency });
      callback = () => {};
    } else {
      addModuleDependencies.apply(compilation, args);
    }
  };
  compiler.createCompilation = () => compilation;
  compiler.compile(err => {
    if (err) {
      throw err;
    }
  });
}
