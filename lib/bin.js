"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = __importDefault(require("fs"));
var path_1 = __importDefault(require("path"));
var child_process_1 = require("child_process");
var husky = require('husky');
var templatePath = path_1.default.resolve(__dirname, '../template');
var distTemplatePath = path_1.default.resolve('.');
fs_1.default.readdirSync(templatePath).forEach(function (temp) {
    fs_1.default.copyFileSync(path_1.default.resolve(templatePath, temp), path_1.default.resolve(distTemplatePath, temp));
});
// 1. 初始化git hooks
husky.install(path_1.default.resolve(distTemplatePath, '.husky'));
husky.set('.husky/pre-commit', 'npx lint-staged');
husky.set('.husky/commit-msg', 'yarn commitlint --edit "$1"');
// 2. 更新package.json
var pkg = JSON.parse(fs_1.default.readFileSync('package.json', 'utf-8'));
appendDependencies(pkg, {
    'prettier': '^2.3.2',
    '@commitlint/cli': '^12.1.4',
    '@commitlint/config-conventional': '^12.1.4',
    "lint-staged": "^10.0.0"
});
appendScript(pkg, 'format', "prettier --write './**/*.{ts,tsx,js,html,json}'");
appendOtherConfig(pkg, 'lint-staged', {
    '*.{ts,tsx,js,html,json}': 'yarn format',
});
fs_1.default.writeFileSync('package.json', "" + JSON.stringify(pkg, null, 2));
console.log('Installing dependencies using yarn...');
child_process_1.execSync('yarn', { stdio: 'inherit' });
function appendScript(pkg, scriptName, cmd) {
    pkg.scripts || (pkg.scripts = {});
    if (pkg.scripts[scriptName] !== undefined) {
        if (pkg.scripts[scriptName].includes(cmd)) {
            console.log("  \"" + cmd + "\" command already exists in " + scriptName + " script, skipping.");
        }
        else {
            console.log("  appending \"" + cmd + "\" command to " + scriptName + " script");
            pkg.scripts[scriptName] += " && " + cmd;
        }
    }
    else {
        console.log("  setting " + scriptName + " script to command \"" + cmd + "\"");
        pkg.scripts[scriptName] = cmd;
    }
}
function appendDependencies(pkg, dependencies) {
    pkg.devDependencies || (pkg.devDependencies = {});
    Object.keys(dependencies).forEach(function (dependency) {
        var version = dependencies[dependency];
        pkg.devDependencies[dependency] = version;
    });
}
function appendOtherConfig(pkg, name, config) {
    if (pkg[name])
        return;
    pkg[name] = config;
}
