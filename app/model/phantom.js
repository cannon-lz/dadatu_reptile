const webpage = require('webpage');
const page = webpage.create();
const system = require('system');
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
      const videoSrc = page.evaluate(function() {
        const videos = document.getElementsByTagName('video')
        return videos !== null && videos.length > 0 ? videos[0].getAttribute('src') : '+purl+'
      });
      if (videoSrc.indexOf('purl') >= 0) {
        page.onConsoleMessage = function (data) {
          console.log(JSON.stringify({result: data}));
        };
        page.evaluateJavaScript('function(){console.log(purl)}')
      } else {
        console.log(JSON.stringify({result: videoSrc}));
      }

      page.close();
      phantom.exit();
   }, 500);
  }
};
page.open(system.args[1], function (status) {
  if (status !== 'success') {
    page.close();
    phantom.exit();
  }
});
