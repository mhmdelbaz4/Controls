/** Local-only grid: full dataset + page size; paging is applied in the component. */
export interface SimpleGridModel<T = Record<string, unknown>> {
  elements: T[];
  pageSize: number;
}
