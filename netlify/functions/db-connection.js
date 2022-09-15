
const { MongoClient } = require('mongodb');

let cachedDb = null;


const connectToDatabase = async () => {

  if (cachedDb) {
    return cachedDb;
  }

  const client = await MongoClient.connect(process.env.DATABASE_URL);
  cachedDb = client.db(process.env.DATABASE_NAME);
  return cachedDb;

};

module.exports = { connectToDatabase };
