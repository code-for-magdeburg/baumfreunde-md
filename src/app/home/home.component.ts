import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import * as L from 'leaflet';
import {
  CircleMarker,
  circleMarker, GeoJSON,
  geoJSON, icon, LatLng,
  latLng,
  Layer,
  LayerGroup,
  layerGroup,
  MapOptions, marker, MarkerOptions,
  tileLayer
} from 'leaflet';
import { BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { RegularTreeDetailsComponent } from './regular-tree-details/regular-tree-details.component';
import { SearchTreeDialogComponent } from './search-tree-dialog/search-tree-dialog.component';
import { faBars, faCog, faCrosshairs, faFilter, faSearch } from '@fortawesome/free-solid-svg-icons';
import { Offcanvas } from 'bootstrap';
import { DataService } from '../services/data.service';
import { CityTree } from '../model/CityTree';
import { FilterDialogComponent } from './filter-dialog/filter-dialog.component';
import { ViewSettingsComponent } from './view-settings/view-settings.component';
import { Feature, Point } from 'geojson';
import { OttoPflanztFeature } from '../model/OttoPflanztFeature';
import { PumpFeature } from '../model/PumpFeature';


const MAX_ZOOM = 20;
const INITIAL_ZOOM = 13;
const INITIAL_MAP_CENTER = latLng(52.1259661, 11.6418369);
const MAP_ATTRIBUTION = 'Kartendaten &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> Mitwirkende';
const CURRENT_YEAR = new Date().getFullYear();

const OTTO_PFLANZT_ICON = icon({
  iconSize: [16, 24],
  iconAnchor: [8, 24],
  iconUrl: 'assets/images/otto-pflanzt-marker-2x.png'
});

const PUMP_ICON = icon({
  iconSize: [16, 24],
  iconAnchor: [8, 24],
  iconUrl: 'assets/images/pump-marker-2x.png'
});


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

  public matches(tree: CityTree): boolean {
    return (this.genus === '' || tree.genus === this.genus)
      && (tree.height >= this.minHeight)
      && (tree.crown >= this.minCrown)
      && (tree.dbh >= this.minDbh)
      && (this.minAge === 0 || (tree.planted && tree.planted <= CURRENT_YEAR - this.minAge))
      && (!this.onlyFelledTrees || tree.fellingInfo);
  }
}

export class ViewSettings {
  cityTrees = true;
  ottoPflanzt = true;
  pumps = true;
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
  ottoPflanztAreas: any = {};
  pumps: any = {};
  leafletLayers: Layer[] = [];
  cityTreeLayerGroup: LayerGroup<CityTree>;
  ottoPflanztLayerGroup: LayerGroup;
  pumpsLayerGroup: LayerGroup;
  filterSettings = new FilterSettings();
  viewSettings = new ViewSettings();

  selectedTreeId: number;

  map: L.Map;
  @ViewChild('root') rootElement!: ElementRef;
  @ViewChild('offcanvas') offcanvasElement!: ElementRef;
  private offcanvas: Offcanvas;
  private currentZoom: number;


  private static getPumpServiceText(pumpService: string): string {
    switch (pumpService) {
      case 'serviceable': return 'In Betrieb';
      case 'out_of_service': return 'Außer Betrieb';
      case 'inaccessible': return 'Nicht zugänglich';
      default: return 'Betriebszustand unbekannt';
    }
  }


  private static getPumpServiceTextCssClass(pumpService: string): string {
    switch (pumpService) {
      case 'serviceable': return 'text-success';
      case 'out_of_service':
      case 'inaccessible': return 'text-danger';
      default: return 'text-muted';
    }
  }


  constructor(private modalService: BsModalService, private dataService: DataService) {
  }


  async ngOnInit(): Promise<void> {

    try {
      this.dataIsLoading = true;
      this.cityTrees = await this.dataService.getAllCityTrees();
      this.ottoPflanztAreas = await this.dataService.getOttoPflanztAreas();
      this.pumps = await this.dataService.getPumps();
      this.cityTreeLayerGroup = layerGroup();
      this.ottoPflanztLayerGroup = layerGroup();
      this.pumpsLayerGroup = layerGroup();
      this.leafletLayers = [this.ottoPflanztLayerGroup, this.cityTreeLayerGroup, this.pumpsLayerGroup];
      this.jumpToCurrentLocation();
      this.updateDisplayedElements();
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
    this.currentZoom = map.getZoom();
  }


  openSearchDialog(): void {

    const options: ModalOptions = { initialState: { trees: this.cityTrees } };
    const dialog = this.modalService.show(SearchTreeDialogComponent, options);
    dialog.content.onConfirm = tree => {

      this.jumpToLocation(tree.lat, tree.lon);
      this.showTreeDetails(tree);
      const treeMarker = this.cityTreeLayerGroup
        .getLayers()
        .find(layer => (layer as CircleMarker).feature.properties.internal_ref === tree.internal_ref) as CircleMarker;
      if (treeMarker) {
        this.switchSelectedTree(treeMarker);
      }

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
    this.currentZoom = zoom;
    this.fixTreeCircleMarkerRadius();
  }


  private jumpToLocation(latitude: number, longitude: number): void {
    this.map.setView(latLng(latitude, longitude), MAX_ZOOM - 2);
  }


  private createCityTreeLayers(): CircleMarker<CityTree>[] {

    if (!this.viewSettings.cityTrees) {
      return [];
    }

    const radius = this.calcCircleRadiusByZoomFactor();
    return this.cityTrees
      .filter(tree => this.filterSettings.matches(tree))
      .map(tree => this.createRegularTreeMarker(tree, radius));

  }


  private createOttoPflanztLayers(): GeoJSON {

    if (!this.viewSettings.ottoPflanzt) {
      return geoJSON();
    }

    return geoJSON(this.ottoPflanztAreas, {
      style: { fillColor: '#8FBF27', color: '#6a8f17', fillOpacity: .8 },
      pointToLayer: (point: Feature<Point, OttoPflanztFeature>, latlng: LatLng): Layer => {
        const options: MarkerOptions = {
          icon: OTTO_PFLANZT_ICON,
          title: point.properties.title
        };
        const placeLabel = `Ort: <strong>${point.properties.title}</strong>`;
        const speciesLabel = point.properties.tree_species.length > 0
          ? `Was: <strong>${point.properties.tree_species.length} versch. Arten</strong>`
          : null;
        const numberOfTreesLabel = `Wieviel: <strong>${point.properties.number_of_trees_and_bushes} Bäume und Sträucher</strong>`;
        const fmtOptions: Intl.DateTimeFormatOptions = {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        };
        const plantedOnStr = new Date(point.properties.planted_on).toLocaleDateString('de', fmtOptions);
        const plantedOnLabel = `Wann: <strong>${plantedOnStr}</strong>`;

        let content = '<h5>Otto pflanzt!</h5>';
        content += `<div>${placeLabel}</div>`;
        if (speciesLabel) {
          content += `<div>${speciesLabel}</div>`;
        }
        content += `<div>${numberOfTreesLabel}</div>`;
        content += `<div>${plantedOnLabel}</div>`;

        return marker(latlng, options).bindPopup(content);
      }
    });

  }


  private createPumpsLayers(): GeoJSON {

    if (!this.viewSettings.pumps) {
      return geoJSON();
    }

    return geoJSON(this.pumps, {
      pointToLayer: (point: Feature<Point, PumpFeature>, latlng: LatLng): Layer => {

        const title = 'Wasserpumpe';
        const location = point.properties.location;
        const service = HomeComponent.getPumpServiceText(point.properties.service);
        const serviceTextCssClass = HomeComponent.getPumpServiceTextCssClass(point.properties.service);
        const sendMailHref = `mailto:baumfreudemd@gmail.com?subject=Hinweis%20zum%20Pumpenstandort%20Nr.%20${point.id}&body=Hallo%20Baumfreunde%20Magdeburg%21%0D%0A%0D%0AIch%20habe%20einen%20Hinweis%20zur%20Wasserpumpe%20%22${point.properties.location}%22:%0D%0A%0D%0A`;
        const content = `
            <div style="font-family: var(--bs-body-font-family); font-size: var(--bs-body-font-size); font-weight: var(--bs-body-font-weight); line-height: var(--bs-body-line-height);">
              <h3>${title}</h3>
              <strong class="text-reset">${location}</strong><br>
              <span class="${serviceTextCssClass}">${service}</span><br>
              <div class="mt-3">
                  <a class="btn btn-sm btn-outline-primary user-info-button" href="${sendMailHref}" target="_blank">Hinweis melden</a>
              </div>
            </div>
        `;
        const options: MarkerOptions = { icon: PUMP_ICON, title };

        return marker(latlng, options).bindPopup(content);

      }
    });

  }


  private createRegularTreeMarker(tree: CityTree, radius: number): CircleMarker<CityTree> {

    const fillOpacity = tree.fellingInfo ? .5 : .8;
    const color = tree.fellingInfo ? '#d066ff' : '#517551';
    const fillColor = tree.fellingInfo ? '#7e7e7e' : '#92D292';
    const treeMarker = circleMarker(
      latLng(tree.lat, tree.lon),
      { radius, fillOpacity, color, weight: 2, fillColor }
    )
      .on('click', event => {
        this.showTreeDetails(event.sourceTarget.feature.properties as CityTree);
        this.switchSelectedTree(event.sourceTarget as CircleMarker);
      });
    treeMarker.feature = {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [tree.lon, tree.lat] },
      properties: tree
    };
    return treeMarker;

  }


  private showTreeDetails(tree: CityTree): void {
    const options: ModalOptions = { initialState: { treeDetails: tree } };
    this.modalService.show(RegularTreeDetailsComponent, options);
  }


  private switchSelectedTree(treeMarker: CircleMarker): void {

    const selectedMarker = this.cityTreeLayerGroup
      .getLayers()
      .find(layer => (layer as CircleMarker).feature.properties.internal_ref === this.selectedTreeId) as CircleMarker;
    if (selectedMarker) {
      const fillOpacity = selectedMarker.feature.properties.fellingInfo ? .5 : .8;
      const color = selectedMarker.feature.properties.fellingInfo ? '#d066ff' : '#517551';
      const fillColor = selectedMarker.feature.properties.fellingInfo ? '#7e7e7e' : '#92D292';
      selectedMarker.setStyle({ fillOpacity, color, weight: 2, fillColor });
      (selectedMarker as CircleMarker).setRadius(this.calcCircleRadiusByZoomFactor());
    }

    this.selectedTreeId = treeMarker.feature.properties.internal_ref;

    treeMarker.setStyle({ fillOpacity: 1, color: '#9a423f', weight: 3, fillColor: '#e76561' });
    treeMarker.setRadius(this.calcCircleRadiusByZoomFactor() + 10);

  }


  private fixTreeCircleMarkerRadius(): void {
    const radius = this.calcCircleRadiusByZoomFactor();
    this.cityTreeLayerGroup.eachLayer(layer => (layer as CircleMarker).setRadius(radius));
  }


  private calcCircleRadiusByZoomFactor(): number {
    return Math.max(this.currentZoom * 5 - 75, 1);
  }


  private applyFilter(filterSettings: FilterSettings): void {
    this.filterSettings = filterSettings;
    this.updateDisplayedElements();
  }


  private applyViewSettings(viewSettings: ViewSettings): void {
    this.viewSettings = viewSettings;
    this.updateDisplayedElements();
  }


  private updateDisplayedElements(): void {
    this.cityTreeLayerGroup.clearLayers();
    this.createCityTreeLayers().forEach(layer => this.cityTreeLayerGroup.addLayer(layer));
    this.ottoPflanztLayerGroup.clearLayers();
    this.ottoPflanztLayerGroup.addLayer(this.createOttoPflanztLayers());
    this.pumpsLayerGroup.clearLayers();
    this.pumpsLayerGroup.addLayer(this.createPumpsLayers());
  }


}
