import { sourceTypes } from '../../../parser/types';
import { severity, confidence } from '../../attributes';

export default class NodeIntegrationAttachEventJSCheck {
  constructor() {
    this.id = 'NODE_INTEGRATION_ATTACH_EVENT_JS_CHECK';
    this.description = 'Disable nodeIntegration for untrusted origins';
    this.type = sourceTypes.JAVASCRIPT;
    this.shortenedURL = "https://git.io/JeuMZ";
  }

  match(astNode, astHelper) {
    if (!(astNode.type === 'CallExpression' && astNode.callee.property && astNode.callee.property.name === 'on' && astNode.arguments[0] && astNode.arguments[0].value === 'will-attach-webview')) {
      return null;
    }

    let loc = [];
    if (astNode.arguments.length > 1) {
      const found_nodes = astHelper.findNodeByType(astNode.arguments[1], 'AssignmentExpression', 0, true, node => node.left.type === 'MemberExpression' && node.left.object.name === 'webPreferences' && node.left.property.name === 'nodeIntegration' && node.right.value === true);
      if (found_nodes.length > 0) {
        loc.push({ line: found_nodes[0].loc.start.line, column: found_nodes[0].loc.start.column, id: this.id, description: this.description, shortenedURL: this.shortenedURL, severity: severity.HIGH, confidence: confidence.FIRM, manualReview: false });
      }
    }

    return loc;
  }
}
//# sourceMappingURL=NodeIntegrationAttachEventJSCheck.js.map