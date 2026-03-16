import * as React from "react";
import {
  Button,
  Input,
  Modal,
  notification,
  Select,
  Table,
  TableProps,
  Tag,
} from "antd";
import { DeleteOutlined, SearchOutlined } from "@ant-design/icons";
import { AxiosInstance } from "axios";
import { IInfo } from "../../../types/childApp";
import { formatCurrency } from "../../../utils/format-money";
import { formatDate } from "../../../utils/day-format";

interface Props {
  childRequest: AxiosInstance;
}

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  NOT_PAY: { label: "Chưa thanh toán", color: "warning" },
  PAYED: { label: "Đã thanh toán", color: "success" },
  OVER_DATE: { label: "Quá hạn", color: "error" },
};

export default function InfoTab({ childRequest }: Props) {
  const [list, setList] = React.useState<IInfo[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [total, setTotal] = React.useState(0);
  const [query, setQuery] = React.useState({
    nameLike: "",
    phoneNumber: "",
    status: undefined as string | undefined,
    page: 1,
    limit: 10,
  });

  const fetchList = async () => {
    try {
      setLoading(true);
      const params: Record<string, unknown> = { page: query.page, limit: query.limit };
      if (query.nameLike) params.nameLike = query.nameLike;
      if (query.phoneNumber) params.phoneNumber = query.phoneNumber;
      if (query.status) params.status = query.status;
      const rs = await childRequest.get("/v1/information", { params });
      setList(rs.data.data.data);
      setTotal(rs.data.data.total);
    } catch {
      notification.error({ message: "Lỗi tải danh sách thông tin" });
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchList();
  }, [query.page, query.limit]);

  const handleDelete = (record: IInfo) => {
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
  };

  const columns: TableProps<IInfo>["columns"] = [
    {
      title: "STT",
      render: (_, __, i) => (query.page - 1) * query.limit + i + 1,
      width: 55,
    },
    {
      title: "Tên",
      dataIndex: "name",
      render: (t) => <span className="font-semibold">{t}</span>,
    },
    { title: "CCCD", dataIndex: "user_id" },
    {
      title: "Số điện thoại",
      dataIndex: "phone_number",
      render: (t) => (
        <a href={`tel:${t}`} className="text-blue-600 underline">
          {t}
        </a>
      ),
    },
    {
      title: "Số tiền vay",
      dataIndex: "loan_amount",
      render: (v) => formatCurrency(v),
    },
    {
      title: "Phải trả",
      dataIndex: "amount_payable",
      render: (v) => formatCurrency(v),
    },
    {
      title: "Ngày phải trả",
      dataIndex: "date_payable",
      render: (t) => formatDate(t),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      align: "center",
      render: (s: string) => {
        const m = STATUS_MAP[s] ?? { label: s, color: "default" };
        return <Tag color={m.color}>{m.label}</Tag>;
      },
    },
    {
      title: "",
      key: "del",
      render: (_, record) => (
        <Button
          icon={<DeleteOutlined />}
          danger
          size="small"
          onClick={() => handleDelete(record)}
        />
      ),
    },
  ];

  return (
    <div>
      {/* Filter bar */}
      <div className="flex flex-wrap gap-2 mb-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
        <Input
          placeholder="Tìm theo tên"
          allowClear
          style={{ width: 180 }}
          value={query.nameLike}
          onChange={(e) => setQuery((p) => ({ ...p, nameLike: e.target.value }))}
          onPressEnter={fetchList}
        />
        <Input
          placeholder="Số điện thoại"
          allowClear
          style={{ width: 160 }}
          value={query.phoneNumber}
          onChange={(e) => setQuery((p) => ({ ...p, phoneNumber: e.target.value }))}
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
