import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { timer } from 'rxjs';
import { CityTree } from '../../model/CityTree';


@Component({
    selector: 'app-search-tree-dialog',
    templateUrl: './search-tree-dialog.component.html',
    styleUrls: ['./search-tree-dialog.component.scss'],
    standalone: false
})
export class SearchTreeDialogComponent implements AfterViewInit {


  trees: CityTree[] = [];
  searchResult: CityTree[] = [];
  searchFailed = false;
  onConfirm: (result: CityTree) => void;

  @ViewChild('treeNrInput') treeNrInputRef: ElementRef;


  constructor(public modalRef: BsModalRef) {
  }


  ngAfterViewInit(): void {
    timer(350).subscribe(() => this.treeNrInputRef.nativeElement.focus());
  }


  doSearch(): void {

    this.searchFailed = false;

    const searchTerm = (this.treeNrInputRef.nativeElement.value as string).trim();
    const searchTermUpperCase = searchTerm.toUpperCase();

    if (searchTermUpperCase.startsWith('G') || searchTermUpperCase.startsWith('S') || searchTermUpperCase.startsWith('K')) {

      const tree = this.trees.find(t => t.ref === searchTermUpperCase);
      if (tree) {
        this.selectTreeAndClose(tree);
      } else {
        this.searchFailed = true;
        this.treeNrInputRef.nativeElement.focus();
      }

    } else {

      const withoutLeadingZeros = searchTerm.replace(/^0+/, '');
      const candidates = [`G${withoutLeadingZeros}`, `S${withoutLeadingZeros}`, `K${withoutLeadingZeros}`];
      this.searchResult = this.trees.filter(t => candidates.includes(t.ref));

      switch (this.searchResult.length) {
        case 0:
          this.searchFailed = true;
          this.treeNrInputRef.nativeElement.focus();
          break;

        case 1:
          return this.selectTreeAndClose(this.searchResult[0]);

        default:
          break;
      }

    }

  }


  selectTreeAndClose(item: CityTree): void {
    this.modalRef.hide();
    this.onConfirm(item);
  }


}
