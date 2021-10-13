import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import * as L from 'leaflet';
import { CircleMarker, circleMarker, latLng, MapOptions, tileLayer } from 'leaflet';
import { HttpClient } from '@angular/common/http';
import { parse, ParseConfig } from 'papaparse';
import { BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { RegularTreeDetailsComponent } from './regular-tree-details/regular-tree-details.component';
import 'leaflet-easybutton';
import { SearchTreeDialogComponent } from './search-tree-dialog/search-tree-dialog.component';
import { TreeDataPointCsvRecord } from '../model/TreeDataPointCsvRecord';
import { faBars, faSearch } from '@fortawesome/free-solid-svg-icons';
import { Offcanvas } from 'bootstrap';
import { DataService } from '../services/data.service';
import { TreeDataPoint } from '../model/TreeDataPoint';


const MAX_ZOOM = 20;
const INITIAL_ZOOM = 13;
const INITIAL_MAP_CENTER = latLng(52.1259661, 11.6418369);
const MAP_ATTRIBUTION = 'Kartendaten &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> Mitwirkende';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, AfterViewInit {


  faBars = faBars;
  faSearch = faSearch;


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

  dataPoints: TreeDataPoint[] = [];
  leafletLayers: CircleMarker<TreeDataPoint>[] = [];
  selectedTreeId: number;

  map: L.Map;
  @ViewChild('root') rootElement!: ElementRef;
  @ViewChild('offcanvas') offcanvasElement!: ElementRef;
  private offcanvas: Offcanvas;


  constructor(private http: HttpClient, private modalService: BsModalService, private dataService: DataService) {
  }


  async ngOnInit(): Promise<void> {

    this.dataPoints = await this.dataService.getAllDataPoints();
    this.leafletLayers = this.dataPoints.map(dataPoint => this.createRegularTreeMarker(dataPoint));

/*
    this.http
      .get('/assets/data/Baumkataster-Magdeburg-2021.txt', { responseType: 'text' })
      .subscribe(csv => {
        const parseOptions: ParseConfig = { dynamicTyping: true, skipEmptyLines: true, header: true };
        this.dataPoints = parse(csv, parseOptions).data;
        this.leafletLayers = this.dataPoints.map(dataPoint => this.createRegularTreeMarker(dataPoint));
      });
*/

    this.jumpToCurrentLocation();

  }


  ngAfterViewInit(): void {
    // tslint:disable-next-line:no-unused-expression
    this.offcanvas = new Offcanvas(this.offcanvasElement.nativeElement);
  }


  mapReady(map: L.Map): void {

    map.attributionControl.setPosition('topright');

    map.addControl(L.control.zoom({ position: 'topright' }));

    const jumpToCurrentLocationButton = L.easyButton({
      position: 'topright',
      states: [
        {
          stateName: 'default',
          title: 'Zur aktuellen Position',
          icon: '<svg aria-hidden="true" width="20" focusable="false" data-prefix="fas" data-icon="crosshairs" class="svg-inline--fa fa-crosshairs fa-w-16" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M500 224h-30.364C455.724 130.325 381.675 56.276 288 42.364V12c0-6.627-5.373-12-12-12h-40c-6.627 0-12 5.373-12 12v30.364C130.325 56.276 56.276 130.325 42.364 224H12c-6.627 0-12 5.373-12 12v40c0 6.627 5.373 12 12 12h30.364C56.276 381.675 130.325 455.724 224 469.636V500c0 6.627 5.373 12 12 12h40c6.627 0 12-5.373 12-12v-30.364C381.675 455.724 455.724 381.675 469.636 288H500c6.627 0 12-5.373 12-12v-40c0-6.627-5.373-12-12-12zM288 404.634V364c0-6.627-5.373-12-12-12h-40c-6.627 0-12 5.373-12 12v40.634C165.826 392.232 119.783 346.243 107.366 288H148c6.627 0 12-5.373 12-12v-40c0-6.627-5.373-12-12-12h-40.634C119.768 165.826 165.757 119.783 224 107.366V148c0 6.627 5.373 12 12 12h40c6.627 0 12-5.373 12-12v-40.634C346.174 119.768 392.217 165.757 404.634 224H364c-6.627 0-12 5.373-12 12v40c0 6.627 5.373 12 12 12h40.634C392.232 346.174 346.243 392.217 288 404.634zM288 256c0 17.673-14.327 32-32 32s-32-14.327-32-32c0-17.673 14.327-32 32-32s32 14.327 32 32z"></path></svg>',
          onClick: () => this.jumpToCurrentLocation()
        }
      ]
    });
    map.addControl(jumpToCurrentLocationButton);

    this.map = map;

  }


  openSearchDialog(): void {
    const options: ModalOptions = { initialState: { trees: this.dataPoints } };
    const dialog = this.modalService.show(SearchTreeDialogComponent, options);
    dialog.content.onConfirm = tree => {
      this.jumpToLocation(tree.lat, tree.lon);
      this.showTreeDetails(tree);
      this.selectTree(tree);
    };
  }


  private jumpToCurrentLocation(): void {
    navigator.geolocation.getCurrentPosition(
      resp => this.jumpToLocation(resp.coords.latitude, resp.coords.longitude),
      positionError => console.log(positionError));
  }


  private jumpToLocation(latitude: number, longitude: number): void {
    this.map.setView(latLng(latitude, longitude), MAX_ZOOM - 2);
  }


  private createRegularTreeMarker(dataPoint: TreeDataPoint): CircleMarker<TreeDataPoint> {

    const marker = circleMarker(
      latLng(dataPoint.lat, dataPoint.lon),
      { radius: 5, fillOpacity: .5, color: '#517551', weight: 1, fillColor: '#92D292' }
    )
      .on('click', event => {
        this.showTreeDetails(event.sourceTarget.feature.properties as TreeDataPoint);
        this.selectTree(event.sourceTarget.feature.properties as TreeDataPoint);
      });
    marker.feature = {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [dataPoint.lon, dataPoint.lat] },
      properties: dataPoint
    };
    return marker;

  }


  private showTreeDetails(dataPoint: TreeDataPoint): void {
    const options: ModalOptions = { initialState: { treeDetails: dataPoint } };
    this.modalService.show(RegularTreeDetailsComponent, options);
  }


  private selectTree(treeData: TreeDataPoint): void {
    const marker = this.leafletLayers.find(c => c.feature.properties.internal_ref === treeData.internal_ref);
    if (marker) {
      this.switchSelectedTree(marker);
    }
  }


  private switchSelectedTree(treeMarker: CircleMarker<TreeDataPoint>): void {

    const selectedMarker = this.leafletLayers.find(l => l.feature.properties.internal_ref === this.selectedTreeId);
    if (selectedMarker) {
      selectedMarker.setStyle({ fillOpacity: .5, color: '#517551', weight: 1, fillColor: '#92D292' });
      selectedMarker.setRadius(5);
    }

    this.selectedTreeId = treeMarker.feature.properties.internal_ref;

    treeMarker.setStyle({ fillOpacity: 1, color: '#75515c', weight: 2, fillColor: '#d292a5' });
    treeMarker.setRadius(10);

  }


}
