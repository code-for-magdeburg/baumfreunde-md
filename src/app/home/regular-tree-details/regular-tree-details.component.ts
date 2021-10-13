import { Component } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { TreeDataPoint } from '../../model/TreeDataPoint';


@Component({
  selector: 'app-regular-tree-details',
  templateUrl: './regular-tree-details.component.html',
  styleUrls: ['./regular-tree-details.component.scss']
})
export class RegularTreeDetailsComponent {


  treeDetails: TreeDataPoint = null;


  constructor(public modalRef: BsModalRef) {
  }


}
