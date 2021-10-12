import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { PrivacyComponent } from './privacy/privacy.component';
import { ImpressumComponent } from './impressum/impressum.component';
import { FaellungenReportsComponent } from './faellungen-reports/faellungen-reports.component';


const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'privacy', component: PrivacyComponent },
  { path: 'impressum', component: ImpressumComponent },
  { path: 'faellungen-reports/:reportId', component: FaellungenReportsComponent },
  { path: 'faellungen-reports', component: FaellungenReportsComponent }
];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
