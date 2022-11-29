const fs = require("fs");
const dir = require("node-dir");
const os = require("os");
const path = require("path");

/**
 * 
 * @param {FileList} file 
 */
function file_exist(file) {
    try {
        return fs.lstatSync(file);
    } catch (e) {
        return false;
    }
}

/**
 * 
 * @param {FileList} dir 
 */
function is_directory(dir) {
    return fs.statSync(dir).isDirectory();
}

/**
 * 
 * @param {FileList} files 
 */
async function list_files(files) {
    return dir.promiseFiles(files).then(file => {
        file = file.filter(_file => {
            return _file.indexOf('node_modules') === -1 && (['js', 'jsx', 'ts', 'html', 'htm', 'tsx'].includes(extension(_file)) || _file.toLowerCase().indexOf('package-lock.json') > -1 || _file.toLowerCase().indexOf('package.json') > -1 || _file.toLowerCase().indexOf('yarn.lock') > -1);
        });
        return file;
    }).catch(console.error);
}

/**
 * 
 * @param {File} file 
 */
function read_file(file) {
    return fs.readFileSync(file, 'utf8');
}

/**
 * 
 * @param {String} file 
 */
function extension(file) {
    return file.slice((file.lastIndexOf('.') - 1 >>> 0) + 2).toLowerCase();
}

module.exports = {
    file_exist,
    is_directory,
    read_file,
    list_files,
    extension
};
//# sourceMappingURL=utils.js.map