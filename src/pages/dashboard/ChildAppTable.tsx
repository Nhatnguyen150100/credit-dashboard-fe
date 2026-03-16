import * as React from "react";
import {
  Button,
  Empty,
  Form,
  Input,
  Modal,
  notification,
  Spin,
  Table,
  TableProps,
  Tag,
  Tooltip,
} from "antd";
import {
  ApiOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  SyncOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import axiosRequest from "../../plugins/request";
import { IChildApp } from "../../types/childApp";
import { formatDate } from "../../utils/day-format";
import Visibility from "../../components/Visibility";

export default function ChildAppTable() {
  const navigate = useNavigate();
  const [list, setList] = React.useState<IChildApp[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [total, setTotal] = React.useState(0);
  const [page, setPage] = React.useState(1);
  const [limit] = React.useState(10);

  const [connectOpen, setConnectOpen] = React.useState(false);
  const [connectLoading, setConnectLoading] = React.useState(false);
  const [connectForm] = Form.useForm();

  const [editOpen, setEditOpen] = React.useState(false);
  const [editLoading, setEditLoading] = React.useState(false);
  const [editTarget, setEditTarget] = React.useState<IChildApp | null>(null);
  const [editForm] = Form.useForm();

  const [actionLoadingId, setActionLoadingId] = React.useState<string | null>(null);
  const [checkingAll, setCheckingAll] = React.useState(false);

  const checkAllStatuses = async (apps: IChildApp[]) => {
    if (apps.length === 0) return;
    setCheckingAll(true);
    const results = await Promise.allSettled(
      apps.map((app) => axiosRequest.get(`/v1/child-apps/${app._id}/status`))
    );
    setList((prev) => {
      const updated = [...prev];
      results.forEach((result, i) => {
        if (result.status === "fulfilled") {
          const fresh: IChildApp = result.value.data.data;
          const idx = updated.findIndex((a) => a._id === apps[i]._id);
          if (idx !== -1) updated[idx] = { ...updated[idx], ...fresh };
        }
      });
      return updated;
    });
    setCheckingAll(false);
  };

  const fetchList = async (withStatusCheck = false) => {
    try {
      setLoading(true);
      const rs = await axiosRequest.get("/v1/child-apps", {
        params: { page, limit },
      });
      const apps: IChildApp[] = rs.data.data;
      setList(apps);
      setTotal(rs.data.totalItems);
      if (withStatusCheck) {
        checkAllStatuses(apps);
      }
    } catch {
      notification.error({ message: "Lỗi tải danh sách child apps" });
    } finally {
      setLoading(false);
    }
  };

  const isFirstLoad = React.useRef(true);

  React.useEffect(() => {
    fetchList(isFirstLoad.current);
    isFirstLoad.current = false;
  }, [page]);

  const handleConnect = async (values: { appName: string; appDomain: string }) => {
    try {
      setConnectLoading(true);
      const rs = await axiosRequest.post("/v1/child-apps/connect", values);
      notification.success({ message: rs.data.message || "Kết nối thành công" });
      connectForm.resetFields();
      setConnectOpen(false);
      fetchList();
    } catch (error: any) {
      notification.error({
        message: "Kết nối thất bại",
        description: error?.response?.data?.message,
      });
    } finally {
      setConnectLoading(false);
    }
  };

  const handleOpenEdit = (record: IChildApp) => {
    setEditTarget(record);
    editForm.setFieldsValue({ appName: record.appName });
    setEditOpen(true);
  };

  const handleUpdate = async (values: { appName: string }) => {
    if (!editTarget) return;
    try {
      setEditLoading(true);
      const rs = await axiosRequest.put(`/v1/child-apps/${editTarget._id}`, values);
      notification.success({ message: rs.data.message || "Cập nhật thành công" });
      setEditOpen(false);
      fetchList();
    } catch (error: any) {
      notification.error({
        message: "Cập nhật thất bại",
        description: error?.response?.data?.message,
      });
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = (record: IChildApp) => {
    Modal.confirm({
      title: "Xóa child app?",
      content: `App: ${record.appName} (${record.appDomain})`,
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      centered: true,
      onOk: async () => {
        try {
          const rs = await axiosRequest.delete(`/v1/child-apps/${record._id}`);
          notification.success({ message: rs.data.message || "Đã xóa" });
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

  const handleCheckStatus = async (record: IChildApp) => {
    try {
      setActionLoadingId(record._id + "_status");
      const rs = await axiosRequest.get(`/v1/child-apps/${record._id}/status`);
      const status = rs.data.data?.appStatus;
      notification.info({
        message: `Trạng thái: ${status === "online" ? "🟢 Online" : "🔴 Offline"}`,
        description: `App: ${record.appName}`,
      });
      fetchList();
    } catch (error: any) {
      notification.error({
        message: "Kiểm tra trạng thái thất bại",
        description: error?.response?.data?.message,
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  const columns: TableProps<IChildApp>["columns"] = [
    {
      title: "STT",
      render: (_, __, index) => (page - 1) * limit + index + 1,
      width: 60,
    },
    {
      title: "Tên App",
      dataIndex: "appName",
      key: "appName",
      render: (text) => <span className="font-semibold text-base">{text}</span>,
    },
    {
      title: "Domain (IP)",
      dataIndex: "appDomain",
      key: "appDomain",
      render: (text) => (
        <span className="font-mono text-gray-700">{text}</span>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "appStatus",
      key: "appStatus",
      align: "center",
      render: (status: string) =>
        checkingAll ? (
          <Tag icon={<SyncOutlined spin />} color="processing">Đang kiểm tra</Tag>
        ) : status === "online" ? (
          <Tag color="success">Online</Tag>
        ) : (
          <Tag color="error">Offline</Tag>
        ),
    },
    {
      title: "Ngày thêm",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (text) => <span className="text-sm text-gray-500">{formatDate(text)}</span>,
    },
    {
      title: "Thao tác",
      key: "actions",
      render: (_, record) => (
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <Tooltip title="Kiểm tra trạng thái">
            <Button
              icon={<SyncOutlined />}
              size="small"
              loading={actionLoadingId === record._id + "_status"}
              onClick={() => handleCheckStatus(record)}
            />
          </Tooltip>
          <Tooltip title="Đổi tên">
            <Button
              icon={<EditOutlined />}
              size="small"
              onClick={() => handleOpenEdit(record)}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Button
              icon={<DeleteOutlined />}
              size="small"
              danger
              onClick={() => handleDelete(record)}
            />
          </Tooltip>
        </div>
      ),
    },
  ];

  return (
    <>
      {/* Header row */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <ApiOutlined />
          Quản lý danh sách ứng dụng
        </h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setConnectOpen(true)}
        >
          Kết nối ứng dụng mới
        </Button>
      </div>

      {/* Table */}
      <Visibility
        visibility={list.length > 0 || loading}
        suspenseComponent={<Empty description="Chưa có child app nào" />}
      >
        <Table<IChildApp>
          rowKey="_id"
          columns={columns}
          dataSource={list}
          loading={loading ? { indicator: <Spin /> } : false}
          onRow={(record) => ({
            onClick: () => {
              if (record.appStatus === "online") {
                navigate(`/app/${record._id}`);
              }
            },
            style: {
              cursor: record.appStatus === "online" ? "pointer" : "default",
            },
          })}
          pagination={{
            current: page,
            pageSize: limit,
            total,
            onChange: (p) => setPage(p),
            showTotal: (t) => `Tổng ${t} app`,
          }}
        />
      </Visibility>

      {/* Connect Modal */}
      <Modal
        title={
          <span className="flex items-center gap-2">
            <ApiOutlined /> Kết nối Child App mới
          </span>
        }
        open={connectOpen}
        onCancel={() => {
          setConnectOpen(false);
          connectForm.resetFields();
        }}
        footer={null}
        centered
      >
        <Form form={connectForm} layout="vertical" onFinish={handleConnect}>
          <Form.Item
            label="Tên App"
            name="appName"
            rules={[{ required: true, message: "Vui lòng nhập tên app" }]}
          >
            <Input placeholder="Ví dụ: credit-be-vn" />
          </Form.Item>
          <Form.Item
            label="Domain (IPv4 của VPS)"
            name="appDomain"
            rules={[{ required: true, message: "Vui lòng nhập domain/IP" }]}
          >
            <Input placeholder="Ví dụ: 103.72.xxx.xxx:8081" />
          </Form.Item>
          <p className="text-gray-400 text-xs mb-4">
            Hệ thống sẽ tự động đăng nhập bằng SUPERVISOR_USERNAME/PASSWORD cấu hình trên server.
          </p>
          <div className="flex justify-end gap-2">
            <Button
              onClick={() => {
                setConnectOpen(false);
                connectForm.resetFields();
              }}
            >
              Hủy
            </Button>
            <Button type="primary" htmlType="submit" loading={connectLoading}>
              Kết nối
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        title="Đổi tên App"
        open={editOpen}
        onCancel={() => setEditOpen(false)}
        footer={null}
        centered
      >
        <Form form={editForm} layout="vertical" onFinish={handleUpdate}>
          <Form.Item
            label="Tên App mới"
            name="appName"
            rules={[{ required: true, message: "Vui lòng nhập tên app" }]}
          >
            <Input />
          </Form.Item>
          <div className="flex justify-end gap-2">
            <Button onClick={() => setEditOpen(false)}>Hủy</Button>
            <Button type="primary" htmlType="submit" loading={editLoading}>
              Cập nhật
            </Button>
          </div>
        </Form>
      </Modal>
    </>
  );
}
