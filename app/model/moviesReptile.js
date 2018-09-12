const request = require('superagent');
const cheerio = require('cheerio');
const urlencode = require('urlencode');

const DADATU_BASE = 'https://www.dadatu.com';
const SEARCH = DADATU_BASE + '/search.php';


exports.search = function(keyword, page, callback) {
  const ret = [];
  request
    .get(SEARCH).set({'Content-type': 'application/x-www-form-urlencoded; charset=utf-8' })
    .query('searchword=' + urlencode(keyword))
    .query('page=' + page)
    .end(function (err, result) {
      const $ = cheerio.load(result.text);
      const images = $('.container .row .hy-layout .hy-video-details .item dl dt a');
      const titles = $('.container .row .hy-layout .hy-video-details .item dl dd .head h3');
      const descList = $('.container .row .hy-layout .hy-video-details .item dl dd ul');

      const resultCount = $('.container .row .hy-video-head h4 span:last-child').text();
      const totalCount = resultCount.replace(/[^0-9]/g, '');

      images.each(function () {
        const url = extractImageByBackground($(this));
        const href = `${DADATU_BASE}${$(this).attr('href')}`;
        ret.push({
          img: url,
          href: href
        })
      });
      titles.each(function (index) {
        ret[index].title = $(this).text();
      });
      descList.each(function (index) {
        const desc = {};
        $(this).children().each(function () {
          const muted = $(this).children('span.text-muted').text();
          const value = $(this).text();
          desc[muted] = value.replace(muted, '');
        });
        ret[index].desc = desc;
      });
      ret.totalCount = totalCount;
      callback.success(ret);
    });
};

exports.parseVideoInfo = function(url, callback) {
  request.get(url).end(function(err, result) {
    const $ = cheerio.load(result.text);
    const playlist = $('#playlist');
    const movieName = $('.container .row .hy-main-content .hy-video-details .item dl dd .head h3');
    const movieImage = $('.container .row .hy-main-content .hy-video-details .item dl dt a');
    const movieDesc = $('.container .row .hy-main-content .hy-video-details .item dl dt a');
    const ret = new Movie([], movieName.text(), extractImageByBackground(movieImage));
    playlist.children().each(function(index) {
      const atag = $(this).children('a');
      const source = new MovieSource(atag.text().replace(' 无需安装任何插件，即可在线播放 ', ''), []);
      const liSelector = `#playlist${index + 1}`;
      $(this).children(liSelector).children('ul').children('li').each(function() {
        const aSourceTag = $(this).children('a');
        source.playUrls.push(new PlaySource(aSourceTag.attr('title'), `${DADATU_BASE}${aSourceTag.attr('href')}`))
      });
      ret.playSource.push(source);
    });
    callback.success(ret);
  });
};

const phantomjs = require('phantomjs');
const binPath = phantomjs.path;
const path = require('path');
const childProcess = require('child_process');

exports.parseVideoPlayInfo = function(url, callback) {
  const childArgs = [
    path.join(__dirname, 'phantom.js'),
    url
  ];
  const workerProcess = childProcess.execFile(binPath, childArgs, function(err, stdout, stderr) {
    if (err) {
      console.error("ServerError", err);
      callback.error(err);
    }
  });
  let result = '{}';
  workerProcess.stdout.on('data', function(data) {
    console.log('Server', data.toString());
    result = data;
  });

  workerProcess.on('exit', function(code) {
    callback.success(result);
  })
};

function Movie(playSource, name, image, desc) {
  this.playSource = playSource;
  this.name = name;
  this.image = image;
  this.desc = desc;
}

function MovieSource(from, playUrls) {
  this.from = from;
  this.playUrls = playUrls;
}

function PlaySource(title, url) {
  this.title = title;
  this.url = url;
}

function extractImageByBackground(ele, styleName = 'background') {
  return ele.css(styleName).replace('url(', '').replace(')', '').replace('no-repeat', '')
}
