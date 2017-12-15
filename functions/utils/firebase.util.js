function clean({ ...obj }, {removeFunctions, removeEmptyObjects, removeEmptyStrings} = {}) {
  var scrub = function(objA) {
    var keys = Object.keys(objA),
      i = keys.length;

    while (i--) {
      let value = objA[keys[i]];
      if (value == null || typeof value == 'undefined') {
        delete objA[keys[i]];
      } else if (removeFunctions && typeof value == 'function') {
        delete objA[keys[i]];
      } else if (removeEmptyStrings && value == '') {
        delete objA[keys[i]];
      } else if (
        removeEmptyObjects &&
        typeof value == 'object' &&
        Object.keys(value).length == 0
      ) {
        delete objA[keys[i]];
      } else if (typeof value == 'object') {
        scrub(value);
      }
    }
  };

  scrub(obj);

  return obj;
}

module.exports = {
  clean,
};
