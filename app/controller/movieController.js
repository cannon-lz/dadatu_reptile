const moviesModel = require('../model/movies');
const urlParser = require('url');

function MovieController() {

  let count = 0;
  let totalCount = 0;
  let keyWorld = '';

  this.search = async function(req, resp) {
    const url = urlParser.parse(req.url, true);
    const query = url.query;
    console.log(query);
    if (keyWorld !== query.sw) {
      totalCount = 0;
      count = 0;
    }
    if (totalCount > 0 && count > 0) {
      let pageCount = Math.ceil(totalCount / count);
      console.log("pagecount: " + pageCount);
      if (Number.parseInt(query.page) > pageCount) {
        console.log(query.page);
        callback('[]');
        return
      }
    }
    const data = await moviesModel.findByKeyword(query.sw, query.page);
    keyWorld = query.sw;
    if (totalCount <= 0) {
      totalCount = data.totalCount;
    }
    resp.writeHead(200, {
      'Content-type': 'text/json; charset=utf-8'
    });
    resp.write(JSON.stringify(data));
    resp.end();
  };

  this.video = async function(req, resp) {
    const data = await moviesModel.findById(urlParser.parse(req.url, true).query.url);
    resp.writeHead(200, {
      'Content-type': 'text/json; charset=utf-8'
    });
    resp.write(JSON.stringify(data));
    resp.end();
  };

  this.play = async function(req, resp) {
    try {
      const data = await moviesModel.queryVideoSource(urlParser.parse(req.url, true).query.url);
      resp.writeHead(200, {
        'Content-type': 'text/json; charset=utf-8'
      });
      resp.write(JSON.stringify(data));
      resp.end();
    } catch (e) {
      resp.writeHead(404, {
        'Content-type': 'text/json; charset=utf-8'
      });
      resp.write(JSON.stringify(e));
      resp.end();
    }
  };

  this.movies = async function(req, resp) {
    const res = await moviesModel.findAll();
    resp.writeHead(200, {
      'Content-type': 'text/json; charset=utf-8'
    });
    resp.write(JSON.stringify(res));
    resp.end();
  }
}


module.exports = MovieController;
