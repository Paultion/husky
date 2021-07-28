#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const husky = require('husky');

const templatePath = path.resolve(__dirname, '../template');
const distTemplatePath = path.resolve('.');

// 1. 初始化git hooks
husky.install(path.resolve(distTemplatePath, '.husky'));

fs.readdirSync(templatePath).forEach(temp => {
  const tempPath = path.join(templatePath, temp);
  if (fs.statSync(tempPath).isDirectory()) {
    fs.readdirSync(tempPath).forEach(hook => {
      const hookPath = path.join(tempPath, hook);
      husky.set(`${temp}/${hook}`, fs.readFileSync(hookPath, 'utf-8'));
    });
  } else {
    fs.copyFileSync(path.resolve(templatePath, temp), path.resolve(distTemplatePath, temp));
  }
});

// 2. 更新package.json
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
appendDependencies(pkg, {
  prettier: '^2.3.2',
  'lint-staged': '^10.0.0'
});
appendScript(pkg, 'format', "prettier --write './**/*.{ts,tsx,js,html,json}'");
appendOtherConfig(pkg, 'lint-staged', {
  '*.{ts,tsx,js,html,json}': 'prettier --write'
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
