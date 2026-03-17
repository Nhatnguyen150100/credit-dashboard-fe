import * as React from "react";
import { Button, Form, FormProps, Input, message, Spin } from "antd";
import { AxiosInstance } from "axios";
import { IBank } from "../../../types/childApp";
import ImgUpload from "../../../components/ImgUpload";

interface Props {
  childRequest: AxiosInstance;
}

type FieldType = {
  name_bank: string;
  name_account: string;
  account_number: string;
};

export default function BankSetting({ childRequest }: Props) {
  const [bank, setBank] = React.useState<IBank | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [file, setFile] = React.useState<File | undefined>();
  const [qrCodeImg, setQrCodeImg] = React.useState<string | undefined>();
  const [form] = Form.useForm();

  const fetchBank = async () => {
    try {
      setLoading(true);
      const rs = await childRequest.get("/v1/bank");
      const data: IBank | null = rs.data.data?.[0] ?? null;
      setBank(data);
      setQrCodeImg(data?.qr_code_img ?? undefined);
    } catch {
      message.error("Lỗi tải thông tin ngân hàng");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchBank();
  }, []);

  const onFinish: FormProps<FieldType>["onFinish"] = async (values) => {
    if (!(file || qrCodeImg)) {
      message.error("Chưa chọn ảnh QR code");
      return;
    }

    const formData = new FormData();
    if (file) {
      formData.append("qrCodeImg", file);
    }
    formData.append("account_number", values.account_number);
    formData.append("name_bank", values.name_bank);
    formData.append("name_account", values.name_account.toUpperCase());

    const option = { headers: { "Content-Type": "multipart/form-data" } };

    try {
      if (bank?._id) {
        await childRequest.put(`/v1/bank/${bank._id}`, formData, option);
      } else {
        await childRequest.post("/v1/bank", formData, option);
      }
      message.success("Cập nhật thành công");
      fetchBank();
    } catch (error: any) {
      message.error(error?.response?.data?.message || "Cập nhật thất bại");
    }
  };

  if (loading) return <Spin className="mt-6" />;

  return (
    <div className="flex flex-col justify-start items-start">
      <Form
        className="w-full mt-5"
        form={form}
        labelCol={{ span: 6 }}
        labelAlign="left"
        name="form"
        onFinish={onFinish}
        initialValues={{
          name_bank: bank?.name_bank ?? "",
          name_account: bank?.name_account ?? "",
          account_number: bank?.account_number ?? "",
        }}
        autoComplete="off"
      >
        <Form.Item<FieldType>
          label="Tên ngân hàng"
          name="name_bank"
          rules={[{ required: true, message: "Hãy nhập tên ngân hàng" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item<FieldType>
          label="Tên tài khoản ngân hàng"
          name="name_account"
          rules={[{ required: true, message: "Hãy nhập tên tài khoản ngân hàng" }]}
        >
          <Input className="uppercase" />
        </Form.Item>

        <Form.Item<FieldType>
          label="Số tài khoản ngân hàng"
          name="account_number"
          rules={[{ required: true, message: "Hãy nhập số tài khoản ngân hàng" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item<any>
          label={
            <div className="flex flex-row justify-between items-center space-x-1">
              <span className="text-base text-red-500">*</span>
              <span className="text-sm">Ảnh QR code tài khoản ngân hàng</span>
            </div>
          }
          rules={[{ required: true }]}
        >
          <ImgUpload
            imgProps={qrCodeImg ?? null}
            file={file}
            handleUploadFile={(f: File | undefined) => {
              setFile(f ?? undefined);
              setQrCodeImg(undefined);
            }}
          />
        </Form.Item>

        <div className="w-full flex justify-end items-end space-x-5">
          <Button type="primary" htmlType="submit">
            Cập nhật thông tin
          </Button>
        </div>
      </Form>
    </div>
  );
}
