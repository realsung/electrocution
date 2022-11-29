class Loader {
    constructor() {
        this._loaded = new Set();
        this._electronVersion = undefined;
    }

    list_files() { return this._loaded; }
    electronVersion() { return this._electronVersion; }

    /**
     * 
     * @param {String} file 
     */
    load_buffer(file) {
        return undefined;
    }
}

module.exports = {
    Loader
};