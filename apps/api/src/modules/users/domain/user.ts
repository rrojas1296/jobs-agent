export interface User {
  id: string;
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  onboardingCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}
export type PublicUser = Omit<User, "passwordHash">;
export type NewUser = Pick<User, "email" | "passwordHash" | "firstName" | "lastName">;
export function publicUser(user: User): PublicUser {
  const { passwordHash: _passwordHash, ...safe } = user;
  return safe;
}
export abstract class UserRepository {
  abstract findByEmail(email: string): Promise<User | undefined>;
  abstract findById(id: string): Promise<User | undefined>;
  abstract create(data: NewUser): Promise<User>;
}
