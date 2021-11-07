import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import * as L from 'leaflet';
import { CircleMarker, circleMarker, latLng, MapOptions, tileLayer } from 'leaflet';
import { BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { RegularTreeDetailsComponent } from './regular-tree-details/regular-tree-details.component';
import { SearchTreeDialogComponent } from './search-tree-dialog/search-tree-dialog.component';
import { faBars, faCog, faCrosshairs, faFilter, faSearch } from '@fortawesome/free-solid-svg-icons';
import { Offcanvas } from 'bootstrap';
import { DataService } from '../services/data.service';
import { CityTree } from '../model/CityTree';
import { FilterDialogComponent } from './filter-dialog/filter-dialog.component';
import { ViewSettingsComponent } from './view-settings/view-settings.component';


const MAX_ZOOM = 20;
const INITIAL_ZOOM = 13;
const INITIAL_MAP_CENTER = latLng(52.1259661, 11.6418369);
const MAP_ATTRIBUTION = 'Kartendaten &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> Mitwirkende';


export class FilterSettings {
  genus = '';
  minHeight = 0;
  minCrown = 0;
  minDbh = 0;
  minAge = 0;
  onlyFelledTrees = false;

  public get isActive(): boolean {
    return this.genus !== ''
      || this.minHeight > 0
      || this.minCrown > 0
      || this.minDbh > 0
      || this.minAge > 0
      || this.onlyFelledTrees;
  }
}

export class ViewSettings {
  cityTrees = true;
  ottoPflanzt = false;
}


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, AfterViewInit {


  faBars = faBars;
  faSearch = faSearch;
  faCrosshairs = faCrosshairs;
  faFilter = faFilter;
  faCog = faCog;

  dataIsLoading = false;
  hideFlyHomeButton = false;

  leafletOptions: MapOptions = {
    preferCanvas: true,
    tap: false, // To prevent a second event when clicking a marker
    layers: [
      tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
        maxZoom: MAX_ZOOM,
        attribution: MAP_ATTRIBUTION
      })
    ],
    zoom: INITIAL_ZOOM,
    zoomControl: false,
    center: INITIAL_MAP_CENTER
  };

  cityTrees: CityTree[] = [];
  leafletLayers: CircleMarker<CityTree>[] = [];
  filterSettings = new FilterSettings();
  viewSettings = new ViewSettings();

  selectedTreeId: number;

  map: L.Map;
  @ViewChild('root') rootElement!: ElementRef;
  @ViewChild('offcanvas') offcanvasElement!: ElementRef;
  private offcanvas: Offcanvas;


  constructor(private modalService: BsModalService, private dataService: DataService) {
  }


  async ngOnInit(): Promise<void> {

    try {
      this.dataIsLoading = true;
      this.jumpToCurrentLocation();
      this.cityTrees = await this.dataService.getAllCityTrees();
      this.leafletLayers = this.cityTrees.map(tree => this.createRegularTreeMarker(tree));
    } finally {
      this.dataIsLoading = false;
    }

  }


  ngAfterViewInit(): void {
    // tslint:disable-next-line:no-unused-expression
    this.offcanvas = new Offcanvas(this.offcanvasElement.nativeElement);
  }


  mapReady(map: L.Map): void {
    map.attributionControl.setPosition('topright');
    map.addControl(L.control.zoom({ position: 'topright' }));
    this.map = map;
  }


  openSearchDialog(): void {
    const options: ModalOptions = { initialState: { trees: this.cityTrees } };
    const dialog = this.modalService.show(SearchTreeDialogComponent, options);
    dialog.content.onConfirm = tree => {
      this.jumpToLocation(tree.lat, tree.lon);
      this.showTreeDetails(tree);
      this.selectTree(tree);
    };
  }


  openFilterDialog(): void {
    const options: ModalOptions = { initialState: { filterSettings: this.filterSettings } };
    const dialog = this.modalService.show(FilterDialogComponent, options);
    dialog.content.onConfirm = (updatedFilterSettings: FilterSettings) => this.applyFilter(updatedFilterSettings);
  }


  openViewSettingsDialog(): void {
    const options: ModalOptions = { initialState: { viewSettings: this.viewSettings } };
    const dialog = this.modalService.show(ViewSettingsComponent, options);
    dialog.content.onConfirm = (viewSettings: ViewSettings) => this.applyViewSettings(viewSettings);
  }


  jumpToCurrentLocation(): void {
    navigator.geolocation.getCurrentPosition(
      resp => this.jumpToLocation(resp.coords.latitude, resp.coords.longitude),
      () => this.hideFlyHomeButton = true);
  }


  zoomChanged(zoom: number): void {
    const radius = Math.max(zoom * 5 - 75, 1);
    this.leafletLayers.forEach(l => l.setRadius(radius));
  }


  private jumpToLocation(latitude: number, longitude: number): void {
    this.map.setView(latLng(latitude, longitude), MAX_ZOOM - 2);
  }


  private createRegularTreeMarker(tree: CityTree): CircleMarker<CityTree> {

    const fillOpacity = tree.fellingInfo ? .5 : .8;
    const color = tree.fellingInfo ? '#d066ff' : '#517551';
    const fillColor = tree.fellingInfo ? '#7e7e7e' : '#92D292';
    const marker = circleMarker(
      latLng(tree.lat, tree.lon),
      { radius: this.calcCircleRadiusByZoomFactor(), fillOpacity, color, weight: 2, fillColor }
    )
      .on('click', event => {
        this.showTreeDetails(event.sourceTarget.feature.properties as CityTree);
        this.selectTree(event.sourceTarget.feature.properties as CityTree);
      });
    marker.feature = {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [tree.lon, tree.lat] },
      properties: tree
    };
    return marker;

  }


  private showTreeDetails(tree: CityTree): void {
    const options: ModalOptions = { initialState: { treeDetails: tree } };
    this.modalService.show(RegularTreeDetailsComponent, options);
  }


  private selectTree(tree: CityTree): void {
    const marker = this.leafletLayers.find(layer => layer.feature.properties.internal_ref === tree.internal_ref);
    if (marker) {
      this.switchSelectedTree(marker);
    }
  }


  private switchSelectedTree(treeMarker: CircleMarker<CityTree>): void {

    const selectedMarker = this.leafletLayers.find(l => l.feature.properties.internal_ref === this.selectedTreeId);
    if (selectedMarker) {
      const fillOpacity = selectedMarker.feature.properties.fellingInfo ? .5 : .8;
      const color = selectedMarker.feature.properties.fellingInfo ? '#d066ff' : '#517551';
      const fillColor = selectedMarker.feature.properties.fellingInfo ? '#7e7e7e' : '#92D292';
      selectedMarker.setStyle({ fillOpacity, color, weight: 2, fillColor });
      selectedMarker.setRadius(this.calcCircleRadiusByZoomFactor());
    }

    this.selectedTreeId = treeMarker.feature.properties.internal_ref;

    treeMarker.setStyle({ fillOpacity: 1, color: '#9a423f', weight: 3, fillColor: '#e76561' });
    treeMarker.setRadius(this.calcCircleRadiusByZoomFactor() + 10);

  }


  private calcCircleRadiusByZoomFactor(): number {
    return Math.max(this.map.getZoom() * 5 - 75, 1);
  }


  private applyFilter(filterSettings: FilterSettings): void {
    this.filterSettings = filterSettings;
    const currentYear = new Date().getFullYear();
    this.leafletLayers = this.cityTrees
      .filter(tree =>
        (filterSettings.genus === '' || tree.genus === filterSettings.genus)
        && (tree.height >= filterSettings.minHeight)
        && (tree.crown >= filterSettings.minCrown)
        && (tree.dbh >= filterSettings.minDbh)
        && (filterSettings.minAge === 0 || (tree.planted && tree.planted <= currentYear - filterSettings.minAge))
        && (!filterSettings.onlyFelledTrees || tree.fellingInfo))
      .map(tree => this.createRegularTreeMarker(tree));
  }


  private applyViewSettings(viewSettings: ViewSettings): void {
    this.viewSettings = viewSettings;
  }


}
