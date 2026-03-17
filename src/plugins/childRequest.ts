import axios from "axios";

export const createChildRequest = (appDomain: string, port: number, accessToken: string) => {
  const instance = axios.create({
    baseURL: `http://${appDomain}:${port}`,
    timeout: 10000,
  });

  instance.interceptors.request.use((config) => {
    config.headers["Authorization"] = `Bearer ${accessToken}`;
    return config;
  });

  return instance;
};
