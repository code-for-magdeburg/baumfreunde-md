import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as _ from 'lodash';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';
import { COLORSCHEME } from '../bar-chart-colors';
import { forkJoin } from 'rxjs';



@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {


    colorScheme = COLORSCHEME;

    stats = [];
    faellungenGesamt = null;
    isLoading = false;

    statsNachpflanzungen = [];
    nachpflanzungenGesamt = null;
    isLoadingNachpflanzungen = false;


    constructor(private router: Router, private http: HttpClient) {
    }


    ngOnInit() {

        this.isLoading = true;

        this.stats = [];

        forkJoin(this.http.get(`${environment.apiBaseUrl}/stats-baumfaellungen`), this.http.get(`${environment.apiBaseUrl}/stats-nachpflanzungen`))
            .subscribe((result: any) => {

                const faellungen = result[0];
                const nachpflanzungen = result[1];

                this.stats = _
                    .chain(faellungen)
                    .sortBy('_id')
                    .map((f: any) => {

                        const n: any = _.find(nachpflanzungen, { _id: f._id });

                        return {
                            name: f._id.toString(),
                            series: [
                                { name: 'Fällungen', value: f.total, extra: { jahr: f._id } },
                                { name: 'Nachpflanzungen', value: (n ? n.total : null), extra: { jahr: f._id } }]
                        };
                    })
                    .value();

                this.faellungenGesamt = _.sumBy(faellungen, 'total');
                this.nachpflanzungenGesamt = _.sumBy(nachpflanzungen, 'total');

                this.isLoading = false;

            }, err => this.isLoading = false);

    }


    jahrAuswaehlen(event) {

        const typ = event.name;

        switch (typ) {

            case "Fällungen":
                this.router.navigate(['/faellungen', event.extra.jahr]);
                break;

            case "Nachpflanzungen":
                this.router.navigate(['/nachpflanzungen', event.extra.jahr]);
                break;

        }

    }


}
