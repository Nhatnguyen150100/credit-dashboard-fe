import * as React from "react";
import {
  Button,
  Empty,
  Form,
  Input,
  InputNumber,
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
import { Link, useNavigate } from "react-router-dom";
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
  const [appMeta, setAppMeta] = React.useState<Record<string, { iconUrl: string | null; title: string | null }>>({});
  const [fetchingMeta, setFetchingMeta] = React.useState(false);

  const fetchAllMeta = async (apps: IChildApp[]) => {
    if (apps.length === 0) return;
    const results = await Promise.allSettled(
      apps.map((app) => axiosRequest.get(`/v1/child-apps/${app._id}/meta`))
    );
    setAppMeta((prev) => {
      const next = { ...prev };
      results.forEach((result, i) => {
        next[apps[i]._id] = result.status === "fulfilled"
          ? result.value.data.data
          : { iconUrl: null, title: null };
      });
      return next;
    });
  };

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
      fetchAllMeta(apps);
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

  const handleDomainBlur = async () => {
    let domain = connectForm.getFieldValue("appDomain")?.trim();
    if (!domain) return;

    domain = domain.replace(/^https?:\/\//i, "").split("/")[0];
    connectForm.setFieldsValue({ appDomain: domain });

    try {
      setFetchingMeta(true);
      const rs = await axiosRequest.get("/v1/child-apps/fetch-meta", { params: { domain } });
      const { title } = rs.data.data;
      if (title && !connectForm.getFieldValue("appName")) {
        connectForm.setFieldsValue({ appName: title });
      }
    } finally {
      setFetchingMeta(false);
    }
  };

  const handleConnect = async (values: { appName: string; appDomain: string; port: number }) => {
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
      content: `App: ${record.appName} (${record.appDomain}:${record.port})`,
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
      title: "Icon",
      key: "icon",
      width: 150,
      align: "center",
      render: (_, record) => {
        const meta = appMeta[record._id];
        if (!meta) return <Spin size="small" />;
        return meta.iconUrl ? (
          <img
            src={meta.iconUrl}
            alt="icon"
            className="w-7 h-7 object-contain mx-auto rounded"
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
          />
        ) : null;
      },
    },
    {
      title: "Tên ứng dụng",
      dataIndex: "appName",
      key: "appName",
      render: (text) => <span className="font-semibold text-base">{text}</span>,
    },
    {
      title: "Domain (IP)",
      key: "appDomain",
      render: (_, record) => (
        <Link
          to={`http://${record.appDomain}`}
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono text-blue-700 underline"
          onClick={(e) => e.stopPropagation()}
        >
          {record.appDomain}
        </Link>
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
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <ApiOutlined />
          Quản lý danh sách ứng dụng
        </h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            connectForm.resetFields();
            setConnectOpen(true);
          }}
        >
          Kết nối ứng dụng mới
        </Button>
      </div>

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

      <Modal
        title={
          <span className="flex items-center gap-2">
            <ApiOutlined /> Kết nối ứng dụng con mới
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
        <Form
          form={connectForm}
          layout="vertical"
          onFinish={handleConnect}
          initialValues={{ port: 8081 }}
        >
          <Form.Item
            label="Domain (IPv4 của VPS)"
            name="appDomain"
            rules={[{ required: true, message: "Vui lòng nhập domain/IP" }]}
          >
            <Input placeholder="Ví dụ: 103.72.xxx.xxx" onBlur={handleDomainBlur} />
          </Form.Item>
          <Form.Item
            label="Tên ứng dụng"
            name="appName"
            rules={[{ required: true, message: "Vui lòng nhập tên app" }]}
          >
            <Input placeholder="Ví dụ: credit-be-vn" suffix={fetchingMeta ? <Spin size="small" /> : null} />
          </Form.Item>
          <Form.Item
            label="Port"
            name="port"
            rules={[{ required: true, message: "Vui lòng nhập port" }]}
            extra="Trường này đã được cấu hình sẵn, thông thường không cần thay đổi."
          >
            <InputNumber min={1} max={65535} className="w-full" />
          </Form.Item>
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

      <Modal
        title="Đổi tên ứng dụng"
        open={editOpen}
        onCancel={() => setEditOpen(false)}
        footer={null}
        centered
      >
        <Form form={editForm} layout="vertical" onFinish={handleUpdate}>
          <Form.Item
            label="Tên ứng dụng mới"
            name="appName"
            rules={[{ required: true, message: "Vui lòng nhập tên ứng dụng" }]}
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
