import { Navigate, Outlet, useNavigate } from "react-router-dom";
import { Button, Dropdown } from "antd";
import { UserOutlined, SettingOutlined, LogoutOutlined } from "@ant-design/icons";
import { useDispatch } from "react-redux";
import cookiesStore from "../plugins/cookiesStore";
import DEFINE_ROUTER from "../constants/router-define";
import { clearSupervisor } from "../lib/reducer/supervisorSlice";

export default function TheLayout() {
  const isAuth = cookiesStore.get("supervisor");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  if (!isAuth) {
    return <Navigate to={DEFINE_ROUTER.login} replace />;
  }

  const supervisorRaw = cookiesStore.get("supervisor");
  let supervisor: { userName?: string } | null = null;
  try {
    supervisor = supervisorRaw ? JSON.parse(supervisorRaw) : null;
  } catch {
    supervisor = null;
  }

  const handleLogout = () => {
    cookiesStore.remove("supervisor");
    cookiesStore.remove("access_token");
    dispatch(clearSupervisor());
    window.location.href = DEFINE_ROUTER.login;
  };

  const menuItems = [
    {
      key: "account",
      icon: <SettingOutlined />,
      label: "Cài đặt tài khoản",
      onClick: () => navigate(DEFINE_ROUTER.account),
    },
    { type: "divider" as const },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: <span className="text-red-500">Đăng xuất</span>,
      onClick: handleLogout,
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="w-full bg-white shadow-sm px-6 py-3 flex items-center justify-between">
        <span
          className="text-xl font-bold text-blue-700 uppercase tracking-wide cursor-pointer"
          onClick={() => navigate(DEFINE_ROUTER.dashboard)}
        >
          Credit Dashboard
        </span>
        <Dropdown menu={{ items: menuItems }} placement="bottomRight" trigger={["click"]}>
          <Button icon={<UserOutlined />}>
            {supervisor?.userName || "Supervisor"}
          </Button>
        </Dropdown>
      </header>
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
}
