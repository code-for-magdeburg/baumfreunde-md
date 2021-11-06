import { Component } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ViewSettings } from '../home.component';


@Component({
  selector: 'app-view-settings',
  templateUrl: './view-settings.component.html',
  styleUrls: ['./view-settings.component.scss']
})
export class ViewSettingsComponent {


  showCityTrees = true;
  showOttoPflanzt = false;

  onConfirm: (viewSettings: ViewSettings) => void;


  constructor(public modalRef: BsModalRef) {
  }


  submit(): void {
    this.onConfirm({
      cityTrees: this.showCityTrees,
      ottoPflanzt: this.showOttoPflanzt
    });
    this.modalRef.hide();
  }


}
