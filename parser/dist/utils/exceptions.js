
const { Types } = require("../parser/types");

function isDisabledByInlineComment(firstLineSample, matchedLineSample, check, sourceType) {

    var result = {
        excludesGlobal: [],
        inlineDisabled: false,
        globalCheckDisabled: false
    };

    const regex = [/(?:\/\*|\/\/)[ \t]*eng-disable[ \t]+([\w \t]+)/is, /<!--[ \t]*eng-disable[ \t]+([\w \t]+)-->/is][sourceType];

    var entireFileRulesList = firstLineSample.match(regex);
    var inlineRulesList = matchedLineSample.match(regex);
    var mergedRules = [];

    if (entireFileRulesList != null && entireFileRulesList.length > 1) {
        entireFileRulesList = entireFileRulesList[1].trim().split(/(?:,| |\t)+/);
        mergedRules = [...mergedRules, ...entireFileRulesList];
    }

    if (inlineRulesList != null && inlineRulesList.length > 1) {
        inlineRulesList = inlineRulesList[1].trim().split(/(?:,| |\t)+/);
        mergedRules = [...mergedRules, ...inlineRulesList];
    }

    for (var directive of mergedRules) {
        if (directive.toLowerCase() === check.constructor.name.toLowerCase() || directive.toUpperCase() === check.id.toUpperCase()) {
            result.inlineDisabled = true;
            break;
        }
    }

    for (var directive of mergedRules) {
        if (directive.toLowerCase() === check.constructor.name.toLowerCase().replace(/_(js|html|json)_check/, "_global_check") || directive.toUpperCase() === check.id.toUpperCase().replace(/_(JS|HTML|JSON)_CHECK/, "_GLOBAL_CHECK")) {
            result.excludesGlobal.push(directive.toUpperCase());
            break;
        }
    }

    return result;
}

module.exports = {
    isDisabledByInlineComment
};
//# sourceMappingURL=exceptions.js.map