import * as React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Alert, Button, Spin, Tabs, Tag } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import axiosRequest from "../../plugins/request";
import { createChildRequest } from "../../plugins/childRequest";
import { IChildApp } from "../../types/childApp";
import InfoTab from "./tabs/InfoTab";
import BankSetting from "./tabs/BankSetting";
import OtpSetting from "./tabs/OtpSetting";
import FirebaseSetting from "./tabs/FirebaseSetting";
import AdminTab from "./tabs/AdminTab";
import SystemAdminTab from "./tabs/SystemAdminTab";
import AppOverviewTab from "./tabs/AppOverviewTab";
import { AxiosInstance } from "axios";
import DEFINE_ROUTER from "../../constants/router-define";

export default function AppDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [app, setApp] = React.useState<IChildApp | null>(null);
  const [responseHealth, setResponseHealth] = React.useState<Record<string, unknown> | null>(null);
  const [childRequest, setChildRequest] = React.useState<AxiosInstance | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    const init = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const appRs = await axiosRequest.get(`/v1/child-apps/${id}`);
        const appData: IChildApp = appRs.data.data;
        setApp(appData);
        setResponseHealth(appRs.data.responseHealth ?? null);

        if (appData.appStatus !== "online") {
          setError("App này đang offline, không thể truy cập dữ liệu.");
          return;
        }

        const credRs = await axiosRequest.get(`/v1/child-apps/${id}/credentials`);
        const { appDomain, accessToken } = credRs.data.data;

        if (!accessToken) {
          setError("Chưa có access token. Hãy kiểm tra lại trạng thái kết nối.");
          return;
        }

        setChildRequest(() => createChildRequest(appDomain, accessToken));
      } catch {
        setError("Không thể tải thông tin app.");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  if (error || !app) {
    return (
      <div>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(DEFINE_ROUTER.dashboard)} className="mb-4">
          Quay lại
        </Button>
        <Alert type="error" message={error || "Không tìm thấy app"} showIcon />
      </div>
    );
  }

  const tabItems = [
    {
      key: "overview",
      label: "Tổng quan",
      children: <AppOverviewTab app={app} responseHealth={responseHealth} />,
    },
    {
      key: "info",
      label: "Danh sách thông tin",
      children: childRequest ? <InfoTab childRequest={childRequest} /> : null,
    },
    {
      key: "bank",
      label: "Cài đặt ngân hàng",
      children: childRequest ? <BankSetting childRequest={childRequest} /> : null,
    },
    {
      key: "otp",
      label: "Cài đặt OTP",
      children: childRequest ? <OtpSetting childRequest={childRequest} /> : null,
    },
    {
      key: "firebase",
      label: "Cấu hình Firebase",
      children: childRequest ? <FirebaseSetting childRequest={childRequest} /> : null,
    },
    {
      key: "admin",
      label: "Quản lý ADMIN",
      children: childRequest ? <AdminTab childRequest={childRequest} /> : null,
    },
    {
      key: "system-admin",
      label: "Quản lý SYSTEM_ADMIN",
      children: childRequest ? <SystemAdminTab childRequest={childRequest} /> : null,
    },
  ];

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(DEFINE_ROUTER.dashboard)}
          >
            Quay lại
          </Button>
          <span className="text-xl font-bold text-gray-800">{app.appName}</span>
          <Tag color={app.appStatus === "online" ? "success" : "error"} className="text-sm">
            {app.appStatus === "online" ? "Online" : "Offline"}
          </Tag>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        {!childRequest && app.appStatus !== "online" && (
          <Alert
            type="warning"
            message="App đang offline. Chỉ xem được tab Tổng quan."
            showIcon
            className="mb-4"
          />
        )}
        <Tabs defaultActiveKey="overview" items={tabItems} destroyInactiveTabPane={false} />
      </div>
    </div>
  );
}
