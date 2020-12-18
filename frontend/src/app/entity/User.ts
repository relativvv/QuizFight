export interface User {
  id?: number | null;
  username: string;
  email: string;
  password: string;
  isAdmin: boolean;
  image?: string | null;
  queue?: any | null;
  money: number;
}
