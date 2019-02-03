import { Component, OnInit } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import * as _ from 'lodash';


@Component({
    selector: 'app-pflanzstandorte-reports',
    templateUrl: './pflanzstandorte-reports.component.html',
    styleUrls: ['./pflanzstandorte-reports.component.css']
})
export class PflanzstandorteReportsComponent implements OnInit {


    reportId = null;
    report = null;
    reports = [];


    constructor(private route: ActivatedRoute, private http: HttpClient) {
    }


    ngOnInit() {

        this.route.params.subscribe( params => {

            this.reportId = params.reportId;

            if (this.reportId) {

                this.http
                    .get(`${environment.apiBaseUrl}/reports-pflanzstandorte/${this.reportId}`)
                    .subscribe(report => this.report = report);

            } else {

                this.http
                    .get(`${environment.apiBaseUrl}/reports-pflanzstandorte`)
                    .subscribe((reports: any) => this.reports = _.orderBy(reports, 'reportedDate', 'desc'));

            }

        });

    }


}
