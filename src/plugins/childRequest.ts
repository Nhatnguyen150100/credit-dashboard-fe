import axios from "axios";

export const createChildRequest = (appDomain: string, accessToken: string) => {
  const instance = axios.create({
    baseURL: `http://${appDomain}`,
    timeout: 10000,
  });

  instance.interceptors.request.use((config) => {
    config.headers["Authorization"] = `Bearer ${accessToken}`;
    return config;
  });

  return instance;
};
