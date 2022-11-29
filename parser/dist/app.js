

const { file_exist, is_directory, extension, writeIssues, getRelativePath } = require("./utils");
const chalk = require("chalk");
const program = require("commander");
const { LoaderDirectory, LoaderFile, LoaderAsar } = require("./loader");
const logger = require("winston");
const { Parser } = require("./parser");
const { GlobalChecks, severity, confidence } = require("./find");

/**
 * 
 * @param { program.Command } options 
 */
async function app(options) {
    if (!file_exist(options.input)) {
        console.error(chalk.red('Input does not exist!'));
        program.outputHelp();
        process.exit(0);
    }

    let loader;
    if (is_directory(options.input)) {
        loader = new LoaderDirectory();
    } else {
        loader = extension(options.input) === 'asar' ? new LoaderAsar() : new LoaderFile();
    }

    await loader.load(options.input);
    const electron_version = loader.electronVersion();
    if (!electron_version) console.log(chalk.red(`Couldn't detect Electron version, assuming v0.1.0. Defaults have probably changed for your actual version, please check manually.`));else console.log(chalk.bold(chalk.green(`[+] electron version is "${electron_version}"`)));

    if (options.severitySet) {
        if (!severity.hasOwnProperty(options.severitySet.toUpperCase())) {
            const err = 'This severity level does not exist!';
            if (forCli) {
                console.error(chalk.red(err));
                process.exit(1);
            } else throw new Error(err);
        } else options.severitySet = severity[options.severitySet.toUpperCase()];
    } else options.severitySet = severity["INFORMATIONAL"];

    if (options.confidenceSet) {
        if (!confidence.hasOwnProperty(options.confidenceSet.toUpperCase())) {
            const err = 'This confidence level does not exist!';
            if (forCli) {
                console.error(chalk.red(err));
                process.exit(1);
            } else throw new Error(err);
        } else options.confidenceSet = confidence[options.confidenceSet.toUpperCase()];
    } else options.confidenceSet = confidence["TENTATIVE"];

    const parser = new Parser(false, true);

    if (options.parserPlugins.length > 0) {
        options.parserPlugins.forEach(plugin => parser.addPlugin(plugin));
    }

    const globalChecker = new GlobalChecks(options.customScan, options.excludeFromScan, options.electronUpgrade);

    // if (options.customScan.length > 0) options.customScan = options.customScan.filter(r => !r.includes('globalcheck')).concat(globalChecker.dependencies);
    // if (options.excludeFromScan.length > 0) options.excludeFromScan = options.excludeFromScan.filter(r => !r.includes('globalcheck'));

    // const finder = await new Finder(options.customScan, options.excludeFromScan, options.electronUpgrade);
    // const filenames = [...loader.list_files()];
    // console.log(filenames);
}

module.exports = {
    app
};
//# sourceMappingURL=app.js.map