import { Component, OnInit } from '@angular/core';
import { faHardHat, faWrench } from '@fortawesome/free-solid-svg-icons';


@Component({
  selector: 'app-faellungen-reports',
  templateUrl: './faellungen-reports.component.html',
  styleUrls: ['./faellungen-reports.component.scss']
})
export class FaellungenReportsComponent implements OnInit {


/*
  reportId = null;
  report = null;
  reports = [];
*/
  faWrench = faWrench;
  faHardHat = faHardHat;


  constructor() { }


  ngOnInit(): void {

/*
    this.route.params.subscribe(params => {

      this.reportId = params.reportId;

      if (this.reportId) {
        this.http
          .get(`${environment.apiBaseUrl}/reports-baumfaellungen/${this.reportId}`)
          .subscribe(report => this.report = report);
      } else {
        this.http
          .get(`${environment.apiBaseUrl}/reports-baumfaellungen`)
          .subscribe((reports: any[]) => this.reports = reports.sort((r1, r2) => r1.reportedDate > r2.reportedDate ? -1 : 0));
      }

    });
*/

  }


}
