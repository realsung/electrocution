const Type = {
    JAVASCRIPT : 0,
    HTML: 1,
    JSON: 3,
};

const sourceExtensions = {
    js: Type.JAVASCRIPT,
    jsx: Type.JAVASCRIPT,
    ts: Type.JAVASCRIPT,
    tsx: Type.JAVASCRIPT,
    html: Type.HTML,
    htm: Type.HTML,
    json: Type.JSON
};

module.exports = {
    Type,
    sourceExtensions
};