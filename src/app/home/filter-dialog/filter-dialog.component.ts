import { Component } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { GENUS_DICTIONARY } from '../../catalogs/genera';


@Component({
  selector: 'app-filter-dialog',
  templateUrl: './filter-dialog.component.html',
  styleUrls: ['./filter-dialog.component.scss']
})
export class FilterDialogComponent {


  selectedGenus = '';
  minHeight = 0;
  genera = GENUS_DICTIONARY;
  onConfirm: (genus: string, minHeight: number) => void;

  constructor(public modalRef: BsModalRef) {
    this.genera.sort((g1, g2) => g1.displayNamePlural < g2.displayNamePlural ? -1 : 0);
  }


  submit(): void {
    this.onConfirm(this.selectedGenus, this.minHeight);
    this.modalRef.hide();
  }


}
