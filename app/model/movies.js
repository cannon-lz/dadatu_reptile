const reptile = require('./moviesReptile');

exports.findAll = function() {

};

exports.findByKeyword = function(keyword, page, callback) {
  reptile.search(keyword, page, callback);
};

exports.findByUrl = function (url, callback) {
  reptile.parseVideoInfo(url, callback)
};

exports.queryVideoSource = function (url, callback) {
  reptile.parseVideoPlayInfo(url, callback);
};
