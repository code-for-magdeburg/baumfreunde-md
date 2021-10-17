import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { parse, ParseConfig } from 'papaparse';
import { TreeDataPointCsvRecord } from '../model/TreeDataPointCsvRecord';
import { TreeDataPoint } from '../model/TreeDataPoint';
import { Classification } from '../model/Classification';


@Injectable({ providedIn: 'root' })
export class DataService {


  private dataPoints: any[];
  private classifications: Classification[];
  private locations: string[];
  private addresses: string[];


  constructor(private http: HttpClient) {
  }


  public async getAllDataPoints(): Promise<TreeDataPoint[]> {

    try {
      if (!this.dataPoints) {
        await this.loadData();
      }
    } catch (e) {
      return Promise.reject(e);
    }

    return Promise.resolve(this.dataPoints);

  }


  private async loadData(): Promise<void> {

    const p1 = this.createFetchDataPointsPromise();
    const p2 = this.createFetchClassificationPromise();
    const p3 = this.createFetchLocationsPromise();
    const p4 = this.createFetchAddressesPromise();

    const results = await Promise.all([p1, p2, p3, p4]);

    this.classifications = results[1];
    this.locations = results[2];
    this.addresses = results[3];
    this.dataPoints = results[0].map(csvRecord => this.mapCsvRecordToTreeDataPoint(csvRecord));

  }


  private createFetchDataPointsPromise(): Promise<TreeDataPointCsvRecord[]> {

    return new Promise((resolve, reject) => {
      this.http
        .get('/assets/data/Baumkataster-Magdeburg-2021.txt', { responseType: 'text' })
        .subscribe(csv => {
          const parseOptions: ParseConfig = { dynamicTyping: true, skipEmptyLines: true, header: true };
          resolve(parse(csv, parseOptions).data as TreeDataPointCsvRecord[]);
        }, reject);
    });

  }


  private createFetchClassificationPromise(): Promise<Classification[]> {
    return this.http
      .get<Classification[]>('/assets/data/Baumkataster-Magdeburg-2021-Gattungen.json')
      .toPromise();
  }


  private createFetchLocationsPromise(): Promise<string[]> {
    return this.http
      .get<string[]>('/assets/data/Baumkataster-Magdeburg-2021-Typen.json')
      .toPromise();
  }


  private createFetchAddressesPromise(): Promise<string[]> {
    return this.http
      .get<string[]>('/assets/data/Baumkataster-Magdeburg-2021-Gebiete.json')
      .toPromise();
  }


  private mapCsvRecordToTreeDataPoint(csvRecord: TreeDataPointCsvRecord): TreeDataPoint {
    const classification = this.classifications[csvRecord.genusIndex];
    return {
      ...csvRecord,
      location: this.locations[csvRecord.locationIndex],
      address: this.addresses[csvRecord.addressIndex],
      genus: classification.genus,
      species: classification.species,
      variety: classification.variety,
      common: classification.common,
      scientific: classification.scientific,
      wikipediaPageUrl: classification.wikipediaPageUrl
    };
  }


}
