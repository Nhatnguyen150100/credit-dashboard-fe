import * as React from "react";
import { Button, Form, Input, message, Spin } from "antd";
import { AxiosInstance } from "axios";
import { IBank } from "../../../types/childApp";

interface Props {
  childRequest: AxiosInstance;
}

export default function BankSetting({ childRequest }: Props) {
  const [bank, setBank] = React.useState<IBank | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [form] = Form.useForm();

  const fetchBank = async () => {
    try {
      setLoading(true);
      const rs = await childRequest.get("/v1/bank");
      const data = rs.data.data?.[0] ?? null;
      setBank(data);
      if (data) {
        form.setFieldsValue({
          name_bank: data.name_bank,
          name_account: data.name_account,
          account_number: data.account_number,
        });
      }
    } catch {
      message.error("Lỗi tải thông tin ngân hàng");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchBank();
  }, []);

  const onFinish = async (values: {
    name_bank: string;
    name_account: string;
    account_number: string;
  }) => {
    try {
      setSaving(true);
      const payload = { ...values, name_account: values.name_account.toUpperCase() };
      if (bank?._id) {
        await childRequest.put(`/v1/bank/${bank._id}`, payload);
      } else {
        await childRequest.post("/v1/bank", payload);
      }
      message.success("Cập nhật thông tin ngân hàng thành công");
      fetchBank();
    } catch (error: any) {
      message.error(error?.response?.data?.message || "Cập nhật thất bại");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Spin className="mt-6" />;

  return (
    <div className="max-w-lg">
      {bank?.qr_code_img && (
        <div className="mb-4">
          <p className="text-sm text-gray-500 mb-1">QR Code hiện tại:</p>
          <img
            src={bank.qr_code_img}
            alt="QR Code"
            className="h-32 w-32 object-contain border rounded"
          />
        </div>
      )}
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
      >
        <Form.Item
          label="Tên ngân hàng"
          name="name_bank"
          rules={[{ required: true, message: "Vui lòng nhập tên ngân hàng" }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Tên tài khoản"
          name="name_account"
          rules={[{ required: true, message: "Vui lòng nhập tên tài khoản" }]}
        >
          <Input className="uppercase" />
        </Form.Item>
        <Form.Item
          label="Số tài khoản"
          name="account_number"
          rules={[{ required: true, message: "Vui lòng nhập số tài khoản" }]}
        >
          <Input />
        </Form.Item>
        <Button type="primary" htmlType="submit" loading={saving}>
          {bank ? "Cập nhật" : "Tạo mới"}
        </Button>
      </Form>
    </div>
  );
}
