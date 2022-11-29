

const { list_files, read_file, findOldestElectronVersion } = require("../utils");
const { Loader } = require("./interface");

class LoaderDirectory extends Loader {
    constructor() {
        super();
    }

    /**
     * 
     * @param {FileList} dir 
     */
    async load(dir) {
        const files = await list_files(dir);
        
        for (const file of files) {
            this._loaded.add(file);
        }

        const readAndOptionallyParse  = (filename, shouldParse) => {
            try {
              const file = files.find(f => f.endsWith(filename));
              if (!file) return undefined;
              if (!shouldParse) return this.load_buffer(file);
              return JSON.parse(this.load_buffer(file));
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

    /**
     * 
     * @param {File} filename 
     */
    load_buffer(filename) { 
        return read_file(filename);
    }
}

module.exports = {
    LoaderDirectory
}