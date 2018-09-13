const reptile = require('./moviesReptile');
const dao = require('./moviesDao');
const utils = require('../lib/utils');

exports.findAll = function () {

};

exports.findByKeyword = function (keyword, page, callback) {

  const c = {
    success: function (res) {
      utils.successCallback(callback, res);
      dao.saveMovies(res)
    },
    error: function (err) {

    }
  };

  reptile.search(keyword, page, c);
};

exports.findByUrl = function (url, callback) {
  reptile.parseVideoInfo(url, callback)
};

exports.queryVideoSource = function (url, callback) {
  reptile.parseVideoPlayInfo(url, callback);
};
