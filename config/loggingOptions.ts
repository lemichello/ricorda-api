interface IOptions {
  hostname: string;
  app: string;
}

const options: IOptions = {
  hostname: process.env.HOST_NAME || 'localhost',
  app: 'Ricorda',
};

export default options;
