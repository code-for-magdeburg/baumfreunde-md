import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as _ from 'lodash';
import { environment } from '../../environments/environment';


@Component({
    selector: 'app-baumspenden',
    templateUrl: './baumspenden.component.html',
    styleUrls: ['./baumspenden.component.css']
})
export class BaumspendenComponent implements OnInit {


    lat: number = 52.1205333;
    lng: number = 11.6276237;

    mapHeight = 0;

    trees = [];

    isLoading = false;


    constructor(private http: HttpClient) {
    }


    ngOnInit() {

        this.mapHeight = window.innerHeight - 250;
        this.isLoading = true;

        this.http
            .get(environment.apiBaseUrl + '/pflanzstandorte')
            .subscribe((pflanzstandorte: Array<any>) => {

                this.trees = _
                    .chain(pflanzstandorte)
                    .map(pflanzstandort => ({
                        nummer: pflanzstandort.treeIdentifier,
                        bezeichnung: pflanzstandort.title,
                        stadtteil: pflanzstandort.district,
                        status: pflanzstandort.status,
                        baumart: pflanzstandort.type,
                        latitude: pflanzstandort.latitude,
                        longitude: pflanzstandort.longitude,
                        iconUrl: pflanzstandort.status === 'vergeben' ? 'assets/tree-vergeben.svg' : (pflanzstandort.status === 'reserviert' ? 'assets/tree-reserviert.svg' : 'assets/tree-verfuegbar.svg'),
                        dokumentLink: `https://www.magdeburg.de${pflanzstandort.documentUrl}`
                    }))
                    .sortBy(pflanzstandort => pflanzstandort.status === 'verfügbar' ? 3 : (pflanzstandort.status === 'reserviert' ? 2 : 1))
                    .value();

                this.isLoading = false;

            })

    }


}
