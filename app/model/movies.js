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

exports.findById = function (url, callback) {
  reptile.parseVideoInfo(url, {
    success: function(res) {
      utils.successCallback(callback, res);
      //dao.savePlaySource(url, res.playSource)
      for (let i = 0; i < res.playSource.length; i++) {
        const it = res.playSource[i];
        const urls = it.playUrls;
        for (let j = 0; j < urls.length; j++) {
          reptile.parseVideoPlayInfo(urls[j].url, {
            success: res => {
              const data = JSON.parse(res);
              if (data.from === urls[j].url) {
                it.play_url = data.result;
                dao.saveOnePlaySource(url, it)
              }
            }
          });
        }
      }
    }
  })
};

exports.queryVideoSource = function (url, callback) {
  reptile.parseVideoPlayInfo(url, callback);
};
