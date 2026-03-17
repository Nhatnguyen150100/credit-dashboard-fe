export interface IChildApp {
  _id: string;
  appName: string;
  appDomain: string;
  port: number;
  appStatus: "online" | "offline";
  createdAt: string;
  updatedAt: string;
}

export interface ISupervisor {
  userName: string;
  role: string;
}

export interface IBank {
  _id: string;
  name_bank: string;
  name_account: string;
  account_number: string;
  qr_code_img: string;
  created_at: string;
}

export interface IOtp {
  _id: string;
  otpCustom?: string;
  created_at: string;
}

export interface IFirebaseConfig {
  _id: string;
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId: string;
  firebaseConfigSelected: string;
  createdAt: string;
  updatedAt: string;
}

export interface IInfo {
  _id: string;
  user_id: string;
  name: string;
  phone_number: string;
  loan_amount: number;
  amount_payable: number;
  date_payable: string;
  loan_date: string;
  status: "NOT_PAY" | "PAYED" | "OVER_DATE";
  assignee?: { _id: string; userName: string };
}

export interface IAdminUser {
  _id: string;
  userName: string;
  role: string;
  permissions: string[];
}
