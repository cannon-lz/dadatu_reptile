const MongoClient = require('mongodb').MongoClient;
const utils = require('../lib/utils');
const dbUrl = 'mongodb://localhost:27017/movies';

function saveMovies(movies, callback) {
  movies.forEach(it => {
    it._id = it.href;
  });
  connectDb(function (client, collection) {
    collection.insertMany(movies, function (err, res) {
      if (err) {
        utils.errorCallback(callback, err);
      } else {
        utils.successCallback(callback, res);
      }
      client.close();
    });
  });
}

function saveMoviesAwait(movies) {
  return new Promise((resolve, reject) => {
    saveMovies(movies, {
      success: resolve,
      error: reject
    })
  })
}

function savePlaySource(movieId, playSource, callback) {
  connectDb((client, collection) => {
    collection.updateOne({
      _id: movieId
    }, {
      $set: playSource
    }, (err, res) => {
      if (err) {
        utils.errorCallback(callback, err);
      } else {
        utils.successCallback(callback, res);
      }
      client.close();
    })
  })
}

function savePlaySourceAwait(movieId, playSource) {
  return new Promise((resolve, reject) => {
    savePlaySource(movieId, playSource, {
      success: resolve,
      error: reject
    })
  })
}

function addRealPlayUrl(url, playUrl, callback) {
  connectDb((client, collection) => {
    collection.updateOne({
        "play_source.playUrls.url": url
      }, {
        $set: {
          "play_source.$[].playUrls.$[urlIt].real_url": playUrl
        }
      }, {
        arrayFilters: [{
          "urlIt.url": url
        }]
      },
      (err, res) => {
        if (err) {
          utils.errorCallback(callback, err);
        } else {
          utils.successCallback(callback, res);
        }
        client.close();
      })
  })

}

function addRealPlayUrlAwait(url, playUrl) {
  return new Promise((resolve, reject) => {
    addRealPlayUrl(url, playUrl, {
      success: resolve,
      error: reject
    })
  })
}

function connectDb(opt) {
  MongoClient.connect(dbUrl, function (err, client) {
    if (err) throw err;
    const db = client.db('test');
    const collection = db.collection('movies');
    opt(client, collection)
  })
}

function connectionAwait() {
  return new Promise((resolve, reject) => {
    MongoClient.connect(dbUrl, function (err, client) {
      if (err) return reject(err);
      const db = client.db('test');
      const collection = db.collection('movies');
      return resolve({db: db, collection: collection})
    })
  })
}

function findMovieById(id, callback) {
  connectDb((client, collection) => {
    collection.findOne({
      _id: id
    }, (err, res) => {
      if (err) {
        utils.errorCallback(callback, error)
      } else {
        utils.successCallback(callback, res)
      }
      client.close();
    })
  })
}

function findMovieByIdAwait(id) {
  return new Promise((resolve, reject) => {
    findMovieById(id, {
      success: resolve,
      error: reject
    })
  })
}

function findPlaySourceUrl(playSourceUrl, callback) {
  connectDb((client, collection) => {
    collection.find({
      playUrls: {
        $elemMatch: {
          url: playSourceUrl
        }
      }
    }, {
      'playUrls.$': 2
    }).toArray((err, res) => {
      if (err) {
        utils.errorCallback(callback, err)
      } else {
        utils.successCallback(callback, res)
      }
      client.close();
    })
  })
}

function findPlaySourceUrlAwait(playSourceUrl) {
  return new Promise((resolve, reject) => {
    findPlaySourceUrl(playSourceUrl,  {
      success: resolve,
      error: reject
    })
  })
}

function findRealPlayUrl(playUrl, callback) {
  connectDb((client, collection) => {
    collection.find({ 'play_source.playUrls.url': playUrl }).forEach((doc) => {
      doc.play_source = doc.play_source.filter((playSource) => {
        playSource.playUrls = playSource.playUrls.filter((url) => {
          return url.url === playUrl;
        });
        return playSource.playUrls.length != 0;
      });
      if (!doc.play_source || doc.play_source.length <= 0) {
        utils.successCallback(callback, null);
        return
      }
      if (!doc.play_source[0] || doc.play_source[0].playUrls.length <= 0) {
        utils.successCallback(callback, null);
        return
      }
      if (!doc.play_source[0].playUrls && doc.play_source[0].playUrls.length <= 0) {
        utils.successCallback(callback, null);
        return
      }
      if (!doc.play_source[0].playUrls[0].real_url) {
        utils.successCallback(callback, null);
        return
      }

      utils.successCallback(callback, {
        result: doc.play_source[0].playUrls[0].real_url
      });

    })
  });
}

function findRealPlayUrlAwait(playUrl) {
  return new Promise((resolve, reject) => {
    findRealPlayUrl(playUrl, {
      success: resolve,
      error: reject
    })
  })
}

function findAll(callback) {
  connectDb((client, collection) => {
    collection.find().toArray((err, res) => {
      if (err) {
        utils.errorCallback(callback, err);
      } else {
        utils.successCallback(callback, res);
      }
      client.close();
    })
  })
}

async function findAllAwait() {
  const config = await connectionAwait();
  return new Promise((resolve, reject) => {
    config.collection.find().toArray((err, res) => {
      if (err) {
        return reject(err)
      } else {
        return resolve(res)
      }
      config.client.close();
    })
  })
}

module.exports = {
  saveMovies: saveMovies,
  savePlaySource: savePlaySource,
  addRealPlayUrl: addRealPlayUrl,
  findMovieById: findMovieById,
  findPlaySourceUrl: findPlaySourceUrl,
  findRealPlayUrl: findRealPlayUrl,
  findAll: findAll,
  findAllAwait: findAllAwait,
  findRealPlayUrlAwait: findRealPlayUrlAwait,
  findPlaySourceUrlAwait: findPlaySourceUrlAwait,
  findMovieByIdAwait: findMovieByIdAwait,
  addRealPlayUrlAwait: addRealPlayUrlAwait,
  saveMoviesAwait: saveMoviesAwait,
  savePlaySourceAwait: savePlaySourceAwait
};
