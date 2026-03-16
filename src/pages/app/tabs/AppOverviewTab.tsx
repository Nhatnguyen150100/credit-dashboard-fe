import * as React from "react";
import { Badge, Card, Statistic, Tag, Tooltip } from "antd";
import {
  CheckCircleFilled,
  CloseCircleFilled,
  ClockCircleOutlined,
  DesktopOutlined,
  GlobalOutlined,
  CopyOutlined,
  CheckOutlined,
} from "@ant-design/icons";
import { IChildApp } from "../../../types/childApp";
import { formatDate } from "../../../utils/day-format";

interface Props {
  app: IChildApp;
  responseHealth: Record<string, unknown> | null;
}

function formatUptime(seconds: number): string {
  if (!seconds || seconds < 0) return "—";
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const parts: string[] = [];
  if (d > 0) parts.push(`${d} ngày`);
  if (h > 0) parts.push(`${h} giờ`);
  if (m > 0) parts.push(`${m} phút`);
  if (s > 0 || parts.length === 0) parts.push(`${s} giây`);
  return parts.join(" ");
}

function formatBytes(bytes: number): string {
  if (bytes === undefined || bytes === null) return "—";
  const mb = bytes / 1024 / 1024;
  if (mb >= 1024) return `${(mb / 1024).toFixed(2)} GB`;
  return `${mb.toFixed(1)} MB`;
}

export default function AppOverviewTab({ app, responseHealth }: Props) {
  const [copied, setCopied] = React.useState(false);

  const isOnline = app.appStatus === "online";

  const uptime =
    responseHealth &&
    typeof responseHealth["uptime"] === "number"
      ? (responseHealth["uptime"] as number)
      : null;

  const system =
    responseHealth && typeof responseHealth["system"] === "object" && responseHealth["system"] !== null
      ? (responseHealth["system"] as Record<string, unknown>)
      : null;

  const memory =
    system && typeof system["memory"] === "object" && system["memory"] !== null
      ? (system["memory"] as Record<string, unknown>)
      : null;

  const handleCopy = () => {
    navigator.clipboard.writeText(app.appDomain);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-5">

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        <Card
          className="rounded-xl border border-gray-100 shadow-sm"
          bodyStyle={{ padding: "20px 24px" }}
        >
          <div className="flex items-center gap-3 mb-3">
            {isOnline ? (
              <CheckCircleFilled className="text-2xl text-green-500" />
            ) : (
              <CloseCircleFilled className="text-2xl text-red-500" />
            )}
            <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">
              Trạng thái
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Badge
              status={isOnline ? "success" : "error"}
              text={
                <span className={`text-2xl font-bold ${isOnline ? "text-green-600" : "text-red-500"}`}>
                  {isOnline ? "Online" : "Offline"}
                </span>
              }
            />
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Cập nhật lần cuối: {formatDate(app.updatedAt ?? app.createdAt)}
          </p>
        </Card>

        <Card
          className="rounded-xl border border-gray-100 shadow-sm"
          bodyStyle={{ padding: "20px 24px" }}
        >
          <div className="flex items-center gap-3 mb-3">
            <GlobalOutlined className="text-2xl text-blue-500" />
            <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">
              Domain / IP
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-lg font-semibold text-gray-800 break-all">
              {app.appDomain}
            </span>
            <Tooltip title={copied ? "Đã sao chép!" : "Sao chép"}>
              <button
                onClick={handleCopy}
                className="ml-1 text-gray-400 hover:text-blue-500 transition-colors flex-shrink-0"
              >
                {copied ? (
                  <CheckOutlined className="text-green-500" />
                ) : (
                  <CopyOutlined />
                )}
              </button>
            </Tooltip>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Ngày kết nối: {formatDate(app.createdAt)}
          </p>
        </Card>
      </div>

      {uptime !== null && (
        <Card
          className="rounded-xl border border-gray-100 shadow-sm"
          bodyStyle={{ padding: "20px 24px" }}
        >
          <div className="flex items-center gap-3 mb-4">
            <ClockCircleOutlined className="text-2xl text-indigo-500" />
            <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">
              Uptime
            </span>
          </div>
          <div className="flex flex-wrap gap-4">
            <Statistic
              title="Thời gian hoạt động"
              value={formatUptime(uptime)}
              valueStyle={{ color: "#4f46e5", fontWeight: 700, fontSize: 22 }}
            />
            <Statistic
              title="Tổng giây"
              value={Math.floor(uptime).toLocaleString("vi-VN")}
              suffix="s"
              valueStyle={{ color: "#6b7280", fontSize: 16 }}
            />
          </div>
        </Card>
      )}
      {system && (
        <Card
          className="rounded-xl border border-gray-100 shadow-sm"
          bodyStyle={{ padding: "20px 24px" }}
        >
          <div className="flex items-center gap-3 mb-4">
            <DesktopOutlined className="text-2xl text-orange-500" />
            <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">
              Thông tin hệ thống
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

            {system["platform"] !== undefined && (
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-400 mb-1">Platform</p>
                <Tag color="blue" className="font-mono text-sm">
                  {String(system["platform"])}
                </Tag>
              </div>
            )}

            {system["nodeVersion"] !== undefined && (
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-400 mb-1">Node.js</p>
                <Tag color="green" className="font-mono text-sm">
                  {String(system["nodeVersion"])}
                </Tag>
              </div>
            )}

            {system["arch"] !== undefined && (
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-400 mb-1">Architecture</p>
                <Tag color="purple" className="font-mono text-sm">
                  {String(system["arch"])}
                </Tag>
              </div>
            )}

            {memory && (
              <>
                {memory["used"] !== undefined && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-400 mb-1">RAM đang dùng</p>
                    <span className="font-semibold text-gray-700">
                      {formatBytes(Number(memory["used"]))}
                    </span>
                  </div>
                )}
                {memory["total"] !== undefined && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-400 mb-1">RAM tổng</p>
                    <span className="font-semibold text-gray-700">
                      {formatBytes(Number(memory["total"]))}
                    </span>
                  </div>
                )}
                {memory["used"] !== undefined && memory["total"] !== undefined && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-400 mb-1">RAM sử dụng</p>
                    <span className="font-semibold text-orange-500">
                      {((Number(memory["used"]) / Number(memory["total"])) * 100).toFixed(1)}%
                    </span>
                  </div>
                )}
              </>
            )}

            {Object.entries(system)
              .filter(([k]) => !["platform", "nodeVersion", "arch", "memory"].includes(k))
              .map(([key, value]) => (
                <div key={key} className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-400 mb-1">{key}</p>
                  <span className="font-mono text-sm text-gray-700">
                    {typeof value === "object" ? JSON.stringify(value) : String(value)}
                  </span>
                </div>
              ))}
          </div>
        </Card>
      )}

    </div>
  );
}
