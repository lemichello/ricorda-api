import express from 'express';

async function startServer() {
  var app = express();

  await require('./loaders').default(app);

  let port = process.env.PORT || '3000';

  app.listen(port, (err) => {
    if (err) {
      console.error(`Can't start server : `, err);
    }

    console.info(`Server is listening on port : ${port}`);
  });
}

startServer();
