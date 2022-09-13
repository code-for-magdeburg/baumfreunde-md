
const { MongoClient } = require('mongodb');
const moment = require('moment');

const mongoClient = new MongoClient(process.env.DATABASE_URL);
const clientPromise = mongoClient.connect();


const handler = async (event) => {

  try {

    const db = (await clientPromise).db(process.env.DATABASE_NAME);

    const { year, month } = event.queryStringParameters;
    if (!year) {
      return { statusCode: 400, body: 'Parameter "year" is missing' };
    }

    if (month) {

      const trees = await db
        .collection('baumfaellungen')
        .find({ addedDate: { $gte: moment.utc(`${year}-${month}-01`).toDate(), $lt: moment.utc(`${year}-${month}-01`).add(1, 'month').toDate() }})
        .toArray();

      return { statusCode: 200, body: JSON.stringify(trees) };

    } else {

      const trees = await db
        .collection('baumfaellungen')
        .find({ addedDate: { $gte: moment.utc(`${year}-01-01`).toDate(), $lt: moment.utc(`${year}-01-01`).add(1, 'year').toDate() }})
        .toArray();

      return { statusCode: 200, body: JSON.stringify(trees) };

    }

  }  catch (error) {
    return { statusCode: 500, body: error.toString() };
  }

}

module.exports = { handler }
