#! /usr/bin/env node

const { Command } = require('commander');
const { prompt } = require('enquirer');

const program = new Command();

const packageJson = require('../package.json');

program.version(packageJson.version, '-v, --version').option('-i, --init', 'init ').parse(process.argv);

(async () => {
  const { yes } = await prompt({
    type: 'confirm',
    name: 'yes',
    message: 'am i handsome?',
    initial: true
  });

  if (!yes) return;

  if (program.opts().init) {
    require('./modifyGitHooksDir');
  } else {
    require('./init');
  }
})();
