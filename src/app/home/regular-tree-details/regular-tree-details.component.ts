import { Component } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { TreeDataPointCsvRecord } from '../TreeDataPointCsvRecord';


@Component({
  selector: 'app-regular-tree-details',
  templateUrl: './regular-tree-details.component.html',
  styleUrls: ['./regular-tree-details.component.scss']
})
export class RegularTreeDetailsComponent {


  treeDetails: TreeDataPointCsvRecord = null;


  constructor(public modalRef: BsModalRef) {
  }


}
