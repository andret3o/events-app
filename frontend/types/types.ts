export interface ApiResponse<T> {
  data?: T;
  message: string;
  success: boolean;
  timestamp: string;
  errors?: ApiError[];
}

export interface ApiError {
  field: string;
  message: string;
}

export interface PageableResponse<T> {
  content: T[];
  empty: boolean;
  first: boolean;
  last: boolean;
  number: number;
  numberOfElements: number;
  size: number;
  totalElements: number;
  totalPages: number;
  pageable: {
    offset: number;
    pageNumber: number;
    pageSize: number;
    paged: boolean;
    unpaged: boolean;
    sort: SortDetails;
  };
  sort: SortDetails;
}

interface SortDetails {
  empty: boolean;
  sorted: boolean;
  unsorted: boolean;
}

export interface AuthResponse {
  accessToken: string;
  expirationMs: number;
}
