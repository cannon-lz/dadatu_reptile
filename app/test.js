const url = require('url');
const dao = require('./model/moviesDao');
const reptile = require('./model/moviesReptile');

async function test() {
  return new Promise((resolve, reject) => {
    resolve(url.parse("https://www.dadatu.com/xj/wobushiyaoshen/play-0-0.html"));
  });

}

async function doIt() {
  //const result = await dao.findAllAwait();
  console.log(await test());
}

doIt();
console.log("block");




