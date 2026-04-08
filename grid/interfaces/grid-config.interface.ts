type SortDirection = 'asc' | 'desc' | 'ASC' | 'DESC';

export interface IGridConfig {
  uniqueKey?: string;
  data?: any[];
  apiPath: string;
  showIndex?: boolean;
  params: {
    search?: any;
    limit: number;
    offset: number;
    for?: string;
    orderBy: {
      column: string;
      type: SortDirection;
    };
  };
  sorttable?: boolean;
  draggable?: boolean;
  columns: Column[];
}

export interface Column {
  keys?: Array<{ type: string; [key: string]: any }>;
  key: string;
  multiKeys?: { arKey: string; enKey: string };
  subKey?: string;
  subKeys?: string;
  header?: string;
  headerEn?: string;
  tooltip?: string;
  tooltipEn?: string;
  unit?: {
    type: 'from_client' | 'from_key';
    key?: string;
    unitObject: { [key: string]: string };
    config: { arKey: string; enKey: string };
  };
  infoIcon?: { icon?: string; ar: string; en: string };
  permissions?: string[];
  strictPermissionsCheck?: boolean;
  width?: number;
  height?: number;
  draggable?: boolean;
  sorttable?: boolean;
  type:
    | 'text'
    | 'image'
    | 'date'
    | 'number'
    | 'price'
    | 'url'
    | 'video_url'
    | 'color'
    | 'toggle'
    | 'status'
    | 'text_image'
    | 'multiple_keys'
    | 'subkeys'
    | 'actions'
    | 'multiple_values'
    | 'multiple_Attachments';
  urlConfig?: { textKey?: string; urlKey?: string; targetcolumnKey?: string };
  textImageConfig?: { arKey: string; enKey: string; imageKey: string };
  videoUrlConfig?: { ar: string; en: string };
  imagePathPrefix?: string;
  classes?: string;
  statusConfig?: StatusConfig;
  toggleConfig?: ToggleConfig;
  actions?: Action[];
  hide?: boolean;
  popupTitle?: { ar: string; en: string };
  popupSubTitle?: { ar: string; en: string };
  noDataMessageAr?: string;
  noDataMessageEn?: string;
  attachmentsConfig?: {
    attachmentTypeKey?: string;
    function?: (data?: any, dataObject?: any) => void;
  };
  formatter?: (value: any, row?: any, locale?: string) => string;
}

export interface StatusConfig {
  [key: string]: {
    text: string;
    textEn?: string;
    tooltip?: string;
    tooltipEn?: string;
    imagePath?: string;
    classes?: string;
    function: (data?: any, dataObject?: any) => void;
  };
}

export interface ToggleConfig {
  [key: string]: {
    classes?: string;
    function: (
      data?: any,
      dataObject?: any,
      element?: any,
      item?: any,
      items?: any
    ) => void;
    tooltip?: string;
    tooltipEn?: string;
  };
}

export interface Action {
  type: 'keyAction' | 'rowAction';
  key?: string;
  icon?: string;
  permissions?: string[];
  config?: {
    [key: string]: {
      imagePath: string;
      classes: string;
      function: (
        data?: any,
        dataObject?: any,
        element?: any,
        item?: any,
        items?: any
      ) => void;
      tooltip?: string;
      tooltipEn?: string;
    };
  };
  checkAllPermissions?: boolean;
  disabled?: boolean;
  imagePath?: string;
  classes?: string;
  tooltip?: string;
  tooltipEn?: string;
  text?: string;
  function: (
    data?: any,
    dataObject?: any,
    element?: any,
    item?: any,
    items?: any
  ) => void;
}
