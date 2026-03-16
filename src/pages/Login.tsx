import * as React from "react";
import { Input } from "antd";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toast";
import { useDispatch } from "react-redux";
import axiosRequest from "../plugins/request";
import cookiesStore from "../plugins/cookiesStore";
import GeneralLoading from "../components/GeneralLoading";
import DEFINE_ROUTER from "../constants/router-define";
import { setSupervisorInfo } from "../lib/reducer/supervisorSlice";

export default function LoginPage() {
  const [form, setForm] = React.useState({ userName: "", password: "" });
  const [loading, setLoading] = React.useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const onHandleSubmit = async () => {
    if (!(form.userName && form.password)) {
      toast.error("Vui lòng nhập tài khoản và mật khẩu");
      return;
    }
    try {
      setLoading(true);
      const rs = await axiosRequest.post("/v1/admin/login", {
        userName: form.userName,
        password: form.password,
      });
      cookiesStore.set("access_token", rs.data.data.accessToken);
      cookiesStore.set("supervisor", JSON.stringify(rs.data.data.user));
      dispatch(setSupervisorInfo(rs.data.data.user));
      navigate(DEFINE_ROUTER.dashboard);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <GeneralLoading isLoading={loading} />
      <div className="flex h-screen w-full justify-center items-center bg-gray-100">
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg p-10">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-blue-700 uppercase tracking-wide">
              Credit Dashboard
            </h1>
            <p className="text-gray-500 mt-1 text-sm">Supervisor login</p>
          </div>
          <form onSubmit={(e) => e.preventDefault()}>
            <Input
              size="large"
              placeholder="Tài khoản"
              className="mb-4"
              value={form.userName}
              onChange={(e) =>
                setForm((pre) => ({ ...pre, userName: e.target.value }))
              }
              onKeyDown={(e) => e.key === "Enter" && onHandleSubmit()}
            />
            <Input.Password
              size="large"
              placeholder="Mật khẩu"
              className="mb-6"
              value={form.password}
              onChange={(e) =>
                setForm((pre) => ({ ...pre, password: e.target.value }))
              }
              onKeyDown={(e) => e.key === "Enter" && onHandleSubmit()}
            />
            <button
              type="button"
              disabled={loading}
              onClick={onHandleSubmit}
              className="w-full py-2.5 rounded-xl text-white font-semibold text-base bg-blue-600 hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              Đăng nhập
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
