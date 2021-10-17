import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import { HomeComponent } from './home/home.component';
import { HttpClientModule } from '@angular/common/http';
import { ModalModule } from 'ngx-bootstrap/modal';
import { RegularTreeDetailsComponent } from './home/regular-tree-details/regular-tree-details.component';
import { SearchTreeDialogComponent } from './home/search-tree-dialog/search-tree-dialog.component';
import { FormsModule } from '@angular/forms';
import { registerLocaleData } from '@angular/common';
import de from '@angular/common/locales/de';
import { ImpressumComponent } from './impressum/impressum.component';
import { PrivacyComponent } from './privacy/privacy.component';
import { FaellungenReportsComponent } from './faellungen-reports/faellungen-reports.component';
import { FilterDialogComponent } from './home/filter-dialog/filter-dialog.component';


@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    RegularTreeDetailsComponent,
    SearchTreeDialogComponent,
    ImpressumComponent,
    PrivacyComponent,
    FaellungenReportsComponent,
    FilterDialogComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    FontAwesomeModule,
    FormsModule,
    HttpClientModule,
    LeafletModule,
    ModalModule.forRoot()
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {


  constructor() {
    registerLocaleData(de);
  }


}
