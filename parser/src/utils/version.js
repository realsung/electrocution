const { minVersion, compare } = require("semver");
const lockfile = require("@yarnpkg/lockfile");

/**
 * 
 * @param {String} versionString 
 */
function minMatchingVersion(versionString) {
    try {
        const v = minVersion(versionString);
        return v.raw;
    } catch(_) { return undefined; }
}

/**
 * 
 * @param {Array} versions 
 */
function oldestVersion(versions) {
    const sortedVersioned = (versions || new Array()).sort((a, b) => compare(a, b));
    return sortedVersioned.length > 0 ? minMatchingVersion(sortedVersioned[0]) : undefined;
}

/**
 *  
 * @param {Object} packageJsonData 
 */
function findElectronVersionFromPackageJson(packageJsonData) {
    const dependencies = Object.assign({}, packageJsonData.devDependencies, packageJsonData.dependencies);
    return minMatchingVersion(dependencies['@types/electron'] || dependencies['electron']);
}

/**
 * 
 * @param {Object} packagelockJsonData 
 */
function findElectronVersionsFromPackageLock(packagelockJsonData) {
    if (!packagelockJsonData.dependencies) return undefined;
    return Object.entries(packagelockJsonData.dependencies).filter(d => d[0] === 'electron').map(d => minMatchingVersion(d[1].version));
}

/**
 * 
 * @param {Object} yarnLockData 
 */
function findElectronVersionsFromYarnLock(yarnLockData) {
    const plockData = lockfile.parse(yarnLockData);
    return findElectronVersionsFromPackageLock(plockData);
  }

/**
 * 
 * @param {Object} places 
 * @param {Object} [places.packageJsonData]
 * @param {Object} [places.packagelockJsonData]
 * @param {Object} [places.yarnLockData]
*/
 async function findOldestElectronVersion(places) {
    console.log(places.packageJsonData);
    var versions = new Array();

    if (places.packageJsonData) {
        const packageJsonData = findElectronVersionFromPackageJson(places.packageJsonData);
        if (packageJsonData) versions.push(packageJsonData);
    }

    if (places.packagelockJsonData) {
        const plockVersions = findElectronVersionsFromPackageLock(places.plockData);
        if (plockVersions) versions.push(...plockVersions);
    }
    
    if (places.yarnLockData) {
    const yarnLockVersions = findElectronVersionsFromYarnLock(places.yarnLockData);
    if (yarnLockVersions) versions.push(...yarnLockVersions);
    }

    // console.log(versions);
    return oldestVersion(versions);
}

module.exports = {
    findOldestElectronVersion
}