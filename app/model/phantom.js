var webpage = require('webpage');
var page = webpage.create();
var system = require('system');
var currentIFrame = 0;
console.log('test log');
page.onLoadFinished = function (status) {
  console.log(currentIFrame);
  if (currentIFrame === 0) {
    page.switchToFrame(0);
    currentIFrame = 1;
  } else if (currentIFrame === 1) {
    page.switchToChildFrame(1);
    currentIFrame = 2;
  } else {
    setTimeout(function () {
      const videoSrc = page.evaluate(function () {
        const videos = document.getElementsByTagName('video');
        return videos !== null && videos.length > 0 ? videos[0].getAttribute('src') : '+purl+'
      });
      const res = {
        from: system.args[1]
      };
      console.log('video src ' + videoSrc);
      if (videoSrc.indexOf('purl') >= 0) {
        page.onConsoleMessage = function (data) {
          res.result = data;
          console.log(JSON.stringify(res));
        };
        page.evaluateJavaScript("function(){if (purl) {console.log(purl) } else {console.log('') }}")
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
  console.log(status);
  if (status !== 'success') {
    page.close();
    phantom.exit();
  }
});
