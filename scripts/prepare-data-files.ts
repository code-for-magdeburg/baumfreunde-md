import * as fs from 'fs';
import { parse, ParseConfig, unparse } from 'papaparse';
const axios = require('axios').default;


const LAT_LON_ACCURACY_FACTOR = 10000000;

const IGNORED_ADDRESS_WORDS = [
  ' (Straßenbegleitgrün)',
  ' (Staßenbegleitgrün)',
  ' (Straßenbegleitgün)',
  ' (Stra0enbegleitgrün)',
  ' (Straßenbegleitgrün) ',
  ' ( Straßenbegleitgrün)',
  ' (Straßenbegleitgrün )',
  ' ( Straßenbegleitgrün )',
  ' (Straßenbegleitgrün PB M)',
  ' (Straßenbegleitgrün SW)',
  ' (FB 23)',
  ' ( FB 23)',
  ' (FB 23 )',
  ' (FB23 )',
  ' (FB23)',
  ' (FB 23 SW)',
  ' ( PPL )',
  ' (PPL )',
  ' ( PPL)',
  ' (PPL)',
  ' (PPL 2)',
  ' (PPL1)',
  '/PPL',
  ' PPL',
  ' FND',
  '(SBG)',
  '/SBG',
  '/LSG',
  '/KGA',
];


type OriginalCsvRecord = {
  gid: number;
  Baumnr: string;
  Gebiet: string;
  Typ: string;
  Gattung: string;
  lfdNr: number;
  Pflanzjahr: number;
  Baumhoehe: number;
  Kronendurc: number;
  Stammumfan: number;
  longitude: number;
  latitude: number;
};

// See http://standards.opencouncildata.org/#/trees
type TargetRecord = {
  internal_ref: number;
  ref: string;
  locationIndex: number;
  addressIndex: number;
  lat: number;
  lon: number;
  genusIndex: number;
  height: number;
  crown: number;
  dbh: number;
  planted: number;
};

type Classification = {
  fullname: string;
  genus: string;
  species: string;
  variety: string;
  common: string;
  scientific: string;
  wikipediaPageUrl: string;
};


// Load and parse original csv data file
const csv = fs.readFileSync('./data/Baumkataster-Magdeburg-2021.csv', 'utf-8');
const parseOptions: ParseConfig = {
  dynamicTyping: true,
  skipEmptyLines: true,
  header: true,
  transform: (value, field) => field === 'Gattung' ? value.replace(';', ',') : value
};
const originalCsvRecords = parse(csv, parseOptions).data as OriginalCsvRecord[];

// Save locations to json file
const locations = [...new Set(originalCsvRecords.map(r => r.Typ))].sort();
const locationsJson = JSON.stringify(locations, null, 2);
fs.writeFileSync('./src/assets/data/Baumkataster-Magdeburg-2021-Typen.json', locationsJson);

// Save addresses to json file
const addresses = [...new Set(originalCsvRecords.map(r => cleanAddress(r.Gebiet)))].sort();
const adressesJson = JSON.stringify(addresses, null, 2);
fs.writeFileSync('./src/assets/data/Baumkataster-Magdeburg-2021-Gebiete.json', adressesJson);

// Save classification to json file
const genii = [...new Set(originalCsvRecords.map(r => r.Gattung))].sort();
const geniiPromises = genii.map(mapToClassification);
Promise.all(geniiPromises)
  .then(classifications => {

    const classificationsJson = JSON.stringify(classifications, null, 2);
    fs.writeFileSync('./src/assets/data/Baumkataster-Magdeburg-2021-Gattungen.json', classificationsJson);

    // Save tree records to csv file
    const targetRecords = originalCsvRecords
      .map(r => mapToStandardTreeRecord(r, classifications))
      .sort((a, b) => a.internal_ref < b.internal_ref ? -1 : 0);
    fs.writeFileSync('./src/assets/data/Baumkataster-Magdeburg-2021.txt', unparse(targetRecords));

  })
  .catch(console.error);


function mapToStandardTreeRecord(original: OriginalCsvRecord, classifications: Classification[]): TargetRecord {
  return {
    internal_ref: original.gid,
    ref: original.Baumnr,
    locationIndex: locations.indexOf(original.Typ),
    addressIndex: addresses.indexOf(cleanAddress(original.Gebiet)),
    lat: Math.trunc(original.latitude * LAT_LON_ACCURACY_FACTOR) / LAT_LON_ACCURACY_FACTOR,
    lon: Math.trunc(original.longitude * LAT_LON_ACCURACY_FACTOR) / LAT_LON_ACCURACY_FACTOR,
    genusIndex: classifications.map(g => g.fullname).indexOf(original.Gattung),
    height: original.Baumhoehe,
    crown: original.Kronendurc,
    dbh: original.Stammumfan,
    planted: original.Pflanzjahr
  };
}


function mapToClassification(gattung: string): Promise<Classification> {

  const parts = gattung.toLowerCase() === 'unbekannt' ? [gattung] : gattung.split(',');
  const scientific = parts.length > 0 ? parts[0].trim() : '';
  const common = parts.length > 1 ? parts[1].trim() : scientific;

  const scientificParts = (parse(scientific, { delimiter: ' ', quoteChar: '"' }).data)[0] as string[];
  const genus = scientificParts[0];
  const species = genus.toLowerCase() === 'unbekannt'
    ? ''
    : (scientificParts[1].toLowerCase() === 'x' ? `x ${scientificParts[2]}` : scientificParts[1]);
  const variety = genus.toLowerCase() === 'unbekannt'
    ? ''
    : (scientificParts[1].toLowerCase() === 'x' ? scientificParts.slice(3).join(' ') : scientificParts.slice(2).join(' '));

  return new Promise((resolve, reject) => {

    getWikipediaPageUrl(common)
      .then(url1 => {

        if (url1 === '') {
          getWikipediaPageUrl(`${genus} ${species}`.trim())
            .then(url2 => resolve({ fullname: gattung, genus, species, variety, scientific, common, wikipediaPageUrl: url2 }))
            .catch(reject);
        } else {
          resolve({ fullname: gattung, genus, species, variety, scientific, common, wikipediaPageUrl: url1 });
        }

      })
      .catch(reject);

  });

}


function getWikipediaPageUrl(title: string): Promise<string> {

  return new Promise((resolve, reject) => {

    const url = `https://de.wikipedia.org/w/api.php?action=query&format=json&prop=extracts&redirects&titles=${encodeURIComponent(title)}`;
    axios
      .get(url)
      .then(response => {
        const pages = response.data.query.pages;
        const key = Object.keys(pages)[0];
        if (key === '-1') {
          return resolve('');
        }
        resolve(`https://de.wikipedia.org/wiki/${encodeURIComponent(pages[key].title)}`);
      })
      .catch(reject);

  });

}


function cleanAddress(gebiet: string): string {
  let displayName = gebiet;
  IGNORED_ADDRESS_WORDS.forEach(word => displayName = displayName.replace(word, '').trim());
  return displayName;
}
