const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;
const utils = require('../lib/utils');
const dbUrl = 'mongodb://localhost:27017/movies';

function saveMovies(movies, callback) {
  movies.forEach(it => {
    it._id = it.href;
  });
  connectDb(function(client, collection) {
    collection.insertMany(movies, function(err, res) {
      if (err) {
        utils.errorCallback(callback, err);
      } else {
        utils.successCallback(callback, res);
      }
      client.close();
    });
  });
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

function connectDb(opt) {
  MongoClient.connect(dbUrl, function(err, client) {
    if (err) throw err;
    const db = client.db('test');
    const collection = db.collection('movies');
    opt(client, collection)
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

function findRealPlayUrl(playUrl, callback) {
  connectDb((client, collection) => {
    collection.find({
      'play_source.playUrls.url': playUrl
    }).forEach((doc) => {
      doc.play_source = doc.play_source.filter((playSource) => {
        playSource.playUrls = playSource.playUrls.filter((url) => {
          return url.url === playUrl;
        });
        return playSource.playUrls.length != 0;
      });
      //console.log(doc);
      if (!doc.play_source || doc.play_source.length <= 0) {
        utils.successCallback(callback, null);
        return
      }
      if (!doc.play_source[0] || doc.play_source[0].playUrls.length <= 0) {
        utils.successCallback(callback, null);
        return
      }
      if (!doc.play_source[0].playUrls && doc.play_source[0].playUrls.length <= 0) {
        utils.successCallback(callback, null)
        return
      }
      if (!doc.play_source[0].playUrls[0].real_url) {
        utils.successCallback(callback, null)
        return
      }

      utils.successCallback(callback, {
        result: doc.play_source[0].playUrls[0].real_url
      });

    })
  });
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

module.exports = {
  saveMovies: saveMovies,
  savePlaySource: savePlaySource,
  addRealPlayUrl: addRealPlayUrl,
  findMovieById: findMovieById,
  findPlaySourceUrl: findPlaySourceUrl,
  findRealPlayUrl: findRealPlayUrl,
  findAll: findAll
};

// findRealPlayUrl('https://www.dadatu.com/xj/tangrenjietanan2/play-1-1.html', {
//   success: (res) => {
//     console.log(res);
//     console.log(res.play_source[0].playUrls.length);
//     console.log(res.play_source[0].playUrls);
//   }
// });

// addRealPlayUrl('playUrl', 'https://www.dadatu.com/xj/wobushiyaoshen/play-0-0.html', {
//   success: (res) => {
//     console
//       .log(res)
//   },
//   error: (err) => {
//     console.log(err)
//   }
// });
