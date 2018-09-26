const reptile = require('./moviesReptile');
const dao = require('./moviesDao');

exports.findAll = async function () {
  return await dao.findAllAwait()
};

exports.findByKeyword = async function (keyword, page) {
  const result = await reptile.searchAwait(keyword, page);
  dao.saveMovies(result);
  return result;
};

exports.findById = async function (url) {
  const result = await dao.findMovieByIdAwait(url);
  if (result.play_source) {
    return result
  }

  const res = await reptile.parseVideoInfoAwait(url);
  dao.savePlaySource(url, {
    play_source: res.playSource,
    desc: res.desc
  });
  return res;
};

exports.queryVideoSource = async function (url) {
  try {
    const res = await dao.findRealPlayUrlAwait(url);
    if (res) {
      return res;
    }
  } catch (e) {
    throw e;
  }
  return await parseVideoPlayInfo(url);
};

async function parseVideoPlayInfo(url) {
  try {
    const res = await reptile.parseVideoPlayInfoAwait(url);
    const data = JSON.parse(res);
    dao.addRealPlayUrl(url, data.result);
    return data;
  } catch (e) {
    throw e;
  }
}
