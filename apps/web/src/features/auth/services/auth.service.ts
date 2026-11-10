import { api } from "@/lib/api/client";
import type { User } from "../types/user";
import type { LoginInput, RegisterInput } from "../schemas/auth.schema";
export const authService = {
  me: async () => (await api.get<User>("/auth/me")).data,
  login: async (input: LoginInput) => (await api.post<User>("/auth/login", input)).data,
  register: async (input: RegisterInput) => (await api.post<User>("/auth/register", input)).data,
  logout: async () => {
    await api.post("/auth/logout");
  },
};
