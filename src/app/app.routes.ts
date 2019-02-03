import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { FaellungenComponent } from './faellungen/faellungen.component';
import { FaellungenReportsComponent } from './faellungen-reports/faellungen-reports.component';
import { ImpressumComponent } from './impressum/impressum.component';
import { DatenschutzComponent } from './datenschutz/datenschutz.component';
import { KontaktComponent } from './kontakt/kontakt.component';
import { NachpflanzungenComponent } from './nachpflanzungen/nachpflanzungen.component';
import { BaumspendenComponent } from './baumspenden/baumspenden.component';
import { PflanzstandorteReportsComponent } from './pflanzstandorte-reports/pflanzstandorte-reports.component';


export const ROUTES: Routes = [

    { path: '', redirectTo: '/home', pathMatch: 'full' },
    { path: 'home', component: HomeComponent },
    { path: 'faellungen', component: FaellungenComponent },
    { path: 'faellungen/:jahr', component: FaellungenComponent },
    { path: 'faellungen/:jahr/:monat', component: FaellungenComponent },
    { path: 'faellungen-reports/:reportId', component: FaellungenReportsComponent },
    { path: 'faellungen-reports', component: FaellungenReportsComponent },
    { path: 'nachpflanzungen', component: NachpflanzungenComponent },
    { path: 'nachpflanzungen/:jahr', component: NachpflanzungenComponent },
    { path: 'baumspenden', component: BaumspendenComponent },
    { path: 'pflanzstandorte-reports/:reportId', component: PflanzstandorteReportsComponent },
    { path: 'pflanzstandorte-reports', component: PflanzstandorteReportsComponent },
    { path: 'impressum', component: ImpressumComponent },
    { path: 'datenschutz', component: DatenschutzComponent },
    { path: 'kontakt', component: KontaktComponent }

];
