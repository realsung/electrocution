const esprima_parse = require("esprima");
const babelParser = require("@babel/parser");
const typescriptEstreeParser = require("@typescript-eslint/typescript-estree");
const cheerio_load = require("cheerio");

const { extension } = require("../utils");
const { Type, sourceExtensions } = require("./types");

const { EsprimaAst, BabelAst, ESLintAst, TreeSettings, Scope } = require("../find");

class Parser {
    constructor(babelFirst, typescriptBabelFirst) {
        this.esLintESTreeAst = new ESLintAst(new TreeSettings());
        this.esLintBabelTreeAst = new ESLintAst(new TreeSettings({ propertyName: 'ObjectProperty', stringLiteral: 'StringLiteral' }));
        this.babelAst = new BabelAst(new TreeSettings({ propertyName: 'ObjectProperty', stringLiteral: 'StringLiteral' }));
        this.esprimaAst = new EsprimaAst(new TreeSettings());

        this.babelFirst = babelFirst;
        this.typescriptBabelFirst = typescriptBabelFirst;

        this.babelPlugins = ["jsx", "objectRestSpread", "classProperties", "optionalCatchBinding", "asyncGenerators", "decorators-legacy", "flow", "dynamicImport", "estree"];

        this.tsPlugins = ["jsx", "objectRestSpread", "classProperties", "optionalCatchBinding", "asyncGenerators", "decorators-legacy", "typescript", "dynamicImport"];
    }

    addPlugin(plugin) {
        this.tsPlugins.push(plugin);
        this.babelPlugins.push(plugin);
    }

    parseEsprima(content) {
        let data = esprima_parse(content, { loc: true, tolerant: true, jsx: true });
        data.astParser = this.esprimaAst;
        data.Scope = new Scope(data);
        return data;
    }

    parseBabel(content) {
        let data = babelParser.parse(content, {
            sourceType: "module",
            plugins: this.babelPlugins,
            ecmaFeatures: {
                modules: true
            }
        }).program;

        data.astParser = this.esprimaAst;
        data.Scope = new Scope(data);
        return data;
    }

    parseTypeScript(content) {
        let data = babelParser.parse(content, {
            sourceType: "module",
            plugins: this.tsPlugins
        });

        data.astParser = this.esLintBabelTreeAst;
        data.Scope = {};
        data.Scope.resolveVarValue = astNode => astNode.arguments[0];
        data.Scope.updateFunctionScope = () => {};
        return data;
    }

    parseTypescriptEstree(content) {
        let data = typescriptEstreeParser.parse(content, {
            loc: true,
            range: true,
            tokens: true,
            errorOnUnknownASTType: true,
            useJSXTextNode: true,
            ecmaFeatures: {
                jsx: true,
                modules: true
            }
        });

        data.astParser = this.esLintESTreeAst;
        data.Scope = {};
        data.Scope.resolveVarValue = astNode => astNode.arguments[0];
        data.Scope.updateFunctionScope = () => {};
        return data;
    }

    parse(filename, content) {
        const ext = extension(filename);

        const sourceType = sourceExtensions[ext];
        content = content.toString();
        let data = null;

        switch (sourceType) {
            case Type.JAVASCRIPT:
                content = content.replace(/(^#!.*)/, function (m) {
                    return Array(m.length + 1).join(' ');
                });

                if (ext === 'ts' || ext === 'tsx') {
                    try {
                        data = this.typescriptBabelFirst ? this.parseTypeScript(content) : this.parseTypescriptEstree(content);
                    } catch (error1) {
                        try {
                            data = this.typescriptBabelFirst ? this.parseTypescriptEstree(content) : this.parseTypeScript(content);
                        } catch (error2) {
                            throw this.typescriptBabelFirst ? error1 : error2;
                        }
                    }
                    break;
                }

                try {
                    data = this.babelFirst ? this.parseBabel(content) : this.parseEsprima(content);
                } catch (error) {
                    data = this.babelFirst ? this.parseEsprima(content) : this.parseBabel(content);
                }
                break;
            case Type.HTML:
                data = cheerio_load(content, { xmlMode: true, withStartIndices: true, lowerCaseTags: true, lowerCaseAttributeNames: true });
                break;
            case Type.JSON:
                data = { json: JSON.parse(content), text: content };
                break;
            default:
                break;
        }

        return [sourceType, data, content, data ? data.errors : undefined];
    }
}

module.exports = {
    Parser
};
//# sourceMappingURL=parser.js.map