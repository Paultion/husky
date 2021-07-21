#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const husky = require('husky');

const templatePath = path.resolve(__dirname, '../template');
const distTemplatePath = path.resolve('.');

fs.readdirSync(templatePath).forEach(temp => {
  fs.copyFileSync(path.resolve(templatePath, temp), path.resolve(distTemplatePath, temp));
});

// 1. 初始化git hooks
husky.install(path.resolve(distTemplatePath, '.husky'));
husky.set('.husky/pre-commit', 'npx lint-staged');
husky.set('.husky/commit-msg', 'yarn commitlint --edit "$1"');

// 2. 更新package.json
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
appendDependencies(pkg, {
  prettier: '^2.3.2',
  '@commitlint/cli': '^12.1.4',
  '@commitlint/config-conventional': '^12.1.4',
  'lint-staged': '^10.0.0'
});
appendScript(pkg, 'format', "prettier --write './**/*.{ts,tsx,js,html,json}'");
appendOtherConfig(pkg, 'lint-staged', {
  '*.{ts,tsx,js,html,json}': 'yarn format'
});
fs.writeFileSync('package.json', `${JSON.stringify(pkg, null, 2)}`);

console.log('Installing dependencies using yarn...');
execSync('yarn', { stdio: 'inherit' });

function appendScript(pkg, scriptName, cmd) {
  pkg.scripts || (pkg.scripts = {});
  if (pkg.scripts[scriptName] !== undefined) {
    if (pkg.scripts[scriptName].includes(cmd)) {
      console.log(`  "${cmd}" command already exists in ${scriptName} script, skipping.`);
    } else {
      console.log(`  appending "${cmd}" command to ${scriptName} script`);
      pkg.scripts[scriptName] += ` && ${cmd}`;
    }
  } else {
    console.log(`  setting ${scriptName} script to command "${cmd}"`);
    pkg.scripts[scriptName] = cmd;
  }
}

function appendDependencies(pkg, dependencies) {
  pkg.devDependencies || (pkg.devDependencies = {});
  Object.keys(dependencies).forEach(dependency => {
    const version = dependencies[dependency];
    pkg.devDependencies[dependency] = version;
  });
}

function appendOtherConfig(pkg, name, config) {
  if (pkg[name]) return;
  pkg[name] = config;
}
