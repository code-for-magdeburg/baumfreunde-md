
const _ = require('lodash');
const moment = require('moment');

const nachpflanzungen = require('../data/nachpflanzungen.json');


const handler = async (event) => {

  const year = event.queryStringParameters.year || moment().format('YYYY');

  return { statusCode: 200, body: JSON.stringify(nachpflanzungen[`Nachpflanzungen${year}`]) };

}

module.exports = { handler }
