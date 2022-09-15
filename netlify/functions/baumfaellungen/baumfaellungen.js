
const moment = require('moment');
const { connectToDatabase } = require('../db-connection');


const handler = async (event, context) => {

  // otherwise the connection will never complete, since
  // we keep the DB connection alive
  context.callbackWaitsForEmptyEventLoop = false;

  try {

    const db = await connectToDatabase();

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
