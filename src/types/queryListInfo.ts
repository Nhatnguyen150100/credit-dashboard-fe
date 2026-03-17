export interface Query {
  nameLike: string;
  phoneNumber: string;
  status?: string;
  page: number;
  limit: number;
}
