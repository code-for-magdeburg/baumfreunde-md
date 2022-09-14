
const { MongoClient } = require('mongodb');

const mongoClient = new MongoClient(process.env.DATABASE_URL);
const clientPromise = mongoClient.connect();


const handler = async (event) => {

  try {

    const db = (await clientPromise).db(process.env.DATABASE_NAME);

    const pflanzstandorte = await db.collection('pflanzstandorte').find({ removed: false }).toArray();

    return { statusCode: 200, body: JSON.stringify(pflanzstandorte) };

  }  catch (error) {
    return { statusCode: 500, body: error.toString() };
  }

}

module.exports = { handler }
