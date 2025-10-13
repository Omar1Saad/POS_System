export interface DataResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
export interface PaginationResponse {
    page: number;
    limit: number;
}
export interface DeleteResponse {
    message: string;
}
