import * as React from "react";
import {
  Alert,
  Button,
  Card,
  Divider,
  Form,
  Input,
  notification,
  Typography,
} from "antd";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import axiosRequest from "../../plugins/request";
import cookiesStore from "../../plugins/cookiesStore";
import { useDispatch } from "react-redux";
import { clearSupervisor, setSupervisorInfo } from "../../lib/reducer/supervisorSlice";
import DEFINE_ROUTER from "../../constants/router-define";

const { Title, Text } = Typography;

export default function AccountSettingPage() {
  const dispatch = useDispatch();
  const supervisorRaw = cookiesStore.get("supervisor");
  let supervisor: { userName?: string } | null = null;
  try {
    supervisor = supervisorRaw ? JSON.parse(supervisorRaw) : null;
  } catch {
    supervisor = null;
  }

  const [userForm] = Form.useForm();
  const [passForm] = Form.useForm();
  const [userLoading, setUserLoading] = React.useState(false);
  const [passLoading, setPassLoading] = React.useState(false);

  React.useEffect(() => {
    if (supervisor?.userName) {
      userForm.setFieldsValue({ userName: supervisor.userName });
    }
  }, []);

  const handleUpdateAccount = async (values: { userName: string }) => {
    try {
      setUserLoading(true);
      const rs = await axiosRequest.put("/v1/admin/update-account", values);
      notification.success({ message: rs.data.message || "Cập nhật thành công" });

      const updated = { ...supervisor, userName: values.userName, role: "SUPERVISOR" };
      cookiesStore.set("supervisor", JSON.stringify(updated));
      dispatch(setSupervisorInfo(updated));
    } catch (error: any) {
      notification.error({
        message: "Cập nhật thất bại",
        description: error?.response?.data?.message,
      });
    } finally {
      setUserLoading(false);
    }
  };

  const handleChangePassword = async (values: {
    currentPassword: string;
    newPassword: string;
  }) => {
    try {
      setPassLoading(true);
      const rs = await axiosRequest.put("/v1/admin/change-password", values);
      notification.success({ message: rs.data.message || "Đổi mật khẩu thành công" });
      passForm.resetFields();

      setTimeout(() => {
        cookiesStore.remove("supervisor");
        cookiesStore.remove("access_token");
        dispatch(clearSupervisor());
        window.location.href = DEFINE_ROUTER.login;
      }, 1500);
    } catch (error: any) {
      notification.error({
        message: "Đổi mật khẩu thất bại",
        description: error?.response?.data?.message,
      });
    } finally {
      setPassLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <Title level={4} className="!mb-1">Cài đặt tài khoản</Title>
        <Text type="secondary">Quản lý thông tin đăng nhập của tài khoản Supervisor</Text>
      </div>

      <Card className="rounded-xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <UserOutlined className="text-blue-500 text-lg" />
          <span className="font-semibold text-gray-700">Tên đăng nhập</span>
        </div>
        <Form form={userForm} layout="vertical" onFinish={handleUpdateAccount}>
          <Form.Item
            label="Tên đăng nhập mới"
            name="userName"
            rules={[
              { required: true, message: "Vui lòng nhập tên đăng nhập" },
              { min: 3, message: "Tối thiểu 3 ký tự" },
            ]}
          >
            <Input prefix={<UserOutlined className="text-gray-400" />} />
          </Form.Item>
          <div className="flex justify-end">
            <Button type="primary" htmlType="submit" loading={userLoading}>
              Cập nhật tên đăng nhập
            </Button>
          </div>
        </Form>
      </Card>

      <Divider />

      <Card className="rounded-xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <LockOutlined className="text-orange-500 text-lg" />
          <span className="font-semibold text-gray-700">Đổi mật khẩu</span>
        </div>
        <Alert
          type="info"
          message="Sau khi đổi mật khẩu thành công, bạn sẽ được đăng xuất tự động."
          showIcon
          className="mb-4"
        />
        <Form form={passForm} layout="vertical" onFinish={handleChangePassword}>
          <Form.Item
            label="Mật khẩu hiện tại"
            name="currentPassword"
            rules={[{ required: true, message: "Vui lòng nhập mật khẩu hiện tại" }]}
          >
            <Input.Password prefix={<LockOutlined className="text-gray-400" />} />
          </Form.Item>
          <Form.Item
            label="Mật khẩu mới"
            name="newPassword"
            rules={[
              { required: true, message: "Vui lòng nhập mật khẩu mới" },
              { min: 6, message: "Tối thiểu 6 ký tự" },
            ]}
          >
            <Input.Password prefix={<LockOutlined className="text-gray-400" />} />
          </Form.Item>
          <Form.Item
            label="Xác nhận mật khẩu mới"
            name="confirmPassword"
            dependencies={["newPassword"]}
            rules={[
              { required: true, message: "Vui lòng xác nhận mật khẩu" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("newPassword") === value)
                    return Promise.resolve();
                  return Promise.reject("Mật khẩu xác nhận không khớp");
                },
              }),
            ]}
          >
            <Input.Password prefix={<LockOutlined className="text-gray-400" />} />
          </Form.Item>
          <div className="flex justify-end">
            <Button type="primary" danger htmlType="submit" loading={passLoading}>
              Đổi mật khẩu
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
}
