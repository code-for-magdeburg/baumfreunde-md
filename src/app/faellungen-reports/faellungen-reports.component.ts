import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { faDownload } from '@fortawesome/free-solid-svg-icons';


@Component({
  selector: 'app-faellungen-reports',
  templateUrl: './faellungen-reports.component.html',
  styleUrls: ['./faellungen-reports.component.scss']
})
export class FaellungenReportsComponent implements OnInit {


  faDownload = faDownload;

  reportId = null;
  report = null;
  reports = [];


  constructor(private route: ActivatedRoute, private http: HttpClient) { }


  ngOnInit(): void {

    this.route.params.subscribe(params => {

      this.reportId = params.reportId;

      if (this.reportId) {
        this.http
          .get(`/.netlify/functions/reports-baumfaellungen?reportId=${this.reportId}`)
          .subscribe(report => this.report = report);
      } else {
        this.http
          .get('/.netlify/functions/reports-baumfaellungen')
          .subscribe((reports: any[]) => this.reports = reports.sort((r1, r2) => r1.reportedDate > r2.reportedDate ? -1 : 0));
      }

    });

  }


}
