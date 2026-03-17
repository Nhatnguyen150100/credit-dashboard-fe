import * as React from "react";
import {
  Button,
  Form,
  Input,
  message,
  Modal,
  Pagination,
  Popconfirm,
  Select,
  Switch,
  Table,
  Tag,
} from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  KeyOutlined,
  PlusOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { AxiosInstance } from "axios";
import { IAdminUser } from "../../../types/childApp";

interface Props {
  childRequest: AxiosInstance;
}

const PERMISSIONS = ["CREATE", "UPDATE", "DELETE"];

function AdminList({ childRequest }: Props) {
  const [users, setUsers] = React.useState<IAdminUser[]>([]);
  const [total, setTotal] = React.useState(0);
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(10);
  const [search, setSearch] = React.useState("");

  const [createOpen, setCreateOpen] = React.useState(false);
  const [editOpen, setEditOpen] = React.useState(false);
  const [editTarget, setEditTarget] = React.useState<IAdminUser | null>(null);
  const [editPermissions, setEditPermissions] = React.useState<string[]>([]);

  const [createForm] = Form.useForm();
  const [editForm] = Form.useForm();

  const fetchUsers = async () => {
    try {
      const rs = await childRequest.get("/v1/admin", {
        params: { page, limit, nameLike: search || undefined },
      });
      setUsers(rs.data.data);
      setTotal(rs.data.totalItems ?? rs.data.data.length);
    } catch {
      message.error("Lỗi tải danh sách ADMIN");
    }
  };

  React.useEffect(() => {
    fetchUsers();
  }, [page, limit, search]);

  const handleCreate = async (values: { userName: string; password: string }) => {
    try {
      await childRequest.post("/v1/admin/create-user", values);
      message.success("Tạo tài khoản thành công");
      setCreateOpen(false);
      createForm.resetFields();
      fetchUsers();
    } catch (error: any) {
      message.error(error?.response?.data?.message || "Tạo thất bại");
    }
  };

  const handleOpenEdit = (record: IAdminUser) => {
    setEditTarget(record);
    editForm.setFieldsValue({ userName: record.userName });
    setEditPermissions(record.permissions.filter((p) => p !== "ALL_PERMISSION"));
    setEditOpen(true);
  };

  const handleEdit = async (values: { userName: string }) => {
    if (!editTarget) return;
    try {
      await childRequest.put(`/v1/admin/update-user/${editTarget._id}`, {
        id: editTarget._id,
        userName: values.userName,
        permissions: editPermissions,
      });
      message.success("Cập nhật thành công");
      setEditOpen(false);
      fetchUsers();
    } catch (error: any) {
      message.error(error?.response?.data?.message || "Cập nhật thất bại");
    }
  };

  const handleDelete = async (record: IAdminUser) => {
    try {
      await childRequest.delete(`/v1/admin/delete-user/${record._id}`);
      message.success("Xóa tài khoản thành công");
      fetchUsers();
    } catch (error: any) {
      message.error(error?.response?.data?.message || "Xóa thất bại");
    }
  };

  const columns = [
    { title: "Tên đăng nhập", dataIndex: "userName" },
    {
      title: "Vai trò",
      dataIndex: "role",
      render: () => <Tag color="geekblue">ADMIN</Tag>,
    },
    {
      title: "Quyền",
      dataIndex: "permissions",
      render: (perms: string[]) => (
        <div className="flex gap-1 flex-wrap">
          {perms
            .filter((p) => p !== "ALL_PERMISSION")
            .map((p) => (
              <Tag key={p} color={p === "DELETE" ? "red" : p === "UPDATE" ? "orange" : "green"}>
                {p}
              </Tag>
            ))}
        </div>
      ),
    },
    {
      title: "Thao tác",
      render: (_: unknown, record: IAdminUser) => (
        <div className="flex gap-2">
          <Button size="small" icon={<EditOutlined />} onClick={() => handleOpenEdit(record)} />
          <Popconfirm
            title={`Xóa "${record.userName}"?`}
            okText="Xóa"
            okType="danger"
            cancelText="Hủy"
            onConfirm={() => handleDelete(record)}
          >
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <Input
          placeholder="Tìm theo tên..."
          prefix={<SearchOutlined />}
          allowClear
          style={{ width: 240 }}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        />
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateOpen(true)}>
          Thêm ADMIN
        </Button>
      </div>
      <Table columns={columns} dataSource={users} rowKey="_id" pagination={false} />
      <div className="mt-3 flex justify-between items-center">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          Số bản ghi/trang:
          <Select value={limit} onChange={(v) => { setLimit(v); setPage(1); }} size="small"
            options={[{ value: 10, label: "10" }, { value: 20, label: "20" }]} />
        </div>
        <Pagination current={page} total={total} pageSize={limit} onChange={setPage}
          showSizeChanger={false} showTotal={(t) => `Tổng ${t}`} />
      </div>

      <Modal title="Thêm ADMIN mới" open={createOpen}
        onCancel={() => { setCreateOpen(false); createForm.resetFields(); }}
        footer={null} centered destroyOnClose>
        <Form form={createForm} layout="vertical" onFinish={handleCreate}>
          <Form.Item label="Tên đăng nhập" name="userName"
            rules={[{ required: true, message: "Vui lòng nhập tên đăng nhập" }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Mật khẩu" name="password"
            rules={[{ required: true }, { min: 6, message: "Tối thiểu 6 ký tự" }]}>
            <Input.Password />
          </Form.Item>
          <div className="flex justify-end gap-2">
            <Button onClick={() => { setCreateOpen(false); createForm.resetFields(); }}>Hủy</Button>
            <Button type="primary" htmlType="submit">Tạo</Button>
          </div>
        </Form>
      </Modal>

      <Modal title={`Chỉnh sửa: ${editTarget?.userName}`} open={editOpen}
        onCancel={() => setEditOpen(false)} footer={null} centered destroyOnClose>
        <Form form={editForm} layout="vertical" onFinish={handleEdit}>
          <Form.Item label="Tên đăng nhập" name="userName"
            rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Quyền hạn">
            <div className="flex flex-col gap-2">
              {PERMISSIONS.map((p) => (
                <div key={p} className="flex items-center gap-2">
                  <Switch
                    size="small"
                    checked={editPermissions.includes(p)}
                    onChange={(checked) =>
                      setEditPermissions((prev) =>
                        checked ? [...prev, p] : prev.filter((x) => x !== p)
                      )
                    }
                  />
                  <Tag color={p === "DELETE" ? "red" : p === "UPDATE" ? "orange" : "green"}>{p}</Tag>
                </div>
              ))}
            </div>
          </Form.Item>
          <div className="flex justify-end gap-2">
            <Button onClick={() => setEditOpen(false)}>Hủy</Button>
            <Button type="primary" htmlType="submit">Cập nhật</Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}

function SystemAdminList({ childRequest }: Props) {
  const [users, setUsers] = React.useState<IAdminUser[]>([]);
  const [total, setTotal] = React.useState(0);
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(10);
  const [search, setSearch] = React.useState("");

  const [createOpen, setCreateOpen] = React.useState(false);
  const [editOpen, setEditOpen] = React.useState(false);
  const [resetOpen, setResetOpen] = React.useState(false);
  const [selected, setSelected] = React.useState<IAdminUser | null>(null);

  const [createForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const [resetForm] = Form.useForm();

  const fetchUsers = async () => {
    try {
      const rs = await childRequest.get("/v1/admin/system-admins", {
        params: { page, limit, nameLike: search || undefined },
      });
      setUsers(rs.data.data);
      setTotal(rs.data.totalItems ?? rs.data.data.length);
    } catch {
      message.error("Lỗi tải danh sách SYSTEM_ADMIN");
    }
  };

  React.useEffect(() => {
    fetchUsers();
  }, [page, limit, search]);

  const handleCreate = async (values: { userName: string; password: string }) => {
    try {
      await childRequest.post("/v1/admin/system-admins", values);
      message.success("Tạo tài khoản thành công");
      setCreateOpen(false);
      createForm.resetFields();
      fetchUsers();
    } catch (error: any) {
      message.error(error?.response?.data?.message || "Tạo thất bại");
    }
  };

  const handleEdit = async (values: { userName: string }) => {
    if (!selected) return;
    try {
      await childRequest.put(`/v1/admin/system-admins/${selected._id}`, values);
      message.success("Cập nhật thành công");
      setEditOpen(false);
      fetchUsers();
    } catch (error: any) {
      message.error(error?.response?.data?.message || "Cập nhật thất bại");
    }
  };

  const handleReset = async (values: { newPassword: string }) => {
    if (!selected) return;
    try {
      await childRequest.put(`/v1/admin/system-admins/${selected._id}/reset-password`, values);
      message.success("Đặt lại mật khẩu thành công");
      setResetOpen(false);
    } catch (error: any) {
      message.error(error?.response?.data?.message || "Thao tác thất bại");
    }
  };

  const handleDelete = async (record: IAdminUser) => {
    try {
      await childRequest.delete(`/v1/admin/system-admins/${record._id}`);
      message.success("Xóa thành công");
      fetchUsers();
    } catch (error: any) {
      message.error(error?.response?.data?.message || "Xóa thất bại");
    }
  };

  const columns = [
    { title: "Tên đăng nhập", dataIndex: "userName" },
    {
      title: "Vai trò",
      render: () => (
        <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs font-medium">
          SYSTEM_ADMIN
        </span>
      ),
    },
    {
      title: "Thao tác",
      render: (_: unknown, record: IAdminUser) => (
        <div className="flex gap-2">
          <Button size="small" icon={<EditOutlined />}
            onClick={() => { setSelected(record); editForm.setFieldsValue({ userName: record.userName }); setEditOpen(true); }}>
            Sửa
          </Button>
          <Button size="small" icon={<KeyOutlined />}
            onClick={() => { setSelected(record); resetForm.resetFields(); setResetOpen(true); }}>
            Đặt lại MK
          </Button>
          <Popconfirm title={`Xóa "${record.userName}"?`} okText="Xóa" okType="danger" cancelText="Hủy"
            onConfirm={() => handleDelete(record)}>
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div className="mt-6">
      <div className="flex justify-between items-center mb-3">
        <Input placeholder="Tìm theo tên..." prefix={<SearchOutlined />} allowClear
          style={{ width: 240 }}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateOpen(true)}>
          Thêm SYSTEM_ADMIN
        </Button>
      </div>
      <Table columns={columns} dataSource={users} rowKey="_id" pagination={false} />
      <div className="mt-3 flex justify-end">
        <Pagination
          current={page}
          total={total}
          pageSize={limit}
          onChange={setPage}
          showSizeChanger
          pageSizeOptions={[10, 20, 50, 100]}
          onShowSizeChange={(_, size) => {
            setLimit(size);
            setPage(1);
          }}
          showTotal={(t) => `Tổng ${t}`}
        />
      </div>

      <Modal title="Thêm SYSTEM_ADMIN" open={createOpen}
        onCancel={() => { setCreateOpen(false); createForm.resetFields(); }}
        footer={null} centered destroyOnClose>
        <Form form={createForm} layout="vertical" onFinish={handleCreate}>
          <Form.Item label="Tên đăng nhập" name="userName" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Mật khẩu" name="password"
            rules={[{ required: true }, { min: 6, message: "Tối thiểu 6 ký tự" }]}>
            <Input.Password />
          </Form.Item>
          <div className="flex justify-end gap-2">
            <Button onClick={() => { setCreateOpen(false); createForm.resetFields(); }}>Hủy</Button>
            <Button type="primary" htmlType="submit">Tạo</Button>
          </div>
        </Form>
      </Modal>

      <Modal title={`Sửa: ${selected?.userName}`} open={editOpen}
        onCancel={() => setEditOpen(false)} footer={null} centered destroyOnClose>
        <Form form={editForm} layout="vertical" onFinish={handleEdit}>
          <Form.Item label="Tên đăng nhập mới" name="userName" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <div className="flex justify-end gap-2">
            <Button onClick={() => setEditOpen(false)}>Hủy</Button>
            <Button type="primary" htmlType="submit">Cập nhật</Button>
          </div>
        </Form>
      </Modal>

      <Modal title={`Đặt lại MK: ${selected?.userName}`} open={resetOpen}
        onCancel={() => setResetOpen(false)} footer={null} centered destroyOnClose>
        <Form form={resetForm} layout="vertical" onFinish={handleReset}>
          <Form.Item label="Mật khẩu mới" name="newPassword"
            rules={[{ required: true }, { min: 6, message: "Tối thiểu 6 ký tự" }]}>
            <Input.Password />
          </Form.Item>
          <Form.Item label="Xác nhận mật khẩu" name="confirmPassword"
            dependencies={["newPassword"]}
            rules={[
              { required: true },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("newPassword") === value) return Promise.resolve();
                  return Promise.reject("Mật khẩu không khớp");
                },
              }),
            ]}>
            <Input.Password />
          </Form.Item>
          <div className="flex justify-end gap-2">
            <Button onClick={() => setResetOpen(false)}>Hủy</Button>
            <Button type="primary" htmlType="submit">Đặt lại</Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}

// ── Exported component ────────────────────────────────────────────────────────
export default function AdminSetting({ childRequest }: Props) {
  return (
    <div>
      <h3 className="text-base font-semibold text-gray-700 mb-3">Tài khoản ADMIN</h3>
      <AdminList childRequest={childRequest} />
      <div className="my-6 border-t border-dashed border-gray-200" />
      <h3 className="text-base font-semibold text-gray-700 mb-3">Tài khoản SYSTEM_ADMIN</h3>
      <SystemAdminList childRequest={childRequest} />
    </div>
  );
}
