import * as React from "react";
import { Button, Form, Input, message, Modal, Spin } from "antd";
import { AxiosInstance } from "axios";
import { IOtp } from "../../../types/childApp";

interface Props {
  childRequest: AxiosInstance;
}

export default function OtpSetting({ childRequest }: Props) {
  const [otp, setOtp] = React.useState<IOtp | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [form] = Form.useForm();

  const fetchOtp = async () => {
    try {
      setLoading(true);
      const rs = await childRequest.get("/v1/otp");
      const data = rs.data.data?.[0] ?? null;
      setOtp(data);
      form.setFieldsValue({ otpCustom: data?.otpCustom ?? "" });
    } catch {
      message.error("Lỗi tải thông tin OTP");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchOtp();
  }, []);

  const onFinish = async (values: { otpCustom: string }) => {
    try {
      setSaving(true);
      if (otp?._id) {
        await childRequest.put(`/v1/otp/${otp._id}`, values);
        message.success("Cập nhật OTP thành công");
      } else {
        await childRequest.post("/v1/otp", values);
        message.success("Tạo mới OTP thành công");
      }
      fetchOtp();
    } catch (error: any) {
      message.error(error?.response?.data?.message || "Thao tác thất bại");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    if (!otp) return;
    Modal.confirm({
      title: "Xóa OTP?",
      content: `OTP hiện tại: ${otp.otpCustom}`,
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      centered: true,
      onOk: async () => {
        try {
          await childRequest.delete(`/v1/otp/${otp._id}`);
          message.success("Xóa OTP thành công");
          setOtp(null);
          form.resetFields();
        } catch (error: any) {
          message.error(error?.response?.data?.message || "Xóa thất bại");
        }
      },
    });
  };

  if (loading) return <Spin className="mt-6" />;

  return (
    <div className="max-w-xs">
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item
          label="OTP mặc định (6 chữ số)"
          name="otpCustom"
          rules={[
            { required: true, message: "Vui lòng nhập OTP" },
            { len: 6, message: "OTP phải có đúng 6 ký tự" },
            { pattern: /^[0-9]{6}$/, message: "OTP phải là 6 chữ số" },
          ]}
        >
          <Input maxLength={6} />
        </Form.Item>
        <div className="flex gap-2">
          <Button type="primary" htmlType="submit" loading={saving}>
            {otp ? "Cập nhật OTP" : "Tạo mới OTP"}
          </Button>
          {otp && (
            <Button danger onClick={handleDelete}>
              Xóa OTP
            </Button>
          )}
        </div>
      </Form>
    </div>
  );
}
