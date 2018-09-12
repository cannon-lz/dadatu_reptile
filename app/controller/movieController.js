const moviesModel = require('../model/movies');
const urlParser = require('url');

function MovieController() {

  let count = 0;
  let totalCount = 0;
  let keyWorld = '';

  this.search = function (req, resp) {
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

    moviesModel.findByKeyword(query.sw, query.page, {
      success: function (data) {
        keyWorld = query.sw;
        if (totalCount <= 0) {
          totalCount = data.totalCount;
        }
        console.log('/search', `搜索到与 '${query.sw}' 相关的 '${totalCount}' 条结果`);
        resp.writeHead(200, {'Content-type' : 'text/json; charset=utf-8'});
        resp.write(JSON.stringify(data));
        resp.end();
      }
    })
  };

  this.video = function (req, resp) {
    moviesModel.findByUrl(urlParser.parse(req.url, true).query.url, {
      success: function (data) {
        resp.writeHead(200, {'Content-type' : 'text/json; charset=utf-8'});
        resp.write(JSON.stringify(data));
        resp.end();
      }
    })
  };

  this.play = function (req, resp) {
    moviesModel.queryVideoSource(urlParser.parse(req.url, true).query.url, {
      success: function (data) {
        resp.writeHead(200, {'Content-type' : 'text/json; charset=utf-8'});
        resp.write(data);
        resp.end();
      }
    })
  }
}


module.exports = MovieController;
