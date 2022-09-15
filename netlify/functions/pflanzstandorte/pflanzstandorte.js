
const { connectToDatabase } = require('../db-connection');


const handler = async (event, context) => {

  // otherwise the connection will never complete, since
  // we keep the DB connection alive
  context.callbackWaitsForEmptyEventLoop = false;

  try {

    const db = await connectToDatabase();

    const pflanzstandorte = await db.collection('pflanzstandorte').find({ removed: false }).toArray();

    return { statusCode: 200, body: JSON.stringify(pflanzstandorte) };

  }  catch (error) {
    return { statusCode: 500, body: error.toString() };
  }

}

module.exports = { handler }
