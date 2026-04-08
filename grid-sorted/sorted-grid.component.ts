import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Input,
  computed,
  signal,
} from '@angular/core';
import { SortedGridModel } from './sorted-grid.model';

function compareValues(a: unknown, b: unknown): number {
  if (a === b) return 0;
  if (a === null || a === undefined) return 1;
  if (b === null || b === undefined) return -1;
  if (typeof a === 'number' && typeof b === 'number' && !Number.isNaN(a) && !Number.isNaN(b)) {
    return a < b ? -1 : a > b ? 1 : 0;
  }
  if (typeof a === 'boolean' && typeof b === 'boolean') {
    return a === b ? 0 : a ? 1 : -1;
  }
  return String(a).localeCompare(String(b), undefined, {
    numeric: true,
    sensitivity: 'base',
  });
}

@Component({
  selector: 'ctrl-sorted-grid',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sorted-grid.component.html',
  styleUrl: './sorted-grid.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SortedGridComponent {
  readonly currentPage = signal(1);
  readonly sortColumn = signal<string | null>(null);
  readonly sortDir = signal<'asc' | 'desc'>('asc');

  private readonly _grid = signal<SortedGridModel | null>(null);

  @Input({ required: true })
  set grid(value: SortedGridModel) {
    this._grid.set(value);
    this.currentPage.set(1);
    this.sortColumn.set(null);
    this.sortDir.set('asc');
  }

  readonly pageSize = computed(() => this._grid()?.pageSize ?? 1);

  readonly elements = computed(() => this._grid()?.elements ?? []);

  readonly columnKeys = computed((): string[] => {
    const rows = this.elements();
    if (rows.length === 0) return [];
    const first = rows[0];
    if (first !== null && typeof first === 'object' && !Array.isArray(first)) {
      return Object.keys(first as object);
    }
    return ['value'];
  });

  readonly sortedElements = computed(() => {
    const list = this.elements();
    const col = this.sortColumn();
    if (!col || list.length === 0) {
      return list;
    }
    const dir = this.sortDir();
    const copy = [...list];
    copy.sort((a, b) => {
      const c = compareValues(this.rawCell(a, col), this.rawCell(b, col));
      return dir === 'asc' ? c : -c;
    });
    return copy;
  });

  readonly totalPages = computed(() => {
    const list = this.sortedElements();
    const size = Math.max(1, this.pageSize());
    return Math.max(1, Math.ceil(list.length / size));
  });

  readonly pagedElements = computed(() => {
    const list = this.sortedElements();
    const size = Math.max(1, this.pageSize());
    const page = Math.min(Math.max(1, this.currentPage()), this.totalPages());
    const start = (page - 1) * size;
    return list.slice(start, start + size);
  });

  rawCell(row: unknown, key: string): unknown {
    if (key === 'value') {
      return row;
    }
    if (row !== null && typeof row === 'object' && key in (row as object)) {
      return (row as Record<string, unknown>)[key];
    }
    return undefined;
  }

  cellValue(row: unknown, key: string): string {
    const v = this.rawCell(row, key);
    if (v === null || v === undefined) return '';
    if (typeof v === 'object') return JSON.stringify(v);
    return String(v);
  }

  onSortColumn(key: string): void {
    if (this.sortColumn() === key) {
      this.sortDir.update((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      this.sortColumn.set(key);
      this.sortDir.set('asc');
    }
    this.currentPage.set(1);
  }

  ariaSort(key: string): 'ascending' | 'descending' | 'none' {
    if (this.sortColumn() !== key) return 'none';
    return this.sortDir() === 'asc' ? 'ascending' : 'descending';
  }

  goPrev(): void {
    this.currentPage.update((p) => Math.max(1, p - 1));
  }

  goNext(): void {
    const max = this.totalPages();
    this.currentPage.update((p) => Math.min(max, p + 1));
  }

  canPrev = computed(() => this.currentPage() > 1);
  canNext = computed(() => this.currentPage() < this.totalPages());
}
