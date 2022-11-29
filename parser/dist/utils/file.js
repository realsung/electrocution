const fs = require("fs");
const dir = require("node-dir");
const os = require("os");
const path = require("path");
const VER = require("../../package.json").version;

/**
 * 
 * @param {Number} fileLines 
 * @param {Number} index 
 */
function getSample(fileLines, index) {
  let sample = fileLines[index];
  sample = sample.trim();

  return sample;
}

/**
 * 
 * @param {String} targetFolder 
 * @param {String || File} filePath 
 */
function getRelativePath(targetFolder, filePath) {
  if (filePath === "N/A") return filePath;
  if (is_directory(targetFolder)) return path.relative(targetFolder, filePath);else return path.relative(path.dirname(targetFolder), filePath);
}

/**
 * 
 * @param {any} root 
 * @param {String} isRelative 
 * @param {FileList} filename 
 * @param {String} result 
 * @param {Object || any} isSarif 
 */
function writeIssues(root, isRelative, filename, result, isSarif) {
  let output = '';
  let fileFlag = 'w';

  if (isSarif) {
    let issues = {
      $schema: "http://json.schemastore.org/sarif-2.1.0",
      version: "2.1.0",
      runs: [{
        tool: {
          driver: {
            version: `${VER}`,
            informationUri: "https://github.com/doyensec/electronegativity",
            name: "Electronegativity",
            fullName: "Electronegativity is a tool to identify misconfigurations and security anti-patterns in Electron applications",
            rules: []
          }
        },
        results: []
      }]
    };

    if (isRelative) {
      issues.runs[0].invocations = [{
        workingDirectory: {
          uri: `file:///${root}`
        },
        executionSuccessful: true
      }];
    }

    result.forEach(issue => {
      if (issues.runs[0].tool.driver.rules[issue.id] === undefined) {
        issues.runs[0].tool.driver.rules.push({
          id: issue.id,
          fullDescription: {
            text: issue.description
          },
          properties: {
            category: "Security"
          },
          helpUri: `https://github.com/doyensec/electronegativity/wiki/${issue.id}`,
          help: {
            text: `https://github.com/doyensec/electronegativity/wiki/${issue.id}`
          }
        });
        issues.runs[0].tool.driver.rules[issue.id] = true;
      }

      let result = {
        ruleId: issue.id,
        level: `${issue.manualReview ? 'note' : 'warning'}`,
        message: {
          text: issue.description
        }
      };

      result.locations = [{
        physicalLocation: {
          artifactLocation: {
            uri: issue.file !== "N/A" ? issue.file : "file:///"
          },
          region: {
            startLine: issue.location && issue.location.line !== undefined ? issue.location.line === 0 ? 1 : issue.location.line : 1,
            startColumn: issue.location && issue.location.column !== undefined ? issue.location.column + 1 : 1,
            charLength: issue.sample ? issue.sample.length : 0
          }
        }
      }];

      issues.runs[0].results.push(result);
    });

    output = JSON.stringify(issues, null, 2);
  } else {
    writeCsvHeader(filename);
    fileFlag = 'a';
    result.forEach(issue => {
      output += [issue.id, escapeCsv(issue.severity.name), escapeCsv(issue.confidence.name), escapeCsv(issue.file), escapeCsv(`${issue.location.line}:${issue.location.column}`), escapeCsv(issue.sample), escapeCsv(issue.description), `https://github.com/doyensec/electronegativity/wiki/${issue.id}`].toString();
      output += os.EOL;
    });
  }

  fs.writeFile(filename, output, { flag: fileFlag }, err => {
    if (err) throw err;
  });
}

module.exports = {
  getSample,
  getRelativePath,
  writeIssues
};
//# sourceMappingURL=file.js.map