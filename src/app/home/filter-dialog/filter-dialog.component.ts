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
  minCrown = 0;
  minDbh = 0;
  minAge = 0;
  onlyFelledTrees = false;

  genera = GENUS_DICTIONARY;
  onConfirm: (genus: string, minHeight: number, minCrown: number, minDbh: number, minAge: number, onlyFelledTrees: boolean) => void;

  constructor(public modalRef: BsModalRef) {
    this.genera.sort((g1, g2) => g1.displayNamePlural < g2.displayNamePlural ? -1 : 0);
  }


  resetFilter(): void {
    this.selectedGenus = '';
    this.minHeight = 0;
    this.minCrown = 0;
    this.minDbh = 0;
    this.minAge = 0;
    this.onlyFelledTrees = false;
  }


  submit(): void {
    this.onConfirm(this.selectedGenus, this.minHeight, this.minCrown, this.minDbh, this.minAge, this.onlyFelledTrees);
    this.modalRef.hide();
  }


}
