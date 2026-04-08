import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Input,
  computed,
  signal,
} from '@angular/core';
import { SimpleGridModel } from './simple-grid.model';

@Component({
  selector: 'ctrl-simple-grid',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './simple-grid.component.html',
  styleUrl: './simple-grid.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SimpleGridComponent {
  /** 1-based current page */
  readonly currentPage = signal(1);

  private readonly _grid = signal<SimpleGridModel | null>(null);

  @Input({ required: true })
  set grid(value: SimpleGridModel) {
    this._grid.set(value);
    this.currentPage.set(1);
  }

  readonly pageSize = computed(() => this._grid()?.pageSize ?? 1);

  readonly elements = computed(() => this._grid()?.elements ?? []);

  readonly totalPages = computed(() => {
    const list = this.elements();
    const size = Math.max(1, this.pageSize());
    return Math.max(1, Math.ceil(list.length / size));
  });

  readonly pagedElements = computed(() => {
    const list = this.elements();
    const size = Math.max(1, this.pageSize());
    const page = Math.min(Math.max(1, this.currentPage()), this.totalPages());
    const start = (page - 1) * size;
    return list.slice(start, start + size);
  });

  /** Column keys from first row in the full list (stable across pages). */
  readonly columnKeys = computed((): string[] => {
    const rows = this.elements();
    if (rows.length === 0) return [];
    const first = rows[0];
    if (first !== null && typeof first === 'object' && !Array.isArray(first)) {
      return Object.keys(first as object);
    }
    return ['value'];
  });

  cellValue(row: unknown, key: string): string {
    if (key === 'value') {
      if (row === null || row === undefined) return '';
      if (typeof row === 'object') return JSON.stringify(row);
      return String(row);
    }
    if (row !== null && typeof row === 'object' && key in (row as object)) {
      const v = (row as Record<string, unknown>)[key];
      if (v === null || v === undefined) return '';
      if (typeof v === 'object') return JSON.stringify(v);
      return String(v);
    }
    return '';
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
