#!/usr/bin/env node

const path = require('path');
const husky = require('husky');

const distTemplatePath = path.resolve('.');

husky.install(path.resolve(distTemplatePath, '.husky'));
