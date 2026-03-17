import { notification } from "antd";
import { AxiosInstance } from "axios";
import React from "react";
import { IInfo } from "../types/childApp";
import { buildQueryParams } from "../utils/params";
import { Query } from "../types/queryListInfo";

function useInfoList(childRequest: AxiosInstance, query: Query) {
  const [list, setList] = React.useState<IInfo[]>([]);
  const [total, setTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(false);

  const fetchList = React.useCallback(async () => {
    try {
      setLoading(true);

      const res = await childRequest.get("/v1/information", {
        params: buildQueryParams(query),
      });

      setList(res.data.data.data);
      setTotal(res.data.data.total);
    } catch {
      notification.error({ message: "Lỗi tải danh sách thông tin" });
    } finally {
      setLoading(false);
    }
  }, [childRequest, query]);

  return { list, total, loading, fetchList };
}

export { useInfoList };
