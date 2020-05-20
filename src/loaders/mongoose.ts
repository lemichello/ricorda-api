import mongoose from 'mongoose';
import options from '../config/index';

export default async function (url = options.dbUrl, opts = {}) {
  await mongoose.connect(url, {
    ...opts,
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  });
}
