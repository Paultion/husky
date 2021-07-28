#! /usr/bin/env node

// const { Command } = require('commander');
// const program = new Command();

// const packageJson = require('../package.json');

// program.version(packageJson.version, '-v, --version').option('-i, --init', 'init ').parse(process.argv);

// if (program.opts().init) {
//   require('./modifyGitHooksDir');
// } else {
//   require('./init');
// }

if (process.argv.includes('--init')) {
  require('./modifyGitHooksDir');
} else {
  require('./init');
}
