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
const locationsJson = JSON.stringify(locations, null, 2);
fs.writeFileSync('./src/assets/data/Baumkataster-Magdeburg-2021-Typen.json', locationsJson);
const genii = [...new Set(originalCsvRecords.map(r => r.Gattung))].sort();
const geniiJson = JSON.stringify(genii, null, 2);
fs.writeFileSync('./src/assets/data/Baumkataster-Magdeburg-2021-Gattungen.json', geniiJson);
const addresses =  [...new Set(originalCsvRecords.map(r => r.Gebiet))].sort();
const adressesJson = JSON.stringify(addresses, null, 2);
fs.writeFileSync('./src/assets/data/Baumkataster-Magdeburg-2021-Gebiete.json', adressesJson);
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
    height: original.Baumhoehe,
    crown: original.Kronendurc,
    dbh: original.Stammumfan,
    planted: original.Pflanzjahr
  };
}
