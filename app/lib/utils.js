function deWeighting(array, props) {
  const res = {};
  const resultArray = [];
  array.forEach((it, index, array) => {
    res[it[props]] = it;
  });
  Object.keys(res).forEach((it, index, array) => {
    resultArray.push(res[it])
  });
  return resultArray;
}

function successCallback(callback, obj) {
  if (callback && typeof callback['success'] === 'function') {
    callback.success(obj)
  }
}

function errorCallback(callback, error) {
  if (callback && typeof callback['error'] === 'function') {
    callback.error(error)
  }
}

module.exports = {
  deWeighting: deWeighting,
  successCallback: successCallback,
  errorCallback: errorCallback
};
