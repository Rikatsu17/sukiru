export type TaskStatus = "pending" | "in_progress" | "completed" | "cancelled";
export type ApplicationStatus = "pending" | "accepted" | "rejected";
export type TransactionStatus = "escrowed" | "released" | "refunded";

export interface User {
  id: string;
  full_name: string;
  email: string;
  credits: number;
  bio?: string | null;
  faculty?: string | null;
  course?: string | null;
  avatar_url?: string | null;
  created_at?: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string | null;
  credits: number;
  status: TaskStatus;
  owner_id: string;
  owner_name?: string;
  executor_id?: string | null;
  executor_name?: string | null;
  created_at?: string;
}

export interface Application {
  id: string;
  task_id: string;
  task_title?: string;
  applicant_id?: string;
  applicant_name?: string;
  message?: string | null;
  status: ApplicationStatus;
  created_at?: string;
}

export interface Transaction {
  id: string;
  task_id: string;
  task_title?: string;
  sender_id: string;
  receiver_id: string;
  amount: number;
  status: TransactionStatus;
  created_at?: string;
}

export interface AuthResponse {
  access_token: string;
  token_type?: string;
}

export interface RegisterPayload {
  full_name: string;
  email: string;
  password: string;
  bio?: string;
  faculty?: string;
  course?: string;
  avatar_url?: string | null;
}

export interface LoginPayload {
  email: string;
  password: string;
}
