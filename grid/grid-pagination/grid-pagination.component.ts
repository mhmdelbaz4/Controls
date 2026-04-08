import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { TableService } from '../table.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { InputDirective } from '../directives/input.directive';
import { IGridConfig } from '../interfaces/grid-config.interface';

@Component({
  selector: 'app-grid-pagination',
  templateUrl: './grid-pagination.component.html',
  styleUrls: ['./grid-pagination.component.scss'],
  standalone: true,
  imports: [CommonModule, InputDirective, TranslateModule],
})
export class GridPaginationComponent  {
  @Input() currentPage!: number;

  @Input() totalPages!: number;
  @Input() limit!: number | null;
  @Input() totalRecords!: number;
  @Input() serverData: any[] = [];
  @Input() dataObject!: IGridConfig;
  @Input() count!: number;
  @Output() changePage = new EventEmitter();
  @Input() searchObject: any;
  constructor(
    private tableService: TableService,
    public transalte: TranslateService
  ) {
      console.log('GridPaginationComponent constructed');

  }
  nextPage() {
    if (this.currentPage < this.totalPages || this.currentPage != 0) {
      const params = this.dataObject.params;
      params.offset = params.offset + 1;
      if (this.searchObject) {
        params.search = this.searchObject;
      }
      this.currentPage = this.currentPage + 1;
      this.changePage.emit(this.currentPage);
    }
  }
  previousPage() {
    if (this.currentPage > 1 || this.currentPage != 0) {
      const params = this.dataObject.params;
      params.offset = params.offset - 1;
      if (this.searchObject) {
        params.search = this.searchObject;
      }
      this.currentPage = this.currentPage - 1;
      this.changePage.emit(this.currentPage);
    }
  }
  enter(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      const patchParams = this.dataObject.params;
      const target = event.target as HTMLInputElement | null;
      if (target) {
        patchParams.offset = +target.value - 1;
      }
      this.changePage.emit(patchParams);
    }
  }
}
