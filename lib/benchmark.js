"use strict";

const fs = require("fs");
const path = require("path");

const _ = require("lodash");
const async = require("neo-async");
const { Suite } = require("benchmark");

const argv = require("minimist")(process.argv.slice(2));
const versions = argv._;
const task = argv.t || argv.task || "";
const re = new RegExp(`.*${task}.*`);

const prepare = require("./prepare");

const dirpath = path.resolve(__dirname, "../examples");
const tasks = _.chain(fs.readdirSync(dirpath))
  .map(filename => {
    const name = path.basename(filename, ".js");
    const file = require(path.resolve(dirpath, filename));
    return _.map(file, (task, title) => ({ name, title, task }));
  })
  .flatten()
  .filter(({ name, title }) => re.test(name) || re.test(title))
  .value();

async.angelFall([async.apply(prepare, versions), async.apply(execute, versions)], (err, result) => {
  if (err) {
    throw err;
  }
  const stats = {};
  _.forEach(result, ({ result }) =>
    _.forEach(result, ({ name, mean }) => {
      const s = (stats[name] = stats[name] || {
        name,
        count: 0,
        latency: 0
      });
      s.count++;
      s.latency += mean;
    })
  );
  _.chain(stats)
    .sortBy("latency")
    .forEach(({ name, count, latency }) => {
      latency *= 1000;
      const ave = latency / count;
      console.log(`[${name}] ave: ${ave.toPrecision(3)}ms latency: ${latency.toPrecision(3)}ms`);
    })
    .value();
});

function execute(versions, callback) {
  versions = _.shuffle(versions);
  console.log(`Comparing... ${versions}`);
  const dirpaths = _.map(versions, v => path.resolve(__dirname, "../webpacks", v));

  // add the latest webpack
  async.mapSeries(
    tasks,
    ({ name, title, task }, done) => {
      console.log(`Executing... [${name}:${title}]`);
      async.angelFall(
        [
          async.apply(async.map, dirpaths, task.prepare),
          // pre execute
          (list, next) => {
            try {
              async.forEach(list, (data, cb) => task.execute(data, cb), err => next(err, list));
            } catch (e) {
              console.error(e);
              console.log(`Skipped ${name}:${title}`);
              done(null, {});
            }
          },
          (list, next) => {
            const suite = new Suite();
            _.forEach(list, (data, i) => {
              const version = versions[i];
              suite.add(version, {
                defer: true,
                fn: deferred => task.execute(data, () => deferred.resolve())
              });
            });
            suite
              .on("complete", () => {
                const result = _.chain(suite)
                  .map(data => {
                    const { name, stats } = data;
                    const { mean } = stats;
                    return { name, mean };
                  })
                  .sortBy("mean")
                  .value();
                _.forEach(result, ({ name, mean }, index) => {
                  const rate = mean / _.first(result).mean;
                  mean *= 1000;
                  const m = mean.toPrecision(3);
                  console.log(`[${++index}] "${name}" ${m}ms [${rate.toPrecision(3)}]`);
                });
                next(null, {
                  name,
                  title,
                  result
                });
              })
              .run({ async: true });
          }
        ],
        done
      );
    },
    callback
  );
}
