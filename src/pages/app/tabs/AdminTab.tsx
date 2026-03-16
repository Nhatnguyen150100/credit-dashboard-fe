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
  PlusOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { AxiosInstance } from "axios";
import { IAdminUser } from "../../../types/childApp";

interface Props {
  childRequest: AxiosInstance;
}

const PERMISSIONS = ["CREATE", "UPDATE", "DELETE"];

export default function AdminTab({ childRequest }: Props) {
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
    {
      title: "STT",
      render: (_: unknown, __: unknown, index: number) => (page - 1) * limit + index + 1,
      width: 60,
    },
    { title: "Tên đăng nhập", dataIndex: "userName" },
    {
      title: "Vai trò",
      render: () => <Tag color="geekblue">ADMIN</Tag>,
    },
    {
      title: "Quyền hạn",
      dataIndex: "permissions",
      render: (perms: string[]) => (
        <div className="flex gap-1 flex-wrap">
          {perms
            .filter((p) => p !== "ALL_PERMISSION")
            .map((p) => (
              <Tag
                key={p}
                color={p === "DELETE" ? "red" : p === "UPDATE" ? "orange" : "green"}
              >
                {p}
              </Tag>
            ))}
          {perms.filter((p) => p !== "ALL_PERMISSION").length === 0 && (
            <span className="text-gray-400 text-xs">Chưa có quyền</span>
          )}
        </div>
      ),
    },
    {
      title: "Thao tác",
      render: (_: unknown, record: IAdminUser) => (
        <div className="flex gap-2">
          <Button size="small" icon={<EditOutlined />} onClick={() => handleOpenEdit(record)}>
            Sửa
          </Button>
          <Popconfirm
            title={`Xóa tài khoản "${record.userName}"?`}
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
      <div className="flex justify-between items-center mb-4">
        <Input
          placeholder="Tìm theo tên..."
          prefix={<SearchOutlined />}
          allowClear
          style={{ width: 260 }}
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
          <Select
            value={limit}
            onChange={(v) => { setLimit(v); setPage(1); }}
            size="small"
            options={[{ value: 10, label: "10" }, { value: 20, label: "20" }, { value: 50, label: "50" }]}
          />
        </div>
        <Pagination
          current={page}
          total={total}
          pageSize={limit}
          onChange={setPage}
          showSizeChanger={false}
          showTotal={(t) => `Tổng ${t} tài khoản`}
        />
      </div>

      {/* Create modal */}
      <Modal
        title="Thêm tài khoản ADMIN"
        open={createOpen}
        onCancel={() => { setCreateOpen(false); createForm.resetFields(); }}
        footer={null}
        centered
        destroyOnClose
      >
        <Form form={createForm} layout="vertical" onFinish={handleCreate}>
          <Form.Item
            label="Tên đăng nhập"
            name="userName"
            rules={[{ required: true, message: "Vui lòng nhập tên đăng nhập" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Mật khẩu"
            name="password"
            rules={[{ required: true }, { min: 6, message: "Tối thiểu 6 ký tự" }]}
          >
            <Input.Password />
          </Form.Item>
          <div className="flex justify-end gap-2">
            <Button onClick={() => { setCreateOpen(false); createForm.resetFields(); }}>Hủy</Button>
            <Button type="primary" htmlType="submit">Tạo</Button>
          </div>
        </Form>
      </Modal>

      {/* Edit modal */}
      <Modal
        title={`Chỉnh sửa: ${editTarget?.userName}`}
        open={editOpen}
        onCancel={() => setEditOpen(false)}
        footer={null}
        centered
        destroyOnClose
      >
        <Form form={editForm} layout="vertical" onFinish={handleEdit}>
          <Form.Item
            label="Tên đăng nhập"
            name="userName"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item label="Quyền hạn">
            <div className="flex flex-col gap-3">
              {PERMISSIONS.map((p) => (
                <div key={p} className="flex items-center justify-between">
                  <Tag color={p === "DELETE" ? "red" : p === "UPDATE" ? "orange" : "green"}>
                    {p}
                  </Tag>
                  <Switch
                    checked={editPermissions.includes(p)}
                    onChange={(checked) =>
                      setEditPermissions((prev) =>
                        checked ? [...prev, p] : prev.filter((x) => x !== p)
                      )
                    }
                  />
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
