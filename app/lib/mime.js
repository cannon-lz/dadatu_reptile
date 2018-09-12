const path = require('path');

const TYPES = {
  "css": "text/css",
  "gif": "image/gif",
  "html": "text/html",
  "ico": "image/x-icon",
  "jpeg": "image/jpeg",
  "txt": "text/plain"
};

exports.getMimeType = function(pathname) {
  let ext = path.extname(pathname);
  ext = ext.split('.').pop();
  return TYPES[ext] || TYPES['txt'];
};
