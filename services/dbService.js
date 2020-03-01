let mongoose = require('mongoose');
let options = require('../config/index');

module.exports = function(url = options.dbUrl, opts = {}) {
  mongoose.connect(url, {
    ...opts,
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
};
