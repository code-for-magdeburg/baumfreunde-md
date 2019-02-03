import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from "@angular/router";
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import * as _ from 'lodash';
import { COLORSCHEME } from '../bar-chart-colors';


@Component({
    selector: 'app-faellungen',
    templateUrl: './faellungen.component.html',
    styleUrls: ['./faellungen.component.css']
})
export class FaellungenComponent implements OnInit {


    jahr = null;
    monat = null;

    anzahlFaellungen = null;
    faellungen = [];

    stats = [];

    colorScheme = COLORSCHEME;

    constructor(private route: ActivatedRoute, private router: Router, private http: HttpClient) {
    }


    ngOnInit() {

        this.route.params
            .subscribe(params => {

                this.jahr = params.jahr ? parseInt(params.jahr) : null;
                this.monat = params.monat ? parseInt(params.monat) : null;

                if (this.jahr && this.monat) {

                    let httpParams = new HttpParams().set('year', this.jahr);
                    httpParams = httpParams.set('month', this.monat);
                    this.http
                        .get(environment.apiBaseUrl + '/baumfaellungen', { params: httpParams })
                        .subscribe((faellungen: any) => {
                            this.anzahlFaellungen = _.sumBy(faellungen, 'numberOfTrees');
                            this.faellungen = _.orderBy(faellungen, 'addedDate', 'desc');
                        });

                } else {

                    this.stats = [];

                    let params = new HttpParams().set('include-months', '1');
                    if (this.jahr) {
                        params = params.set('year', this.jahr);
                    }

                    this.http
                        .get(`${environment.apiBaseUrl}/stats-baumfaellungen`, { params })
                        .subscribe((stats: any) => {

                            _
                                .chain(stats)
                                .orderBy('_id', 'desc')
                                .forEach(statsJahr => {

                                    const months = [
                                        { name: 'Januar', value: 0, extra: { monat: 1, jahr: statsJahr._id }},
                                        { name: 'Februar', value: 0, extra: { monat: 2, jahr: statsJahr._id }},
                                        { name: 'März', value: 0, extra: { monat: 3, jahr: statsJahr._id }},
                                        { name: 'April', value: 0, extra: { monat: 4, jahr: statsJahr._id }},
                                        { name: 'Mai', value: 0, extra: { monat: 5, jahr: statsJahr._id }},
                                        { name: 'Juni', value: 0, extra: { monat: 6, jahr: statsJahr._id }},
                                        { name: 'Juli', value: 0, extra: { monat: 7, jahr: statsJahr._id }},
                                        { name: 'August', value: 0, extra: { monat: 8, jahr: statsJahr._id }},
                                        { name: 'September', value: 0, extra: { monat: 9, jahr: statsJahr._id }},
                                        { name: 'Oktober', value: 0, extra: { monat: 10, jahr: statsJahr._id }},
                                        { name: 'November', value: 0, extra: { monat: 11, jahr: statsJahr._id }},
                                        { name: 'Dezember', value: 0, extra: { monat: 12, jahr: statsJahr._id }}
                                    ];

                                    _
                                        .chain(statsJahr.months)
                                        .sortBy('month')
                                        .forEach(m => months[m.month-1].value = m.total)
                                        .value();

                                    this.stats.push({ jahr: statsJahr._id, months, total: statsJahr.total });

                                })
                                .value();

                        });

                }

            });

    }


    vorigenMonatWaehlen() {

        if (this.monat === 1) {
            this.router.navigate(['/faellungen', this.jahr-1, 12]);
        } else {
            this.router.navigate(['/faellungen', this.jahr, this.monat-1]);
        }

    }


    naechstenMonatWaehlen() {

        if (this.monat === 12) {
            this.router.navigate(['/faellungen', this.jahr+1, 1]);
        } else {
            this.router.navigate(['/faellungen', this.jahr, this.monat+1]);
        }

    }


    monatAuswaehlen(event) {
        this.router.navigate(['/faellungen', event.extra.jahr, event.extra.monat]);
    }


}
