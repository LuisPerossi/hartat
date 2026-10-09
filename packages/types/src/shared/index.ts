export interface BaseApiResponse<T = never>{
    message: string,
    data?: T
}

export interface MessageOnlyResponse extends Omit<BaseApiResponse, 'data'> {}

export interface Pagination {
    currentPage: number,
    perPage: number,
    totalPages: number,
    totalRecords: number
}