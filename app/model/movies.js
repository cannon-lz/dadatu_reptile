const reptile = require('./moviesReptile');
const dao = require('./moviesDao');
const utils = require('../lib/utils');

exports.findAll = function () {

};

exports.findByKeyword = function (keyword, page, callback) {
  reptile.search(keyword, page, {
    success: function (res) {
      utils.successCallback(callback, res);
      dao.saveMovies(res)
    },
    error: function (err) {

    }
  });
};

exports.findById = function (url, callback) {
  reptile.parseVideoInfo(url, {
    success: function (res) {
      utils.successCallback(callback, res);
      dao.savePlaySource(url, {
        play_source: res.playSource,
        desc: res.desc
      })
    }
  })
  // dao.findPlaySourceById(url, {
  //   success: res => {
  //     // if (res && res.length > 0) {
  //     //   utils.successCallback(callback, res)
  //     // } else {
  //     //
  //     // }
  //
  //   }
  // });

};

exports.queryVideoSource = function (url, callback) {
  reptile.parseVideoPlayInfo(url, {
    success: res => {
      utils.successCallback(callback, res);
      const data = JSON.parse(res);
      dao.updatePlaySource(url, data.result)
    }
  });
};
