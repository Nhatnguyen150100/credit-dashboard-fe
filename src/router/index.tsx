import { createBrowserRouter } from "react-router-dom";
import DEFINE_ROUTER from "../constants/router-define";
import TheLayout from "../pages/TheLayout";
import LoginPage from "../pages/Login";
import DashboardPage from "../pages/dashboard/DashboardPage";
import AppDetailPage from "../pages/app/AppDetailPage";
import AccountSettingPage from "../pages/account/AccountSettingPage";

const router = createBrowserRouter([
  {
    path: DEFINE_ROUTER.dashboard,
    Component: TheLayout,
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      {
        path: DEFINE_ROUTER.appDetail,
        element: <AppDetailPage />,
      },
      {
        path: DEFINE_ROUTER.account,
        element: <AccountSettingPage />,
      },
    ],
  },
  {
    path: DEFINE_ROUTER.login,
    element: <LoginPage />,
  },
]);

export default router;
