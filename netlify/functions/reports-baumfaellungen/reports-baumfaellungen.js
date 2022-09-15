
const ObjectId = require('mongodb').ObjectId;
const moment = require('moment');
const { connectToDatabase } = require('../db-connection');


const handler = async (event, context) => {

  // otherwise the connection will never complete, since
  // we keep the DB connection alive
  context.callbackWaitsForEmptyEventLoop = false;

  try {

    const db = await connectToDatabase();

    const { reportId } = event.queryStringParameters;
    if (reportId) {

      const report = await db.collection('report-baumfaellungen').findOne({ _id: ObjectId(reportId) });

      return { statusCode: 200, body: JSON.stringify(report) };

    } else {

      const year = event.queryStringParameters.year || moment().format('YYYY');
      const reports = await db
        .collection('report-baumfaellungen')
        .find({ reportedDate: { $gte: moment.utc(`${year}-01-01`).toDate(), $lt: moment.utc(`${year}-01-01`).add(1, 'year').toDate() }})
        .toArray();

      return { statusCode: 200, body: JSON.stringify(reports) };

    }

  }  catch (error) {
    return { statusCode: 500, body: error.toString() };
  }

}

module.exports = { handler }
