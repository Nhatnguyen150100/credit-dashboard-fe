import axios, { AxiosResponse } from "axios";
import cookiesStore from "./cookiesStore";
import { message } from "antd";
import DEFINE_ROUTER from "../constants/router-define";

const API_URL: string | undefined = import.meta.env.VITE_BASE_URL;

const axiosRequest = axios.create({
  baseURL: API_URL,
  withCredentials: false,
});

const onFulFillResponse = (
  value: AxiosResponse<any, any>
): AxiosResponse<any, any> | Promise<AxiosResponse<any, any>> => {
  return value;
};

const onRejectResponse = (error: any) => {
  const { data, status } = error.response;

  if (status === 400) {
    message.error(data.message);
  }

  if (status === 401 || status === 403) {
    cookiesStore.remove("access_token");
    axiosRequest.defaults.headers.common["Authorization"] = "";
    window.location.href = DEFINE_ROUTER.login;
  }

  if (!error.response || error.response.status >= 500) {
    return Promise.reject(error);
  }
  return Promise.reject(error);
};

axiosRequest.interceptors.response.use(onFulFillResponse, onRejectResponse);
axiosRequest.interceptors.request.use((config) => {
  const token = cookiesStore.get("access_token");
  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

export default axiosRequest;
