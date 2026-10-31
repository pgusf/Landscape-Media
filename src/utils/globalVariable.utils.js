const globalVariables = {};

function setGlobalVariable(key, value) {
    globalVariables[key] = value;
}

function getGlobalVariable(key) {
    return globalVariables[key];
}

module.exports = {
    setGlobalVariable,
    getGlobalVariable,
};