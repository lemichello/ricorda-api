import express from 'express';
import logger from './helpers/loggingHelper';

async function startServer() {
  var app = express();

  await require('./loaders').default(app);

  let port = process.env.PORT || '3000';

  app.listen(port, (err) => {
    if (err) {
      logger.error(`Can't start server : `, err);
    }

    console.info(`Server is listening on port : ${port}`);
  });
}

startServer();
