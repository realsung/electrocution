// const { ELECTRON_GLOBAL_UPGRADE_CHECKS } = require('./checks/GlobalChecks/ElectronGlobalUpgradeChecks');
// const { GLOBAL_CHECKS } = require("./checks/GlobalChecks");
const { chalk } = require("chalk");

class GlobalChecks {
  constructor(customScan, excludeFromScan, electronUpgrade) {
    let candidateChecks = Array.from(GLOBAL_CHECKS);

    if (electronUpgrade) {
      const [currentVersion, targetVersion] = electronUpgrade.split('..');
      if (currentVersion && targetVersion) {
        this._enabled_checks = [];
        Object.keys(ELECTRON_GLOBAL_UPGRADE_CHECKS).forEach(versionToCheck => {
          if (versionToCheck > currentVersion && versionToCheck <= targetVersion) {
            candidateChecks = candidateChecks.concat(ELECTRON_GLOBAL_UPGRADE_CHECKS[versionToCheck]);
          }
        });
      } else {
        console.error(chalk.red(`When specifying the upgrade options please specify your current version and target version like this: x..y (eg 7..8)`));
        process.exit(1);
      }
    }

    this._enabled_checks = candidateChecks;
    if (customScan && customScan.length > 0) {
      var globalChecksNames = this._enabled_checks.map(globalCheck => globalCheck.name.toLowerCase());
      var customGlobals = customScan.filter(r => r.includes('globalcheck'));
      if (customGlobals.length > 0 && !customGlobals.some(r => globalChecksNames.includes(r))) {
        console.error(chalk.red(`You have an error in your custom checks list. Maybe you misspelt some check names?`));
        process.exit(1);
      } else {
        for (var i = globalChecksNames.length - 1; i >= 0; i--) if (!customGlobals.includes(globalChecksNames[i])) this._enabled_checks.splice(i, 1);
      }
    }

    if (excludeFromScan && excludeFromScan.length > 0) {
      var globalChecksNames = this._enabled_checks.map(globalCheck => globalCheck.name.toLowerCase());
      var customGlobals = excludeFromScan.filter(r => r.includes('globalcheck'));
      if (customGlobals.length > 0 && !customGlobals.some(r => globalChecksNames.includes(r))) {
        console.error(chalk.red(`You have an error in your custom checks list. Maybe you misspelt some check names?`));
        process.exit(1);
      } else {
        for (var i = globalChecksNames.length - 1; i >= 0; i--) if (customGlobals.includes(globalChecksNames[i])) this._enabled_checks.splice(i, 1);
      }
    }
    this._constructed_checks = [];
    this.dependencies = [];
    this.init_checks_list();
  }

  init_checks_list() {
    for (const check of this._enabled_checks) {
      const checkInstance = new check();
      this._constructed_checks.push(checkInstance);
      this.dependencies = [...this.dependencies, ...checkInstance.depends];
    }
    this.dependencies = this.dependencies.map(dependency => dependency.toLowerCase());
  }

  async getResults(issues, output) {
    var result = [];
    issues.forEach(issue => issue.processed = false);

    for (const check of this._constructed_checks) {

      issues.forEach(issue => {
        if (check.depends.includes(issue.constructorName)) issue.processed = true;
      });

      var targetedIssues = issues.filter(issue => check.depends.includes(issue.constructorName) && !issue.visibility.inlineDisabled);

      result = [...result, ...(await check.perform(targetedIssues, output))];
    }

    return [...result, ...issues.filter(issue => !issue.processed)];
  }

}

module.exports = {
  GlobalChecks
};
//# sourceMappingURL=globalcheck.js.map