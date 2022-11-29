const { extension, findOldestElectronVersion } = require("../utils");
const { Loader } = require("./interface");

const chalk = require("chalk");
const logger = require("winston");
const path = require("path");
const asar = require("asar");

class LoaderAsar extends Loader {
    constructor() {
        super();
    }

    /**
     * 
     * @param {FileList} archive 
     */
    async load(archive) {
        const censorship_archive = new Array();
        this.archive = archive;

        const archived_files = asar.listPackage(archive); // unpack asar

        console.log(chalk.green(`Success archive asar file`));

        for(const file of archived_files) {
            const f = file.startsWith(path.sep) ? file.substring(1) : file;
            if(file.indexOf('node_modules') != -1) continue;

            switch (extension(file)) {
                case 'json':
                    if (file.toLowerCase().indexOf('package.json') < 0)
                    continue;
                case 'js':
                case 'jsx':
                case 'ts':
                case 'tsx':
                case 'htm':
                case 'html': {
                    this._loaded.add(file);
                    censorship_archive.push(file);
                    break;
                }
                default:
                    break;
            }
        }

        const readAndOptionallyParse  = (filename, shouldParse) => {
            try {
                const file = censorship_archive.find(f => f.endsWith(filename));
                const f = file.startsWith(path.sep) ? file.substring(1) : file;
                if (!f) return undefined;
                if(!shouldParse) return this.load_buffer(f);
                return (JSON.parse(this.load_buffer(f)));
            } catch (e) {
                return undefined;
            }
        };

        const electron_version = await findOldestElectronVersion({
            packageJsonData: readAndOptionallyParse('package.json', true),
            packagelockJsonData: readAndOptionallyParse('package-lock.json', true),
            yarnLockData: readAndOptionallyParse('yarn.lock', false),
        });

        if(electron_version) this._electronVersion = electron_version;
    }

    load_buffer(filename) {
        console.log(chalk.blue(`Extracting file: ${filename}`));
        const buffer = asar.extractFile(this.archive, filename);
        return buffer;
    }
}

module.exports = {
    LoaderAsar
}