
/**
 * 
 * @param {Map} map 
 */
function map_to_string(map) {
  let str = '';
  for (const [key, value] of map.entries()) {
    str += `${key} => ${value}`;
  }
  return str;
}

/**
 * 
 * @param {String || any} features 
 */
function parseWebPreferencesFeaturesString(features) {
  let webPreferences = {};

  parseFeaturesString(features, function (key, value) {
    if (value === undefined) {
      value = true;
    }
    webPreferences[key] = value;
  });

  return webPreferences;
}

/**
 * 
 * @param {String || any} features 
 * @param {String || any} emit 
 */
function parseFeaturesString(features, emit) {
  features = `${features}`;
  features.split(/,\s*/).forEach(feature => {
    let [key, value] = feature.split(/\s*=/);
    if (!key) return;

    value = value === 'yes' || value === '1' || value === 'true' ? true : value === 'no' || value === '0' || value === 'false' ? false : value;
    emit(key, value);
  });
}

module.exports = {
  map_to_string,
  parseWebPreferencesFeaturesString,
  parseFeaturesString
};
//# sourceMappingURL=map.js.map