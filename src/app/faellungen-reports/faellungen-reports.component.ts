import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import * as _ from 'lodash';


@Component({
    selector: 'app-faellungen-reports',
    templateUrl: './faellungen-reports.component.html',
    styleUrls: ['./faellungen-reports.component.css']
})
export class FaellungenReportsComponent implements OnInit {


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
                    .get(`${environment.apiBaseUrl}/reports-baumfaellungen/${this.reportId}`)
                    .subscribe(report => this.report = report);

            } else {

                this.http
                    .get(`${environment.apiBaseUrl}/reports-baumfaellungen`)
                    .subscribe((reports: any) => this.reports = _.orderBy(reports, 'reportedDate', 'desc'));

            }

        });

    }


}
