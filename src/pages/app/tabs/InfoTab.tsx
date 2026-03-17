import * as React from "react";
import {
  Button,
  Input,
  Modal,
  notification,
  Select,
  Table,
  Tag,
} from "antd";
import { DeleteOutlined, SearchOutlined } from "@ant-design/icons";
import { AxiosInstance } from "axios";
import { IInfo } from "../../../types/childApp";
import { formatCurrency } from "../../../utils/format-money";
import { formatDate } from "../../../utils/day-format";
import { useInfoList } from "../../../hooks/useFetchListInfo";
import { Query } from "../../../types/queryListInfo";
import { useDebounce } from "../../../hooks/useDebounce";

interface Props {
  childRequest: AxiosInstance;
}

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  NOT_PAY: { label: "Chưa thanh toán", color: "warning" },
  PAYED: { label: "Đã thanh toán", color: "success" },
  OVER_DATE: { label: "Quá hạn", color: "error" },
};

export default function InfoTab({ childRequest }: Props) {
  const [query, setQuery] = React.useState<Query>({
    nameLike: "",
    phoneNumber: "",
    status: undefined,
    page: 1,
    limit: 10,
  });

  const queryDebounced = useDebounce(query, 500);

  const { list, total, loading, fetchList } = useInfoList(childRequest, queryDebounced);

  React.useEffect(() => {
    fetchList();
  }, [fetchList]);

  const handleDelete = React.useCallback(
    (record: IInfo) => {
      Modal.confirm({
        title: "Xóa thông tin?",
        content: `Tên: ${record.name}`,
        okText: "Xóa",
        okType: "danger",
        cancelText: "Hủy",
        centered: true,
        onOk: async () => {
          try {
            await childRequest.delete(`/v1/information/${record._id}`);
            notification.success({ message: "Xóa thành công" });
            fetchList();
          } catch (error: any) {
            notification.error({
              message: "Xóa thất bại",
              description: error?.response?.data?.message,
            });
          }
        },
      });
    },
    [childRequest, fetchList],
  );

  const columns = React.useMemo(
    () => [
      {
        title: "STT",
        render: (_: any, __: any, i: number) =>
          (query.page - 1) * query.limit + i + 1,
        width: 55,
      },
      {
        title: "Tên",
        dataIndex: "name",
        render: (t: string) => <span className="font-semibold">{t}</span>,
      },
      { title: "CCCD", dataIndex: "user_id" },
      {
        title: "SĐT",
        dataIndex: "phone_number",
        render: (t: string) => (
          <a href={`tel:${t}`} className="text-blue-600 underline">
            {t}
          </a>
        ),
      },
      {
        title: "Tiền vay",
        dataIndex: "loan_amount",
        render: formatCurrency,
      },
      {
        title: "Phải trả",
        dataIndex: "amount_payable",
        render: formatCurrency,
      },
      {
        title: "Ngày trả",
        dataIndex: "date_payable",
        render: formatDate,
      },
      {
        title: "Trạng thái",
        dataIndex: "status",
        align: "center" as const,
        render: (s: string) => {
          const m = STATUS_MAP[s] ?? {
            label: s,
            color: "default",
          };
          return <Tag color={m.color}>{m.label}</Tag>;
        },
      },
      {
        title: "",
        key: "del",
        render: (_: any, record: IInfo) => (
          <Button
            icon={<DeleteOutlined />}
            danger
            size="small"
            onClick={() => handleDelete(record)}
          />
        ),
      },
    ],
    [query.page, query.limit, handleDelete],
  );

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
        <Input
          placeholder="Tìm theo tên"
          allowClear
          style={{ width: 180 }}
          value={query.nameLike}
          onChange={(e) =>
            setQuery((p) => ({ ...p, nameLike: e.target.value }))
          }
          onPressEnter={fetchList}
        />
        <Input
          placeholder="Số điện thoại"
          allowClear
          style={{ width: 160 }}
          value={query.phoneNumber}
          onChange={(e) =>
            setQuery((p) => ({ ...p, phoneNumber: e.target.value }))
          }
          onPressEnter={fetchList}
        />
        <Select
          allowClear
          placeholder="Trạng thái"
          style={{ width: 160 }}
          value={query.status}
          onChange={(v) => setQuery((p) => ({ ...p, status: v }))}
        >
          <Select.Option value="NOT_PAY">Chưa thanh toán</Select.Option>
          <Select.Option value="PAYED">Đã thanh toán</Select.Option>
          <Select.Option value="OVER_DATE">Quá hạn</Select.Option>
        </Select>
        <Button
          type="primary"
          icon={<SearchOutlined />}
          onClick={() => setQuery((p) => ({ ...p, page: 1 }))}
        >
          Tìm kiếm
        </Button>
      </div>

      <Table<IInfo>
        rowKey="_id"
        columns={columns}
        dataSource={list}
        loading={loading}
        pagination={{
          current: query.page,
          pageSize: query.limit,
          total,
          onChange: (page, limit) => setQuery((p) => ({ ...p, page, limit })),
          showTotal: (t) => `Tổng ${t} bản ghi`,
        }}
      />
    </div>
  );
}
