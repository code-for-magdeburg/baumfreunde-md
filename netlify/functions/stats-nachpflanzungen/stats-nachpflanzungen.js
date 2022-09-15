
const _ = require('lodash');

const nachpflanzungen = require('../data/nachpflanzungen.json');


const handler = async (event) => {

  const summary = [
    { _id: 2014, total: _.sumBy(nachpflanzungen.Nachpflanzungen2014, 'anzahl') },
    { _id: 2015, total: _.sumBy(nachpflanzungen.Nachpflanzungen2015, 'anzahl') },
    { _id: 2016, total: _.sumBy(nachpflanzungen.Nachpflanzungen2016, 'anzahl') },
    { _id: 2017, total: _.sumBy(nachpflanzungen.Nachpflanzungen2017, 'anzahl') },
    { _id: 2018, total: _.sumBy(nachpflanzungen.Nachpflanzungen2018, 'anzahl') },
    { _id: 2019, total: _.sumBy(nachpflanzungen.Nachpflanzungen2019, 'anzahl') },
    { _id: 2020, total: _.sumBy(nachpflanzungen.Nachpflanzungen2020, 'anzahl') },
    { _id: 2021, total: _.sumBy(nachpflanzungen.Nachpflanzungen2021, 'anzahl') }
  ];

  return { statusCode: 200, body: JSON.stringify(summary) };

}

module.exports = { handler }
