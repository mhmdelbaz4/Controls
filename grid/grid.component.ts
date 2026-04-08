import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnInit,
  Output,
  QueryList,
  Renderer2,
  SimpleChanges,
  TemplateRef,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { IGridConfig } from './interfaces/grid-config.interface';
import { TableService } from './table.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { NgbModule, NgbTooltip } from '@ng-bootstrap/ng-bootstrap';
import { GridPaginationComponent } from './grid-pagination/grid-pagination.component';
// import { RolesListComponent } from '../../../home-layout/settings/roles/roles-list/roles-list.component';
import { LocalizedDatePipe } from './../../../core/pipes/localized-date.pipe';
import { DateLocalePipe } from './../../../core/pipes/date-locale.pipe';
import { TooltipService } from './../../../core/services/tooltip.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-grid',
  templateUrl: './grid.component.html',
  styleUrls: ['./grid.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    NgbModule,
    GridPaginationComponent,
    // RolesListComponent,
    DateLocalePipe,
  ],
})
export class GridComponent implements OnInit{
  @Input() dataObject!: IGridConfig;
  @Input() searchObj!: any;
  @Input() showNoData: boolean = true;
  @Input() onRowClick?: (row: any) => void;
  @Input() loadingTemplate?: TemplateRef<any>;
  @Input() emptyTemplate?: TemplateRef<any>;

  @ViewChildren('sortIcon') sortIcon!: QueryList<ElementRef>;
  @ViewChildren('sortIconId') sortIconId!: QueryList<ElementRef>;
  @ViewChild('tooltip') tooltip!: NgbTooltip;
  @ViewChild('inputRef', { static: false })
  toggleInput!: ElementRef<HTMLInputElement>;
  @ViewChild('blurTarget', { static: false })
  blurTarget!: ElementRef<HTMLButtonElement>;
  @Output() onGetData = new EventEmitter<any>();

  popupTitle: { ar: string; en: string } = {
    ar: 'الصلاحيات',
    en: 'Permissions',
  };
  popupSubTitle!: { ar: string; en: string };
  permissions: Array<string> = [];
  rolePermissions: any[] = [];
  serverData: any[] = [];
  currentPage: number = 1;
  limit: number | null = null;
  totalPages: number = 0;
  totalRecords: number = 0;
  count = 0;
  currencySymbol!: string;
  initialLoad = true;
  isLoading: boolean = true;
  constructor(
    private tableService: TableService,
    private renderer: Renderer2,
    public translate: TranslateService,
    private tooltipService: TooltipService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  hasAllPermissions(permissions: string[]) {
    if (permissions.length == 0) return true;
    return permissions.every((p) => this.permissions.includes(p));
  }

  hasAnyPermission(permissions: string[]) {
    if (permissions.length == 0) return true;
    return this.permissions.some((p) => permissions.includes(p));
  }

  isEnLangText(text: string): boolean {
    if (!text) return false;
    return /^[A-Za-z0-9\s.,!?'"()\-:;]+$/.test(text);
  }
  // getData() {
  //   if (this.currentPage === 0) {
  //     this.currentPage = 1;
  //   }
  //   if (this.searchObj) {
  //     this.dataObject.params.search = { ...this.searchObj };
  //   }
  //   this.tableService
  //     .getData(this.dataObject.apiPath, this.dataObject.params)
  //     .subscribe((res) => {
  //     this.serverData = res.rows;

  //       this.count = res.count;
  //       this.totalRecords = this.count;
  //       this.totalPages = this.limit ? Math.ceil(this.count / this.limit) : 0;
  //       this.onGetData.emit(res);
  //     });
  // }

  getData(): void {
    this.isLoading = true;
    this.cdr.detectChanges();
    if (this.currentPage === 0) {
      this.currentPage = 1;
    }

    if (this.searchObj) {
      this.dataObject.params.search = { ...this.searchObj };
    }

    // If apiPath is empty, use local data
    if (!this.dataObject.apiPath) {
      this.serverData = this.dataObject.data ?? [];
      this.count = this.serverData.length;
      this.totalRecords = this.count;
      this.totalPages = this.limit ? Math.ceil(this.count / this.limit) : 1;
      this.onGetData.emit({ rows: this.serverData, count: this.count });
      this.initialLoad = false;
      this.isLoading = false;
      return;
    }

    // Otherwise, call the API
    this.tableService
      .getData(this.dataObject.apiPath, this.dataObject.params)
      .subscribe({
        next: (res) => {
          this.serverData = res.rows;
          this.count = res.count;
          this.totalRecords = this.count;
          this.totalPages = this.limit ? Math.ceil(this.count / this.limit) : 0;
          this.onGetData.emit(res);
        },
        error: (err) => {
          console.error(err);
        },
        complete: () => {
          this.isLoading = false;
          this.initialLoad = false; 
        },
      });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['dataObject']?.currentValue) return;
    const isInitialLoad = changes['dataObject']?.firstChange ?? false;

    this.isLoading = true;
    this.limit = this.dataObject.params.limit;
    this.currentPage = this.dataObject.params?.offset;
    if (this.searchObj) {
      this.dataObject.params.search = { ...this.searchObj };
    }
    this.dataObject.params.offset = 0;
    this.tableService
      .getData(this.dataObject.apiPath, this.dataObject.params)
      .subscribe({
        next: (res) => {
          this.serverData = res.rows ?? [];
          this.count = res.count;
          this.totalRecords = this.count;
          this.totalPages = this.limit ? Math.ceil(this.count / this.limit) : 0;
          this.onGetData.emit(res);
        },
        complete: () => {
          this.isLoading = false;
          if (isInitialLoad && this.count > 0) {
            this.initialLoad = false;
          }
        },
      });
  }

  // ngOnInit(): void {
  //   // this.isLoading = true;
  //   this.tooltipService.closeTooltip$.subscribe(() => {
  //     setTimeout(() => {
  //       this.tooltip?.close?.();
  //       // Focus on dummy input to remove tooltip *****DONT REMOVE IT*****
  //       this.blurTarget.nativeElement.focus();
  //     });
  //   });

  //   if (!this.dataObject) {
  //     this.isLoading = false;
  //     return;
  //   }
  //   if (!this.dataObject.apiPath) {
  //     this.serverData = this.dataObject.data ?? [];
  //     this.count = this.serverData.length;
  //     this.totalRecords = this.count;
  //     this.totalPages = this.limit ? Math.ceil(this.count / this.limit) : 1;
  //     this.onGetData.emit({ rows: this.serverData, count: this.count });
  //     this.isLoading = false;
  //   } else {
  //     this.getData();
  //   }
  //   this.limit = this.dataObject.params.limit;

  //   this.getCount();
  //   this.getData();
  //   this.getCurrency();
  // }

  ngOnInit(): void {
    // Don’t call getData here, just setup initial values
    this.tooltipService.closeTooltip$.subscribe(() => {
      setTimeout(() => {
        this.tooltip?.close?.();
        this.blurTarget.nativeElement.focus();
      });
    });
  }

  search(value?: any) {
    if (value) {
      this.searchObj = value;
      this.dataObject.params.offset = 0;
      this.tableService
        .getData(this.dataObject.apiPath, {
          ...this.dataObject.params,
          search: { ...value },
        })
        .subscribe((res) => {
          this.serverData = res.rows;
          this.count = res.count;
          this.totalRecords = this.count;
          this.totalPages = this.limit ? Math.ceil(this.count / this.limit) : 0;
          this.onGetData.emit(res);
        });
    } else {
      this.dataObject.params.offset = 0;
      this.tableService
        .getData(this.dataObject.apiPath, this.dataObject.params)
        .subscribe((res) => {
          this.serverData = res.rows;
          this.count = res.count;
          this.totalRecords = this.count;
          this.totalPages = this.limit ? Math.ceil(this.count / this.limit) : 0;
          this.onGetData.emit(res);
        });
    }
  }

  onChangePage(event: any) {
    this.currentPage = event;

    console.log('🚀 ~ GridComponent ~ currentPage:', this.currentPage);

    this.getData();
  }

  getCount() {
    this.tableService.getData(this.dataObject.apiPath).subscribe((res) => {
      this.count = res.count;
      this.totalRecords = this.count;
      this.totalPages = this.limit ? Math.ceil(this.count / this.limit) : 0;
      this.onGetData.emit(res);
    });
  }

  getCurrency() {
    this.tableService.getDefaultCurrency().subscribe((res) => {
      this.currencySymbol = res.code;
    });
  }

  changeSort(event?: any, icon?: any, index?: number) {
    const iconsArray = this.sortIcon.toArray();
    const indexIcon = this.sortIconId.toArray();
    const allIconsId = indexIcon.filter(
      (e) => e.nativeElement.attributes.id.value != index
    );
    allIconsId.forEach((e) => {
      this.renderer.removeClass(e.nativeElement, 'fa-sort-up');
      this.renderer.removeClass(e.nativeElement, 'fa-sort-down');
    });
    const allIcons = iconsArray.filter(
      (e) => e.nativeElement.attributes.id.value != index
    );
    allIcons.forEach((e) => {
      this.renderer.removeClass(e.nativeElement, 'fa-sort-up');
      this.renderer.removeClass(e.nativeElement, 'fa-sort-down');
    });

    if (icon.classList.contains('fa-sort-down')) {
      icon.classList.remove('fa-sort-down');
      icon.classList.add('fa-sort-up');
    } else {
      icon.classList.add('fa-sort-down');
      icon.classList.remove('fa-sort-up');
    }

    // Ensure orderBy exists
    if (!this.dataObject.params.orderBy) {
      this.dataObject.params.orderBy = { column: null, type: 'ASC' } as any;
    }
    const previousColumn = this.dataObject.params.orderBy.column;
    const previousType = this.dataObject.params.orderBy.type;
    let newSortType: 'ASC' | 'DESC';
    if (previousColumn === event) {
      newSortType = previousType === 'ASC' ? 'DESC' : 'ASC';
    } else {
      newSortType = 'ASC';
    }

    this.dataObject.params.offset = 0;
    this.dataObject.params.orderBy.type = newSortType;
    this.dataObject.params.orderBy.column = event;
    if (this.searchObj) {
      this.dataObject.params.search = { ...this.searchObj };
    }

    this.tableService
      .getData(this.dataObject.apiPath, {
        ...this.dataObject.params,
      })
      .subscribe((res) => {
        this.serverData = res.rows ?? [];
        this.count = res.count;
        this.totalRecords = this.count;
        this.totalPages = this.limit ? Math.ceil(this.count / this.limit) : 0;
        this.onGetData.emit(res);
      });
  }

  getFileExtension(mimeType: string): string {
    const mimeToExtensionMap: { [key: string]: string } = {
      'application/pdf': 'pdf',
      'image/jpeg': 'jpg',
      'image/jpg': 'jpg',
      'image/png': 'png',
      'image/svg+xml': 'svg',
      'text/plain': 'txt',
      'text/html': 'html',
      'application/json': 'json',
      'application/xml': 'excel',
      'application/vnd.ms-excel': 'excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
        'excel',
      'application/msword': 'word',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        'word',
      'video/mp4': 'video',
      'video/webm': 'video',
      'video/ogg': 'video',
      'video/quicktime': 'video',
      // Add more mappings as needed
    };

    return mimeToExtensionMap[mimeType] || 'unknown'; // Default to 'unknown' if MIME type is not in the map
  }

  openedRowId: number = -1;
  dropdownPositionMap: {
    [key: number]: { top: string; instetInlineEnd: string; dir: string };
  } = {};
  dropdownRefsMap: {
    [key: number]: { buttonRef: HTMLElement; dropdownRef: HTMLElement };
  } = {};

  @HostListener('window:scroll')
  onScrollOrResize() {
    console.log('onScrollOrResize');
    if (this.openedRowId !== -1) {
      setTimeout(() => this.repositionDropdown(this.openedRowId), 0);
    }
  }

  toggleDropdown(
    event: MouseEvent,
    rowId: number,
    buttonRef: HTMLElement,
    dropdownRef: HTMLElement
  ) {
    console.log(buttonRef, dropdownRef);
    event.stopPropagation();

    const isOpen = this.openedRowId === rowId;
    console.log(rowId);
    this.openedRowId = isOpen ? -1 : rowId;

    if (isOpen) {
      delete this.dropdownRefsMap[rowId];
      return;
    }

    if (!isOpen) {
      setTimeout(() => {
        console.log('storing');
        this.dropdownRefsMap[rowId] = { buttonRef, dropdownRef };
        this.repositionDropdown(rowId);
      }, 0);
    }
  }

  repositionDropdown(rowId: number) {
    const storedRefs = this.dropdownRefsMap[rowId];
    if (!storedRefs) return;

    const buttonEl = storedRefs.buttonRef;
    const dropdownEl = storedRefs.dropdownRef;

    if (
      !document.body.contains(buttonEl) ||
      !document.body.contains(dropdownEl)
    ) {
      return;
    }

    const rect = buttonEl.getBoundingClientRect();
    const dropdownHeight = dropdownEl.offsetHeight;
    const dropdownWidth = dropdownEl.offsetWidth;
    const spaceBelow = window.innerHeight - rect.bottom;
    const openUpward = spaceBelow < dropdownHeight;

    this.dropdownPositionMap[rowId] = {
      top: openUpward
        ? `${rect.top - dropdownHeight - 10}px`
        : `${rect.bottom + 10}px`,
      instetInlineEnd: `${
        this.translate.currentLang === 'en'
          ? rect.right - dropdownWidth - 10
          : rect.left + 10
      }px`,
      dir: openUpward ? 'top' : 'bottom',
    };
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    if (this.openedRowId !== null) {
      const refs = this.dropdownRefsMap[this.openedRowId];
      if (!refs) return;

      const isClickInside =
        refs.buttonRef.contains(event.target as Node) ||
        refs.dropdownRef.contains(event.target as Node);

      if (!isClickInside) {
        this.openedRowId = -1;
      }
    }
  }

  handleScroll = () => {
    if (this.openedRowId !== -1) {
      this.repositionDropdown(this.openedRowId);
    }
  };

  handleResize = () => {
    if (this.openedRowId !== -1) {
      this.repositionDropdown(this.openedRowId);
    }
  };

  ngAfterViewInit(): void {
    const scrollContainer = document.querySelector(
      '.dashboard-layout'
    ) as HTMLElement;
    console.log(scrollContainer);
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', this.handleScroll);
    }

    window.addEventListener('resize', this.handleResize);
  }

  ngOnDestroy(): void {
    const scrollContainer = document.querySelector(
      '.dashboard-layout'
    ) as HTMLElement;
    if (scrollContainer) {
      scrollContainer.removeEventListener('scroll', this.handleScroll);
    }

    window.removeEventListener('resize', this.handleResize);
  }

  handleRowClick(row: any): void {
    if (this.onRowClick) {
      this.onRowClick(row);
    }
  }
}
