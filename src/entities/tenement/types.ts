export type TenementSearchFilter = {
  sort?: string;
  rent?: [number | null, number | null];
  type?: number[];
  rentType?: string[];
  withinId?: string[];
  showPriceOnRequest?: boolean;
  near?: {
    coordinates: [number, number];
    radius?: number;
  };
  bbox?: [number, number, number, number];
};

export type TenementSearchPaging = {
  pageSize: number;
  page: number;
};

export type TenementSearchRequest = {
  filter: TenementSearchFilter;
  paging: TenementSearchPaging;
};

export type TenementMedia = {
  type: string;
  cdnUrl: string;
  bluredDataURL?: string;
  id: number;
};

export type TenementOwner = {
  country: string;
  name: string;
  email: string | null;
  countProperties: number;
};

export type TenementUser = {
  externalId: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  phone: string | null;
  imageUrl: string | null;
};

export type Tenement = {
  id: number;
  title: string;
  abstract?: string;
  address: string | null;
  zip: string;
  city: string;
  country: string;
  rooms: number | null;
  roomsBed: number | null;
  roomsBath: number | null;
  size: number;
  rent: number;
  rentUtilities: number;
  rentFull: number;
  rentDeposit: number;
  location: [number, number];
  createdAt: string;
  updatedAt: string;
  type: number;
  subType: number;
  rentType: string;
  availableFrom: string | null;
  floor: string | null;
  media?: TenementMedia[];
  owner?: TenementOwner;
  user?: TenementUser;
  tags?: string[];
  earliestAppointment?: string | null;
  isFavorite?: boolean;
};

export type TenementSearchResponse = {
  res?: Tenement[];
  total?: number;
  page?: number;
  pageSize?: number;
};

export type TenementHistogramResponse = {
  range: [number, number];
  histogram: number[];
};

export type TenementCountResponse = {
  count: number;
};
