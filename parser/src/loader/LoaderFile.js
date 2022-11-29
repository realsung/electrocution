

const { read_file } = require("../utils");
const { Loader } = require("./interface");

const fs = require("fs");
const path = require("path");

class LoaderFile extends Loader {
    constructor() {
        super();
    }

    /**
     * 
     * @param {File} file 
     */
    load(file) {
        const filename = path.resolve(file);
        if(!fs.existsSync(filename)) {
            throw new Error(`File ${filename} not found.`);
        }
        this._loaded.add(filename);
    }

    /**
     * 
     * @param {String} filename 
     */
    load_buffer(filename) {
        return read_file(filename);
    }
}

module.exports = {
    LoaderFile
}