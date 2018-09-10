const http = require('http');
const url = require('url');
const urlencode = require('urlencode');
const request = require('superagent');
const cheerio = require('cheerio');

const apiMap = new Map();

http.createServer((req, resp) => {
  const u = url.parse(req.url, true);
  const handler = apiMap.get(u.pathname);
  if (handler !== null && handler instanceof Function) {
    handler.call(null, u, req, resp);
  } else {
    resp.writeHead(404, {
      'Content-type': 'text/json; charset=utf-8'
    });
    resp.write('{"message":"不支持的api"}');
    resp.end();
  }
}).listen(9980);
console.log('Server running at http://localhost:9980/');

apiMap.set("/index", function(url, req, resp) {
  resp.writeHead(200, {
    'Content-type': 'text/html; charset=utf-8'
  });
  resp.write(
    `<form action="/search" method="get">
        <input style="width: 100%; height: 8%" type="text" placeholder="搜索电影" name="sw"><br>

        <input style="width: 30%; height: 12%; margin: 8% 30%" type="submit" value="SEARCH" >

      </form>
      `
  );
  resp.end();
});

apiMap.set("/search", function(url, req, resp) {
  resp.writeHead(200, {
    'Content-type': 'text/json; charset=utf-8'
  });
  search(url, function(res) {
    resp.write(res);
    resp.end();
  })
});

apiMap.set('/video', function(url, req, resp) {
  const query = url.query;
  console.log(query);
  request.get(query.url).end(function(err, result) {
    resp.writeHead(200, {
      'Content-type': 'text/json; charset=utf-8'
    });
    const $ = cheerio.load(result.text);
    const playlist = $('#playlist');
    const movieName = $('.container .row .hy-main-content .hy-video-details .item dl dd .head h3');
    const movieImage = $('.container .row .hy-main-content .hy-video-details .item dl dt a');
    const ret = new Movie([], movieName.text(), extractImageByBackground(movieImage));
    playlist.children().each(function(index) {
      const atag = $(this).children('a');
      const source = new MovieSource(atag.text().replace(' 无需安装任何插件，即可在线播放 ', ''), []);
      const liSelector = `#playlist${index + 1}`;
      $(this).children(liSelector).children('ul').children('li').each(function() {
        console.log($(this).toString() + '<br>');
        const aSourceTag = $(this).children('a');
        source.playUrls.push(new PlaySource(aSourceTag.attr('title'), `https://www.dadatu.com${aSourceTag.attr('href')}`))
      });
      ret.playSource.push(source);
    });
    resp.write(JSON.stringify(ret));
    resp.end();
  });
});
const phantomjs = require('phantomjs');
const binPath = phantomjs.path;
const path = require('path');
const childProcess = require('child_process');

apiMap.set('/play', function(url, req, resp) {
  const query = url.query;
  const childArgs = [
    path.join(__dirname, 'index.js'),
    query.url
  ];
  const workerProcess = childProcess.execFile(binPath, childArgs, function(err, stdout, stderr) {
    if (err) {
      console.error("ServerError", err);
      resp.write('{}');
      resp.end();
    }
  });
  let result = '{}';
  workerProcess.stdout.on('data', function(data) {
    console.log('Server', data.toString());
    result = data;
  });

  workerProcess.on('exit', function(code) {
    resp.writeHead(200, {
      'Content-type': 'text/json; charset=utf-8'
    });
    resp.write(result);
    resp.end();
  })
});

let count = 0;
let totalCount = 0;
let keyWorld = '';

function search(url, callback) {
  const ret = [];
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

  request
    .get('https://www.dadatu.com/search.php')
    .set({
      'Content-type': 'application/x-www-form-urlencoded; charset=utf-8'
    })
    .query('searchword=' + urlencode(query.sw))
    .query('page=' + query.page)
    .end(function(err, result) {
      keyWorld = query.sw;
      const $ = cheerio.load(result.text);
      const images = $('.container .row .hy-layout .hy-video-details .item dl dt a');
      const titles = $('.container .row .hy-layout .hy-video-details .item dl dd .head h3');
      const descList = $('.container .row .hy-layout .hy-video-details .item dl dd ul');
      if (totalCount <= 0) {
        const resultCount = $('.container .row .hy-video-head h4 span:last-child').text();
        totalCount = resultCount.replace(/[^0-9]/g, '');
        count = images.length;
      }
      console.log(`搜索到与 '${url.query.sw}' 相关的 '${totalCount}' 条结果`);
      console.log(`每页显示 '${count}' 条`);
      images.each(function() {
        const url = extractImageByBackground($(this));
        const href = `https://www.dadatu.com${$(this).attr('href')}`;
        ret.push({
          img: url,
          href: href
        })
      });
      titles.each(function(index) {
        ret[index].title = $(this).text();
      });
      descList.each(function(index) {
        const desc = {};
        $(this).children().each(function() {
          const muted = $(this).children('span.text-muted').text();
          const value = $(this).text();
          desc[muted] = value.replace(muted, '');
        });
        ret[index].desc = desc;
      });
      callback(JSON.stringify(ret));
    });
}

function extractImageByBackground(ele, styleName = 'background') {
  return ele.css(styleName).replace('url(', '').replace(')', '').replace('no-repeat', '')
}

function Movie(playSource, name, image) {
  this.playSource = playSource;
  this.name = name;
  this.image = image;
}

function MovieSource(from, playUrls) {
  this.from = from;
  this.playUrls = playUrls;
}

function PlaySource(title, url) {
  this.title = title;
  this.url = url;
}
