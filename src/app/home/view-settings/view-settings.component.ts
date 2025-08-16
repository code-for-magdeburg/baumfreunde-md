import { Component, OnInit } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ViewSettings } from '../home.component';


@Component({
    selector: 'app-view-settings',
    templateUrl: './view-settings.component.html',
    styleUrls: ['./view-settings.component.scss'],
    standalone: false
})
export class ViewSettingsComponent implements OnInit {


  viewSettings: ViewSettings;

  showCityTrees = true;
  showOttoPflanzt = false;
  showPumps = false;

  onConfirm: (viewSettings: ViewSettings) => void;


  constructor(public modalRef: BsModalRef) {
  }


  ngOnInit(): void {
    this.showCityTrees = this.viewSettings.cityTrees;
    this.showOttoPflanzt = this.viewSettings.ottoPflanzt;
    this.showPumps = this.viewSettings.pumps;
  }


  submit(): void {
    const updatedViewSettings = new ViewSettings();
    updatedViewSettings.cityTrees = this.showCityTrees;
    updatedViewSettings.ottoPflanzt = this.showOttoPflanzt;
    updatedViewSettings.pumps = this.showPumps;
    this.onConfirm(updatedViewSettings);
    this.modalRef.hide();
  }


}
