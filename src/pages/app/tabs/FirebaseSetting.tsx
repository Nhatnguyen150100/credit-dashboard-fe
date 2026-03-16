import * as React from "react";
import { Card, Descriptions, message, Radio, Spin } from "antd";
import { AxiosInstance } from "axios";
import { IFirebaseConfig } from "../../../types/childApp";
import { formatDate } from "../../../utils/day-format";

interface Props {
  childRequest: AxiosInstance;
}

export default function FirebaseSetting({ childRequest }: Props) {
  const [config, setConfig] = React.useState<IFirebaseConfig | null>(null);
  const [loading, setLoading] = React.useState(false);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const rs = await childRequest.get("/v1/firebase");
      setConfig(rs.data ?? null);
    } catch {
      message.error("Lỗi tải cấu hình Firebase");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchConfig();
  }, []);

  const handleSwitch = async (value: "MAIN_APP_CONFIG" | "BACKUP_APP_CONFIG") => {
    try {
      setLoading(true);
      const rs = await childRequest.post("/v1/firebase", {
        firebaseConfigSelected: value,
        id: config?._id,
      });
      message.success(rs.data.message || "Cập nhật thành công");
      fetchConfig();
    } catch (error: any) {
      message.error(error?.response?.data?.message || "Cập nhật thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="Cấu hình Firebase" loading={loading} className="max-w-2xl">
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-4">Chọn cấu hình:</h3>
        <Spin spinning={loading}>
          <Radio.Group
            value={config?.firebaseConfigSelected}
            onChange={(e) => handleSwitch(e.target.value)}
            buttonStyle="solid"
          >
            <Radio.Button value="MAIN_APP_CONFIG" className="w-40 text-center">
              Cấu hình chính
            </Radio.Button>
            <Radio.Button
              value="BACKUP_APP_CONFIG"
              className="w-40 text-center ml-4"
            >
              Cấu hình dự phòng
            </Radio.Button>
          </Radio.Group>
        </Spin>
      </div>

      {config && (
        <Descriptions bordered column={1} size="small">
          <Descriptions.Item label="Loại cấu hình">
            <span className="font-medium">
              {config.firebaseConfigSelected === "MAIN_APP_CONFIG"
                ? "Cấu hình chính"
                : "Cấu hình dự phòng"}
            </span>
          </Descriptions.Item>
          <Descriptions.Item label="API Key">{config.apiKey}</Descriptions.Item>
          <Descriptions.Item label="Auth Domain">{config.authDomain}</Descriptions.Item>
          <Descriptions.Item label="Project ID">{config.projectId}</Descriptions.Item>
          <Descriptions.Item label="Storage Bucket">{config.storageBucket}</Descriptions.Item>
          <Descriptions.Item label="Messaging Sender ID">{config.messagingSenderId}</Descriptions.Item>
          <Descriptions.Item label="App ID">{config.appId}</Descriptions.Item>
          <Descriptions.Item label="Measurement ID">{config.measurementId}</Descriptions.Item>
          <Descriptions.Item label="Cập nhật lúc">{formatDate(config.updatedAt)}</Descriptions.Item>
        </Descriptions>
      )}
    </Card>
  );
}
