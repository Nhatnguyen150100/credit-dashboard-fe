import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { RouterProvider } from "react-router-dom";
import router from "./router";
import { ToastContainer } from "react-toast";
import { persistor, store } from "./lib/store";
import { Spin } from "antd";
import { PersistGate } from "redux-persist/integration/react";
import { Provider } from "react-redux";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <PersistGate loading={<Spin />} persistor={persistor}>
        <RouterProvider router={router} />
        <ToastContainer delay={1500} />
      </PersistGate>
    </Provider>
  </StrictMode>
);
