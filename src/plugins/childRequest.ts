import axios from "axios";

export const createChildRequest = (appDomain: string, port: number | undefined, accessToken: string, backendUrl?: string) => {
  const baseURL = backendUrl ? backendUrl : `http://${appDomain}:${port}`;
  const instance = axios.create({
    baseURL,
    timeout: 10000,
  });

  instance.interceptors.request.use((config) => {
    config.headers["Authorization"] = `Bearer ${accessToken}`;
    return config;
  });

  return instance;
};
