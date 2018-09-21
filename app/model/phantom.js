var webpage = require('webpage');
var page = webpage.create();
var system = require('system');
var currentIFrame = 0;
page.onLoadFinished = function (status) {
  if (currentIFrame === 0) {
    page.switchToFrame(0);
    currentIFrame = 1;
  } else if (currentIFrame === 1) {
    page.switchToChildFrame(1);
    currentIFrame = 2;
  } else {
    setTimeout(function () {
      var videoSrc = page.evaluate(function () {
        var videos = document.getElementsByTagName('video');
        return videos !== null && videos.length > 0 ? videos[0].getAttribute('src') : '+purl+'
      });
      var res = {
        from: system.args[1]
      };
      if (videoSrc.indexOf('purl') >= 0) {
        var purl = page.evaluate(function () {
          return purl;
        });
        res.result = purl;
        console.log(JSON.stringify(res));
      } else {
        res.result = videoSrc;
        console.log(JSON.stringify(res));
      }
      page.close();
      phantom.exit();
    }, 1000);
  }
};
page.open(system.args[1], function (status) {
  if (status !== 'success') {
    page.close();
    phantom.exit();
  }
});
