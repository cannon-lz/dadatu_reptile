const http = require('http');
const urlParser = require('url');
const fs = require('fs');
const config = require('../../config');
const mime = require('./mime');

const GET = new Map();
const POST = new Map();
var ERROR_HANDLER_G = null;
const ERROR_HANDLER = new Map();
const APIS = new Map([['GET', GET], ['POST', POST]]);

var STATIC_DIR = '/public';

module.exports = function App() {

  this.staticDir = function (dirname) {
    STATIC_DIR = dirname;
  };

  this.error = function (handle) {
    ERROR_HANDLER_G = handle;
  };

  this.error = function (route, handler) {
    ERROR_HANDLER.set(route, handler);
  };

  this.get = function (route, handler) {
    GET.set(route, handler);
  };

  this.post = function (route, handler) {
    POST.set(route, handler);
  };

  this.listen = function (port) {
    http.createServer(function (req, resp) {
      const url = urlParser.parse(req.url);
      const apis = APIS.get(req.method);
      const apiHandler = apis.get(url.pathname);
      if (apiHandler !== null && typeof apiHandler === 'function') {
        apiHandler.call(null, req, resp)
      } else {
        const errorHandler = ERROR_HANDLER.get(url.pathname);
        if (errorHandler != null && typeof  errorHandler === 'function') {
          errorHandler.call(null, new Error('404'), req, resp)
        } else if (ERROR_HANDLER_G != null) {
          ERROR_HANDLER_G.call(null, new Error('404'), req, resp)
        } else {
          handleStaticFile(req, resp);
        }
      }
    }).listen(port)
  };

  function handleStaticFile(req, resp) {
    const url = urlParser.parse(req.url);
    const absolutePath = config.root + STATIC_DIR + url.pathname;
    console.log(absolutePath);
    fs.stat(absolutePath, function (err, stats) {
      if (stats && stats.isFile()) {
        const readStream = fs.createReadStream(absolutePath);
        const type = mime.getMimeType(absolutePath);
        resp.writeHead(200, {'Content-type': type});
        readStream.pipe(resp);
      } else {
        resp.writeHead(404);
        resp.end();
      }
    })
  }
};


