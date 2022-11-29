import { sourceTypes } from '../../../parser/types';
import { severity, confidence } from '../../attributes';

export default class NodeIntegrationJSCheck {
  constructor() {
    this.id = 'NODE_INTEGRATION_JS_CHECK';
    this.description = `Disable nodeIntegration for untrusted origins`;
    this.type = sourceTypes.JAVASCRIPT;
    this.shortenedURL = "https://git.io/JeuMn";
  }

  //nodeIntegration Boolean (optional) - Whether node integration is enabled. Default is true.
  //nodeIntegrationInWorker Boolean (optional) - Whether node integration is enabled in web workers. Default is false
  //nodeIntegrationInSubFrames Boolean (optional) - Whether node integration is enabled in in sub-frames such as iframes. Default is false

  match(astNode, astHelper, scope, defaults) {
    if (astNode.type !== 'NewExpression') return null;
    if (astNode.callee.name !== 'BrowserWindow' && astNode.callee.name !== 'BrowserView') return null;

    let nodeIntegrationFound = false;
    let locations = [];
    if (astNode.arguments.length > 0) {

      var target = scope.resolveVarValue(astNode);

      let loc = [];

      nodeIntegrationFound = this.findNode(astHelper, target, 'nodeIntegration', value => value === false, loc);
      // nodeIntegrationInWorker default value is safe, as well as nodeIntegrationInSubFrames
      // so no check for return value (don't care if it was found)
      this.findNode(astHelper, target, 'nodeIntegrationInWorker', value => value !== true, loc);
      this.findNode(astHelper, target, 'nodeIntegrationInSubFrames', value => value !== true, loc);

      let sandboxLoc = [];
      let sandboxFound = this.findNode(astHelper, target, 'sandbox', value => value !== true, sandboxLoc);
      if (!sandboxFound || sandboxLoc.length <= 0) // sandbox disables node integration
        locations = locations.concat(loc);
    }

    if (!nodeIntegrationFound && defaults.nodeIntegration) {
      locations.push({ line: astNode.loc.start.line, column: astNode.loc.start.column, id: this.id, description: this.description, shortenedURL: this.shortenedURL, severity: severity.HIGH, confidence: confidence.FIRM, manualReview: false });
    }

    return locations;
  }

  findNode(astHelper, startNode, name, skipCondition, locations) {
    let found = false;
    var nodeIntegrationStrings = ["nodeIntegration", "nodeIntegrationInWorker", "nodeIntegrationInSubFrames"];
    const nodes = astHelper.findNodeByType(startNode, astHelper.PropertyName, astHelper.PropertyDepth, false, node => {
      return node.key.value === name || node.key.name === name;
    });

    for (const node of nodes) {
      // in practice if there are two keys with the same name, the value of the last one wins
      // but technically it is an invalid json
      // just to be on the safe side show a warning if any value is insecure
      found = true;
      let needsManualReview;

      if (node.value.type === "Identifier") // it's a variable, needs manual review since it's probably a custom webpreferences object
        needsManualReview = true;else if (node.value.type === "UnaryExpression") {
        // it's a !0 || !1 unary expression. 
        if (node.value.operator == "!" && typeof node.value.argument.value === "number") {
            // if it's more complicated (e.g. !!!1), report for manual review and treat as insecure
            if (eval(node.value.operator + node.value.argument.value)) needsManualReview = false; // it's truthy, so it's enabled
            else continue; //it's falsy, so it's disabled

        } else needsManualReview = true;
      } else needsManualReview = false;

      if (skipCondition(node.value.value)) {
        if ((node.key.value === "sandbox" || node.key.name === "sandbox") && needsManualReview) continue;
        if ((nodeIntegrationStrings.includes(node.key.value) || nodeIntegrationStrings.includes(node.key.name)) && !needsManualReview) continue;
      }

      locations.push({
        line: node.key.loc.start.line,
        column: node.key.loc.start.column,
        id: this.id,
        description: this.description,
        shortenedURL: this.shortenedURL,
        severity: severity.INFORMATIONAL,
        confidence: confidence.FIRM,
        manualReview: needsManualReview
      });
    }

    return found;
  }
}
//# sourceMappingURL=NodeIntegrationJSCheck.js.map