import mongoose from 'mongoose';
import options from '../config/index';

export default function (url = options.dbUrl, opts = {}) {
  mongoose.connect(url, {
    ...opts,
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  });
}
