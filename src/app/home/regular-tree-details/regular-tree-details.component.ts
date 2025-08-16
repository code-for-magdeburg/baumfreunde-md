import { Component, OnInit } from '@angular/core';
import { faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { CityTree } from '../../model/CityTree';
import { environment } from '../../../environments/environment';


type FellingDocumentationType = {
  url: string;
  reportedDate: Date;
  fileSize: number;
  fileSizeUnit: string;
};


@Component({
    selector: 'app-regular-tree-details',
    templateUrl: './regular-tree-details.component.html',
    styleUrls: ['./regular-tree-details.component.scss'],
    standalone: false
})
export class RegularTreeDetailsComponent implements OnInit {


  faExternalLinkAlt = faExternalLinkAlt;

  treeDetails: CityTree = null;
  felling: FellingDocumentationType = null;


  constructor(public modalRef: BsModalRef) {
  }


  ngOnInit(): void {

    if (this.treeDetails.fellingInfo) {
      const filesize = this.treeDetails .fellingInfo?.filesize;
      this.felling = {
        url: encodeURI(`${environment.fellingDocsBaseUrl}/${this.treeDetails.fellingInfo.pdfFile}`),
        reportedDate: new Date(this.treeDetails.fellingInfo.reportedDate),
        fileSize: filesize > 1024 ? filesize / 1024 / 1024 : filesize / 1024,
        fileSizeUnit: filesize > 1024 ? 'MB' : 'kb'
      };
    }

  }


}
