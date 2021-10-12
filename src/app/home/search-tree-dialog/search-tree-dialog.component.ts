import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { timer } from 'rxjs';
import { TreeDataPointCsvRecord } from '../TreeDataPointCsvRecord';


@Component({
  selector: 'app-search-tree-dialog',
  templateUrl: './search-tree-dialog.component.html',
  styleUrls: ['./search-tree-dialog.component.scss']
})
export class SearchTreeDialogComponent implements AfterViewInit {


  trees: TreeDataPointCsvRecord[] = [];
  searchResult: TreeDataPointCsvRecord[] = [];
  onConfirm: (result: TreeDataPointCsvRecord) => void;

  @ViewChild('treeNrInput') treeNrInputRef: ElementRef;


  constructor(public modalRef: BsModalRef) {
  }


  ngAfterViewInit(): void {
    timer(350).subscribe(() => this.treeNrInputRef.nativeElement.focus());
  }


  doSearch(): void {

    const searchTerm = (this.treeNrInputRef.nativeElement.value as string).trim();
    const searchTermUpperCase = searchTerm.toUpperCase();

    if (searchTermUpperCase.startsWith('G') || searchTermUpperCase.startsWith('S') || searchTermUpperCase.startsWith('K')) {

      const tree = this.trees.find(t => t.Baumnr === searchTermUpperCase);
      if (tree) {
        this.selectTreeAndClose(tree);
      } else {
        // TODO: Handle unsuccessful search
        this.treeNrInputRef.nativeElement.focus();
        this.treeNrInputRef.nativeElement.select();
      }

    } else {

      const withoutLeadingZeros = searchTerm.replace(/^0+/, '');
      const candidates = [`G${withoutLeadingZeros}`, `S${withoutLeadingZeros}`, `K${withoutLeadingZeros}`];
      this.searchResult = this.trees.filter(t => candidates.includes(t.Baumnr));

      switch (this.searchResult.length) {
        case 0:
          // TODO: Handle unsuccessful search
          break;

        case 1:
          return this.selectTreeAndClose(this.searchResult[0]);

        default:
          // TODO: Present selection
          break;
      }

    }

  }


  selectTreeAndClose(item: TreeDataPointCsvRecord): void {
    this.modalRef.hide();
    this.onConfirm(item);
  }


}
