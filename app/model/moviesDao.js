const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;
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

function savePlaySource(movieId, playSource, callback) {
  playSource.forEach(it => {
    it._doc_name = '_play_source';
  });
  connectDb((client, collection) => {
    collection.updateOne({_id: movieId}, {$set: playSource})
    // collection.insertMany(playSource, (err, res) => {
    //   if (err) {
    //     utils.errorCallback(callback, err);
    //   } else {
    //     collection.updateOne({_id: movieId}, {$push: {play_source_ids: res.insertedIds}});
    //     utils.successCallback(callback, res);
    //   }
    //   client.close();
    // })
  })
}

function updatePlaySource(url, playUrl, callback) {
  connectDb((client, collection) => {
    collection.updateOne({"playUrls.url": url}, {$set: {"playUrls.$.source": playUrl}}, (err, res) => {
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
  MongoClient.connect(dbUrl, function (err, client) {
    if (err) throw err;
    const db = client.db('test');
    const collection = db.collection('movies');
    opt(client, collection)
  })
}

function findPlaySourceById(movieId, callback) {
  connectDb((client, collection) => {
    collection.find({_doc_name: '_play_source', '_id': new ObjectID(movieId)}, {
      from: true,
      playUrls: true
    }).toArray((err, res) => {
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
    collection.find({playUrls: {$elemMatch: {url: playSourceUrl}}}, {'playUrls.$': 2}).toArray((err, res) => {
      if (err) {
        utils.errorCallback(callback, err)
      } else {
        utils.successCallback(callback, res)
      }
      client.close();
    })
  })
}

module.exports = {
  saveMovies: saveMovies,
  savePlaySource: savePlaySource,
  updatePlaySource: updatePlaySource,
  findPlaySourceById: findPlaySourceById,
  findPlaySourceUrl: findPlaySourceUrl
};

