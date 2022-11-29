

const program = require("commander");
const path = require("path");
const chalk = require("chalk");
const { app } = require("./app");
const VER = require('../package.json').version;
const { is_directory, extension } = require("./utils");

const forCli = !program.output;

program.version(VER).description('electron exploit check tools').option('-i, --input <path>', 'input [directory | .js | .html | .asar]').parse(process.argv);

if (!program.input) {
  program.outputHelp();
  process.exit(1);
} else {
  if (extension(program.input) != 'js' && extension(program.input) != 'html' && extension(program.input) != 'asar' && !is_directory(program.input)) {
    console.error(chalk.red('Please specify file format extension.'));
    program.outputHelp();
    process.exit(1);
  }
}

if (program.output) {
  program.fileFormat = program.output.split('.').pop();
  if (program.fileFormat !== 'csv' && program.fileFormat !== 'sarif') {
    console.error(chalk.red('Please specify file format extension.'));
    program.outputHelp();
    process.exit(1);
  }
}

if (typeof program.checks !== 'undefined' && program.checks) {
  program.checks = program.checks.split(",").map(check => check.trim().toLowerCase());
} else program.checks = [];

if (typeof program.excludeChecks !== 'undefined' && program.excludeChecks) {
  program.excludeChecks = program.excludeChecks.split(",").map(check => check.trim().toLowerCase());
} else program.excludeChecks = [];

if (typeof program.verbose !== 'undefined' && falsyStrings.includes(program.verbose)) program.verbose = false;else program.verbose = true;

if (typeof program.parserPlugins !== 'undefined' && program.parserPlugins) program.parserPlugins = program.parserPlugins.split(",").map(p => p.trim());else program.parserPlugins = [];

const input = path.resolve(program.input);

app({
  input,
  output: program.output,
  isSarif: program.fileFormat === 'sarif',
  customScan: program.checks,
  excludeFromScan: program.excludeChecks,
  severitySet: program.severity,
  confidenceSet: program.confidence,
  isRelative: program.relative,
  isVerbose: program.verbose,
  electronUpgrade: program.upgrade,
  electronVersionOverride: program.electronVersion,
  parserPlugins: program.parserPlugins
}, forCli).catch(error => {
  console.error(chalk.red(error.stack));
  process.exit(1);
});
//# sourceMappingURL=index.js.map