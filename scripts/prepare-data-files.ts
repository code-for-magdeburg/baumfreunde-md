import * as fs from 'fs';
import { parse, ParseConfig, unparse } from 'papaparse';
const axios = require('axios').default;


const MAX_HEIGHT = 40;
const MAX_CROWN = 40;
const MAX_PLANTED = 2021;

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

// TODO: Add missing urls
const FIXED_WIKIPEDIA_PAGE_URLS = [
  { title: 'Berg-Ahorn  -  Weiss-Ahorn', url: '' },
  { title: 'Purpurahorn', url: '' },
  { title: 'Gemeine Roß-Kastanie', url: '' },
  { title: 'Scharlach-Kastanie', url: '' },
  { title: 'Purpurkastanie - Rotblühende Rosskastanie', url: '' },
  { title: 'Gefülltblühende Roßkastanie', url: '' },
  { title: 'Purpur-Erle', url: '' },
  { title: 'Schnee-Felsenbirne', url: '' },
  { title: 'Hängende Felsenbirne', url: '' },
  { title: 'Gemeine Hainbuche - Gemeine Weißbuche', url: '' },
  { title: 'Blaue Säulen-Zypresse', url: '' },
  { title: 'Weißbeeren-Hartriegel', url: '' },
  { title: 'Lederbl. Weißdorn - Apfeldorn', url: '' },
  { title: 'Pflaumenblättriger Weissdorn', url: '' },
  { title: 'Stechpalmenhybride', url: '' },
  { title: 'Malus \"Boskop\"', url: '' },
  { title: 'rosa-blühender Zierapfel', url: '' },
  { title: 'breitkroniger Zierapfel', url: '' },
  { title: 'Prachtapfel', url: '' },
  { title: 'Malus \"Grafensteiner\"', url: '' },
  { title: 'Zierapfel - Hybride', url: '' },
  { title: 'robinrot-blühender Zierapfel', url: '' },
  { title: 'Zierapfel \"Van Eseltine\"', url: '' },
  { title: 'Dreilappiger Apfelbaum', url: '' },
  { title: 'österreichische Schwarz-Kiefer', url: '' },
  { title: 'Gemeine Kiefer  -  Wald-Kiefer', url: '' },
  { title: 'Gemeine Kiefer - Wald-Kiefer', url: '' },
  { title: 'Populus Nigra', url: '' },
  { title: 'Italienische Pyramiden-Pappel - Napoleon', url: '' },
  { title: 'Berliner Lorbeer-Pappel', url: '' },
  { title: 'Holz-Pappel - Robusta-Pappel', url: '' },
  { title: 'Purpurpflaume - Blutpflaume', url: '' },
  { title: 'Zierkirsche \"Spire\"', url: '' },
  { title: 'Berg-Kirsche', url: '' },
  { title: 'Mahagoni-Kirsche', url: '' },
  { title: 'Yoshino-Kirsche', url: '' },
  { title: 'Amerikanische Rot-Eiche', url: '' },
  { title: 'Wintergruene Eiche', url: '' },
  { title: 'Rosarote Akazie', url: '' },
  { title: 'Schein-Akazie - Silberregen', url: '' },
  { title: 'Japanische Drachen-Weide', url: '' },
  { title: 'Dauerwellen-Weide - Korkenzieher-Weide', url: '' },
  { title: 'Baum-Weide - Kopf-Weide', url: '' },
  { title: 'Hängende Kätzchen-Weide  -  Trauer-Sal-W', url: '' },
  { title: 'Echte Sal-Weide', url: '' },
  { title: 'Asch-Weide - Grau-Weide', url: '' },
  { title: 'Pommern-Weide - Reif-Weide', url: '' },
  { title: 'Silber-Kriech-Weide', url: '' },
  { title: 'Band-Weide - Hanf-Weide', url: '' },
  { title: 'Fliederbeerstrauch - Schwarzer Holunder', url: '' },
  { title: 'Fiederspiere - Ebereschenspiere', url: '' },
  { title: 'Essbare Eberesche', url: '' },
  { title: 'Gemeine Eberesche - Vogelbeerbaum', url: '' },
  { title: 'Thüringische Säulen-Eberesche', url: '' },
  { title: 'Eberesche/Mehlbeere', url: '' },
  { title: 'Thüringische Eberesche', url: '' },
  { title: 'Säulen-Eibe', url: '' },
  { title: 'Säulen-Lebensbaum', url: '' },
  { title: 'Tilia Cordata \"Greenspire\"', url: '' },
  { title: 'Kleinkronige Winter-Linde', url: '' },
  { title: 'Kaiser-Linde', url: '' },
  { title: 'Kegel-Linde', url: '' },
  { title: 'amerikanischer Hybride', url: '' },
  { title: 'Feld-Rüster - Feld-Ulme', url: '' },
  { title: 'holländische Clusius-Ulme', url: '' },
  { title: 'Schmalkronige Stadt-Ulme', url: '' },
  { title: 'Holländische Stadtulme', url: '' },
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
console.log('Reading and parsing "./data/Baumkataster-Magdeburg-2021.csv"...');
const csv = fs.readFileSync('./data/Baumkataster-Magdeburg-2021.csv', 'utf-8');
const parseOptions: ParseConfig = {
  dynamicTyping: true,
  skipEmptyLines: true,
  header: true,
  transform: (value, field) => field === 'Gattung' ? value.replace(';', ',') : value
};
const originalCsvRecords = parse(csv, parseOptions).data as OriginalCsvRecord[];


// Save locations to json file
console.log('Writing locations to "./src/assets/data/Baumkataster-Magdeburg-2021-Typen.json"...');
const locations = [...new Set(originalCsvRecords.map(r => r.Typ))].sort();
const locationsJson = JSON.stringify(locations, null, 2);
fs.writeFileSync('./src/assets/data/Baumkataster-Magdeburg-2021-Typen.json', locationsJson);

// Save addresses to json file
console.log('Writing addresses to "./src/assets/data/Baumkataster-Magdeburg-2021-Gebiete.json"...');
const addresses = [...new Set(originalCsvRecords.map(r => cleanAddress(r.Gebiet)))].sort();
const adressesJson = JSON.stringify(addresses, null, 2);
fs.writeFileSync('./src/assets/data/Baumkataster-Magdeburg-2021-Gebiete.json', adressesJson);

// Save classification to json file
console.log('Writing classifications to "./src/assets/data/Baumkataster-Magdeburg-2021-Gattungen.json"...');
const genii = [...new Set(originalCsvRecords.map(r => r.Gattung))].sort();
const geniiPromises = genii.map(mapToClassification);
Promise.all(geniiPromises)
  .then(classifications => {

    const classificationsJson = JSON.stringify(classifications, null, 2);
    fs.writeFileSync('./src/assets/data/Baumkataster-Magdeburg-2021-Gattungen.json', classificationsJson);

    // Save tree records to csv file
    console.log('Writing tree data to "./src/assets/data/Baumkataster-Magdeburg-2021.txt"...');
    console.log('When importing a new dataset check if the following hints still hold true');
    console.log(`- Height > ${MAX_HEIGHT} is considered invalid data`);
    console.log(`- Crown > ${MAX_CROWN} is considered invalid data`);
    console.log(`- Planted > ${MAX_PLANTED} is considered invalid data`);
    const targetRecords = originalCsvRecords
      .map(r => mapToStandardTreeRecord(r, classifications))
      .sort((a, b) => a.internal_ref < b.internal_ref ? -1 : 0);
    fs.writeFileSync('./src/assets/data/Baumkataster-Magdeburg-2021.txt', unparse(targetRecords));

    console.log('Finished.');

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
    height: original.Baumhoehe > 40 ? null : original.Baumhoehe, // height > 40 meters is considered invalid data (see #41)
    crown: original.Kronendurc > 40 ? null : original.Kronendurc, // height > 40 meters is considered invalid data (see #41)
    dbh: original.Stammumfan,
    planted: original.Pflanzjahr > 2021 ? null : original.Pflanzjahr  // planted > 2021 is considered invalid data (see #41)
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

    fetchWikipediaPageUrl(common)
      .then(url1 => {

        if (url1 === '') {
          fetchWikipediaPageUrl(`${genus} ${species}`.trim())
            .then(url2 => resolve({ fullname: gattung, genus, species, variety, scientific, common, wikipediaPageUrl: url2 }))
            .catch(reject);
        } else {
          resolve({ fullname: gattung, genus, species, variety, scientific, common, wikipediaPageUrl: url1 });
        }

      })
      .catch(reject);

  });

}


function fetchWikipediaPageUrl(title: string): Promise<string> {

  return new Promise((resolve, reject) => {

    const fixedUrl = FIXED_WIKIPEDIA_PAGE_URLS.find(p => p.title === title);
    if (fixedUrl) {
      return resolve(fixedUrl.url);
    }

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
