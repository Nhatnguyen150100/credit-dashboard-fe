import { Query } from "../types/queryListInfo";

const buildQueryParams = (query: Query) => {
  const params: Record<string, unknown> = {
    page: query.page,
    limit: query.limit,
  };

  if (query.nameLike) params.nameLike = query.nameLike;
  if (query.phoneNumber) params.phoneNumber = query.phoneNumber;
  if (query.status) params.status = query.status;

  return params;
};

export { buildQueryParams };
