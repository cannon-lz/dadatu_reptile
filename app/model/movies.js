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
      dao.savePlaySource(url, res.playSource)
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
  dao.findPlaySourceUrl(url, {
    success: res => {
      if (res) {
        utils.successCallback(callback, {from: url, result: res.playUrls[0].url})
      } else {
        reptile.parseVideoPlayInfo(url, {
          success: res => {
            utils.successCallback(callback, res);
            const data = JSON.parse(res);
            dao.updatePlaySource(url, data.result)
          }
        });
      }
    }
  });
};
