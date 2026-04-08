import type { SimpleGridModel } from '../grid/simple-grid/simple-grid.model';

/** Same shape as `SimpleGridModel`: local data + page size; sorting is UI-only. */
export type SortedGridModel<T = Record<string, unknown>> = SimpleGridModel<T>;
