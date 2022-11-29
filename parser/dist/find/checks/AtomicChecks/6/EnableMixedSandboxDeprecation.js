import { sourceTypes } from '../../../../parser/types';
import { severity, confidence } from '../../../attributes';

export default class EnableMixedSandboxDeprecation {
  constructor() {
    this.id = 'ENABLE_MIXED_SANDBOX_DEPRECATION';
    this.description = '(ELECTRON 6) The app.enableMixedSandbox API has been deprecated since mixed-sandbox mode is now enabled by default.';
    this.type = sourceTypes.JAVASCRIPT;
    this.shortenedURL = 'https://git.io/Jvapp';
  }

  match(astNode, astHelper, scope) {
    if (astNode.type !== 'CallExpression') return null;
    if (!astNode.callee.property || astNode.callee.property.name !== 'enableMixedSandbox') {
      return null;
    }
    return [{ line: astNode.loc.start.line, column: astNode.loc.start.column, id: this.id, description: this.description, shortenedURL: this.shortenedURL, severity: severity.MEDIUM, confidence: confidence.CERTAIN, manualReview: false }];
  }
}
//# sourceMappingURL=EnableMixedSandboxDeprecation.js.map