const MongoClient = require('mongodb').MongoClient;
const utils = require('../lib/utils');
const dbUrl = 'mongodb://localhost:27017/movies';

function findAll(callback) {
  connectDb(function (client, collection) {
    collection.find({}).toArray(function (err, res) {
      if (err) {
        utils.errorCallback(callback, err)
      } else {
        utils.successCallback(callback, res);
      }
      client.close();
    })
  })
}

function findByDocname(docname, callback) {
  connectDb((client, collection) => {
    collection.find({_doc_name: docname}).toArray((err, res) => {
      if (err) {
        utils.errorCallback(callback, err)
      } else {
        utils.successCallback(callback, res);
      }
      client.close();
    })
  })
}

function saveMovies(movies, callback) {
  movies.forEach(it => {
    it._id = it.href;
    it._doc_name = '_movie'
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
    it._movie_id = movieId;
  });
  connectDb((client, collection) => {
    collection.insertMany(playSource, (err, res) => {
      if (err) {
        utils.errorCallback(callback, err);
      } else {
        utils.successCallback(callback, res);
      }
      client.close();
    })
  })
}

function saveOnePlaySource(movieId, plausource, callback) {
  connectDb((client, collection) => {
    plausource._movie_id = movieId;
    plausource._doc_name = '_play_source';
    collection.insert(plausource, (err, res) => {
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

module.exports = {
  findAll: findAll,
  findByDocname: findByDocname,
  saveMovies: saveMovies,
  savePlaySource: savePlaySource,
  saveOnePlaySource: saveOnePlaySource
};

