const url = require('url');
const dao = require('./model/moviesDao');

async function test() {
  return url.parse("https://www.dadatu.com/xj/wobushiyaoshen/play-0-0.html");
}

async function doIt() {
  const result = await test();
  const s = result.href.substring(0, result.href.indexOf("play-"));
  dao.findPlaySourceById('5ba2211e4ca1992e2008aa9f', {
    success: function (res) {
      console.log(res)
    }
  });
}

doIt();
console.log("block");




