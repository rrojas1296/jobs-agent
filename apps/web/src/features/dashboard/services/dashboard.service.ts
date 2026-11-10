import { api } from "@/lib/api/client";
import type { DashboardData } from "../types/dashboard";
export const getDashboard = async () => (await api.get<DashboardData>("/dashboard")).data;
