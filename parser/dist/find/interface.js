

const escope = require('escope');

class Ast {
  constructor(settings) {
    this.settings = settings;
  }

  findNodeByType(ast, type, max_depth, stopAtFirst, found) {
    const cb = found;
    return this.findNode(ast, max_depth, stopAtFirst, node => {
      if (node.type === type && cb(node)) {
        return true;
      }
    });
  }

  PropertyName() {
    return this.settings.PropertyName;
  }
  StringLiteral() {
    return this.settings.StringLiteral;
  }
  PropertyDepth() {
    return this.settings.PropertyDepth;
  }
}

class TreeSettings {
  constructor({ propertyname = 'Property', stringLiteral = 'Literal', propertyDepth = 4 } = {}) {
    this.propertyname = propertyname;
    this.StringLiteral = stringLiteral;
    this.PropertyDepth = propertyDepth;
  }
}

class Scope {
  constructor(ast) {
    if (/Program|File/.test(ast.type)) {
      var _scopeManager = {};
      var _globalScope = {};
      var _functionScope = {};
      try {
        _scopeManager = escope.analyze(ast);
      } catch (error) {
        _scopeManager = escope.analyze(ast, { ecmaVersion: 6, sourceType: "module", ecmaFeatures: { modules: true } });
      }

      _globalScope = _scopeManager.acquire(ast);
      _functionScope = _globalScope;

      this.scopeManager = _scopeManager;
      this.globalScope = _globalScope;
      this.functionScope = _functionScope;
    }
  }

  updateFunctionScope(ast, action) {
    if (Object.keys(this.scopeManager).length > 0 && this.scopeManager.acquire(ast) != null) {
      if (action === 'enter') this.functionScope = this.scopeManager.acquire(ast);else if (this.functionScope.upper != null) this.functionScope = this.functionScope.upper;
    }
  }

  getVarInScope(varName) {
    var res = this.functionScope.variables.find(variable => variable.name === varName);
    if (res) return res;else {
      res = this.globalScope.variables.find(variable => variable.name === varName);
      if (res) return res;else return null;
    }
  }

  resolveVarValue(astNode) {
    if (astNode.arguments[0].type !== "Identifier") return astNode.arguments[0];else {
      var target = this.getVarInScope(astNode.arguments[0].name);
      if (target != null) {
        target = target.defs[0].node.init;
        return target;
      } else {
        return astNode.arguments[0];
      }
    }
  }
}

module.exports = {
  Ast,
  TreeSettings,
  Scope
};
//# sourceMappingURL=interface.js.map