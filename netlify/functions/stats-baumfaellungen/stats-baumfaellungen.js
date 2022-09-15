
const moment = require('moment');
const { connectToDatabase } = require('../db-connection');


const handler = async (event, context) => {

  // otherwise the connection will never complete, since
  // we keep the DB connection alive
  context.callbackWaitsForEmptyEventLoop = false;

  try {

    const db = await connectToDatabase();

    const { year } = event.queryStringParameters;

    const aggregates = [
      { $match: !!year ? { addedDate: { $gte: moment.utc(`${year}-01-01`).toDate(), $lt: moment.utc(`${year}-01-01`).add(1, 'year').toDate() }} : {}}
    ];

    if (event.queryStringParameters['include-months'] === '1') {

      aggregates.push({
          $group : {
            _id: { year: { $year: '$addedDate' }, month: { $month: '$addedDate' }},
            total: { $sum: '$numberOfTrees' }
          }
        },
      );

      aggregates.push({
          $group : {
            _id : '$_id.year',
            total: { $sum: '$total' },
            months: {
              $push: {
                month: '$_id.month',
                total: { $sum: '$total' }
              }
            }
          }
        }
      );

    } else {

      aggregates.push({
          $group : {
            _id: { $year: '$addedDate' },
            total: { $sum: '$numberOfTrees' }
          }
        }
      );

    }

    const stats = await db.collection('baumfaellungen').aggregate(aggregates).toArray();

    return { statusCode: 200, body: JSON.stringify(stats) };

  }  catch (error) {
    return { statusCode: 500, body: error.toString() };
  }

}

module.exports = { handler }
