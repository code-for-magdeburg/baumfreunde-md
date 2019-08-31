import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { AlertModule, BsDropdownModule, CollapseModule } from 'ngx-bootstrap';
import { HttpClientModule } from '@angular/common/http';
import { HomeComponent } from './home/home.component';
import { FaellungenComponent } from './faellungen/faellungen.component';
import { ROUTES } from './app.routes';
import { RouterModule } from '@angular/router';
import { FaellungenReportsComponent } from './faellungen-reports/faellungen-reports.component';
import { FaIconLibrary, FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { far } from '@fortawesome/free-regular-svg-icons';
import { fab } from '@fortawesome/free-brands-svg-icons';
import { ImpressumComponent } from './impressum/impressum.component';
import { DatenschutzComponent } from './datenschutz/datenschutz.component';
import { KontaktComponent } from './kontakt/kontakt.component';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import * as moment from 'moment';
import { NachpflanzungenComponent } from './nachpflanzungen/nachpflanzungen.component';
import { BaumspendenComponent } from './baumspenden/baumspenden.component';
import { AgmCoreModule } from '@agm/core';
import { MomentModule } from 'ngx-moment';
import { PflanzstandorteReportsComponent } from './pflanzstandorte-reports/pflanzstandorte-reports.component';


moment.locale('de');


@NgModule({
    declarations: [
        AppComponent,
        HomeComponent,
        FaellungenComponent,
        FaellungenReportsComponent,
        ImpressumComponent,
        DatenschutzComponent,
        KontaktComponent,
        NachpflanzungenComponent,
        BaumspendenComponent,
        PflanzstandorteReportsComponent
    ],
    imports: [
        AgmCoreModule.forRoot({ apiKey: 'AIzaSyC7K46XE9F5ZQo2UeYKUTx-6jBHjVcH5P0' }),
        AlertModule.forRoot(),
        BrowserAnimationsModule,
        BsDropdownModule.forRoot(),
        CollapseModule.forRoot(),
        FontAwesomeModule,
        HttpClientModule,
        MomentModule,
        NgxChartsModule,
        RouterModule.forRoot(ROUTES)
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule {


    constructor(library: FaIconLibrary) {
        library.addIconPacks(fas, far, fab);
    }


}
