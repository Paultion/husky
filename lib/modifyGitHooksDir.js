#!/usr/bin/env node

const path = require('path');
const cp = require('child_process');

const huskyPath = path.resolve('.husky');

if (!huskyPath) {
  console.log('.husky not exists, run `highusky` first');
  process.exit(1);
}

try {
  const { error } = cp.spawnSync('git', ['config', 'core.hooksPath', huskyPath]);
  if (error) {
    throw error;
  }
} catch (e) {
  console.log('hooksPath failed to config');
  throw e;
}

console.log('hooksPath config success');
