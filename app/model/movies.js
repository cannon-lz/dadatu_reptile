const reptile = require('./moviesReptile');
const dao = require('./moviesDao');
const utils = require('../lib/utils');
const urlParser = require('url');

exports.findAll = function(callback) {
  dao.findAll(callback)
};

exports.findByKeyword = function(keyword, page, callback) {
  reptile.search(keyword, page, {
    success: function(res) {
      utils.successCallback(callback, res);
      dao.saveMovies(res)
    }
  });
};

exports.findById = function(url, callback) {
  dao.findMovieById(url, {
    success: function(res) {
      if (res.play_source) {
        utils.successCallback(callback, res)
      } else {
        reptile.parseVideoInfo(url, {
          success: function(res) {
            utils.successCallback(callback, res);
            dao.savePlaySource(url, {
              play_source: res.playSource,
              desc: res.desc
            })
          }
        })
      }
    }
  })

};

exports.queryVideoSource = function(url, callback) {
  dao.findRealPlayUrl(url, {
    success: function(res) {
      if (res) {
        utils.successCallback(callback, JSON.stringify(res));
      } else {
        parseVideoPlayInfo(url, callback);
      }
    },
    error: function(err) {
      parseVideoPlayInfo(url, callback);
    }
  })
};

function parseVideoPlayInfo(url, callback) {
  reptile.parseVideoPlayInfo(url, {
    success: function(data) {
      utils.successCallback(callback, data);
      data = JSON.parse(data);
      dao.addRealPlayUrl(url, data.result);
    },
    error: function(err) {
      utils.errorCallback(callback, err)
    }
  });
}
