module.exports = {
  dbUrl: process.env.MONGODB_URL,
  secrets: {
    jwt: process.env.JWT_SECRET,
    jwtExpires: '10 days'
  }
};
