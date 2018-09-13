const utils = require('./lib/utils');
const dao = require('./model/moviesDao');
function success(data) {
  const res = utils.deWeighting(data, 'href');
  console.log(res);
}
dao.findAll({
  success: success
});



