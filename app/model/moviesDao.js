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
  saveMovies: saveMovies
};

