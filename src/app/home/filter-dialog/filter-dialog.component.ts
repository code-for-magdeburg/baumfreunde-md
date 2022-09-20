import { Component, OnInit } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { GENUS_DICTIONARY } from '../../catalogs/genera';
import { FilterSettings } from '../home.component';


@Component({
  selector: 'app-filter-dialog',
  templateUrl: './filter-dialog.component.html',
  styleUrls: ['./filter-dialog.component.scss']
})
export class FilterDialogComponent implements OnInit {


  filterSettings: FilterSettings;

  selectedGenus = '';
  minHeight = 0;
  minCrown = 0;
  minDbh = 0;
  minAge = 0;
  onlyFelledTrees = false;

  genera = GENUS_DICTIONARY;
  onConfirm: (updatedFilterSettings: FilterSettings) => void;

  constructor(public modalRef: BsModalRef) {
    this.genera.sort(
      (g1, g2) => (g1.displayNamePlural > g2.displayNamePlural)
        ? 1
        : ((g2.displayNamePlural > g1.displayNamePlural) ? -1 : 0)
    );
  }


  ngOnInit(): void {
    this.selectedGenus = this.filterSettings.genus;
    this.minHeight = this.filterSettings.minHeight;
    this.minCrown = this.filterSettings.minCrown;
    this.minDbh = this.filterSettings.minDbh;
    this.minAge = this.filterSettings.minAge;
    this.onlyFelledTrees = this.filterSettings.onlyFelledTrees;
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
    const updatedFilterSettings = new FilterSettings();
    updatedFilterSettings.genus = this.selectedGenus;
    updatedFilterSettings.minHeight = this.minHeight;
    updatedFilterSettings.minCrown = this.minCrown;
    updatedFilterSettings.minDbh = this.minDbh;
    updatedFilterSettings.minAge = this.minAge;
    updatedFilterSettings.onlyFelledTrees = this.onlyFelledTrees;
    this.onConfirm(updatedFilterSettings);
    this.modalRef.hide();
  }


}
