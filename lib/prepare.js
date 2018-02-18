'use strict';

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const _ = require('lodash');
const async = require('neo-async');

const argv = process.argv.slice(2);

const remoteUrl = 'https://github.com/webpack/webpack.git';
const dirname = path.resolve(__dirname, '../webpacks');
const commands = {
  clone: `git clone --branch <tag> ${remoteUrl} ${dirname}/<tag>`,
  install: `cd ${dirname}/<tag> && yarn install`
};
if (!fs.existsSync(dirname)) {
  fs.mkdirSync(dirname);
}

async.forEach(argv, (version, done) => {
  const dirpath = path.resolve(dirname, version);
  const cmd = _.mapValues(commands, command => command.replace(/<tag>/g, version));
  async.angelFall([
    function download(next) {
      console.log(`Downloading... ${version}`);
      if (fs.existsSync(dirpath)) {
        console.log(`${version} already exists`);
        return done();
      }
      exec(cmd.clone, next);
    },
    function install(next) {
      console.log(`Installing... ${version}`);
      exec(cmd.install, next);
    }
  ], done);
});
