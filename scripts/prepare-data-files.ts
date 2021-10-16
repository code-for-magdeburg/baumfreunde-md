import * as fs from 'fs';
import { parse, unparse } from 'papaparse';


const LAT_LON_ACCURACY_FACTOR = 10000000;


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
  species: string; // TODO: tbd
  variety: string; // TODO: tbd
  common: string; // TODO: tbd
  height: number;
  crown: number;
  dbh: number;
  planted: number;
};

// Load and parse original csv data file
const csv = fs.readFileSync('./data/Baumkataster-Magdeburg-2021.csv', 'utf-8');
const parseOptions = { dynamicTyping: true, skipEmptyLines: true, header: true };
const originalCsvRecords = parse(csv, parseOptions).data as OriginalCsvRecord[];

// Map to target records and save to csv file
const locations = [...new Set(originalCsvRecords.map(r => r.Typ))].sort();
fs.writeFileSync('./src/assets/data/Baumkataster-Magdeburg-2021-Typen.txt', locations.join('\n'), 'utf-8');
const genii = [...new Set(originalCsvRecords.map(r => r.Gattung))].sort();
fs.writeFileSync('./src/assets/data/Baumkataster-Magdeburg-2021-Gattungen.txt', genii.join('\n'), 'utf-8');
const addresses =  [...new Set(originalCsvRecords.map(r => r.Gebiet))].sort();
fs.writeFileSync('./src/assets/data/Baumkataster-Magdeburg-2021-Gebiete.txt', addresses.join('\n'), 'utf-8');
const targetRecords = originalCsvRecords
  .map(mapToStandardTreeRecord)
  .sort((a, b) => a.internal_ref < b.internal_ref ? -1 : 0);
fs.writeFileSync('./src/assets/data/Baumkataster-Magdeburg-2021.txt', unparse(targetRecords), 'utf-8');


function mapToStandardTreeRecord(original: OriginalCsvRecord): TargetRecord {
  return {
    internal_ref: original.gid,
    ref: original.Baumnr,
    locationIndex: locations.indexOf(original.Typ),
    addressIndex: addresses.indexOf(original.Gebiet),
    lat: Math.trunc(original.latitude * LAT_LON_ACCURACY_FACTOR) / LAT_LON_ACCURACY_FACTOR,
    lon: Math.trunc(original.longitude * LAT_LON_ACCURACY_FACTOR) / LAT_LON_ACCURACY_FACTOR,
    genusIndex: genii.indexOf(original.Gattung),
    species: '',
    variety: '',
    common: '',
    height: original.Baumhoehe,
    crown: original.Kronendurc,
    dbh: original.Stammumfan,
    planted: original.Pflanzjahr
  };
}
