import type { SimpleGridModel } from '../grid/simple-grid/simple-grid.model';

/** Same as `SimpleGridModel`: local rows + page size; search, sort, and paging are client-side. */
export type SearchableSortedGridModel<T = Record<string, unknown>> = SimpleGridModel<T>;
