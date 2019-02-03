import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { COLORSCHEME } from '../bar-chart-colors';
import * as _ from 'lodash';


@Component({
    selector: 'app-nachpflanzungen',
    templateUrl: './nachpflanzungen.component.html',
    styleUrls: ['./nachpflanzungen.component.css']
})
export class NachpflanzungenComponent implements OnInit {


    jahr = null;

    anzahlNachpflanzungen = null;
    nachpflanzungen = [];

    stats = [];
    nachpflanzungenGesamt = null;

    colorScheme = COLORSCHEME;

    constructor(private route: ActivatedRoute, private http: HttpClient, private router: Router) {
    }


    ngOnInit() {

        this.route.params
            .subscribe(params => {

                this.jahr = params.jahr ? parseInt(params.jahr) : null;

                if (this.jahr) {

                    const httpParams = new HttpParams().set('year', this.jahr);
                    this.http
                        .get(environment.apiBaseUrl + '/nachpflanzungen', { params: httpParams })
                        .subscribe((nachpflanzungen: any) => {
                            this.anzahlNachpflanzungen = _.sumBy(nachpflanzungen, 'anzahl');
                            this.nachpflanzungen = _.sortBy(nachpflanzungen, 'objekt');
                        });

                } else {

                    this.stats = [];

                    this.http
                        .get(environment.apiBaseUrl + '/stats-nachpflanzungen')
                        .subscribe((stats: any) => {

                            this.stats = _
                                .chain(stats)
                                .sortBy('_id')
                                .map(s => ({ name: s._id.toString(), value: s.total, extra: { jahr: s._id }}))
                                .value();
                            this.nachpflanzungenGesamt = _.sumBy(stats, 'total');

                        });

                }

            });

    }


    jahrAuswaehlen(event) {
        this.router.navigate(['/nachpflanzungen', event.extra.jahr]);
    }


    vorigesJahrWaehlen() {
        this.router.navigate(['/nachpflanzungen', this.jahr - 1]);
    }


    naechstesJahrWaehlen() {
        this.router.navigate(['/nachpflanzungen', this.jahr + 1]);
    }


}
