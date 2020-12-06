export interface User {
  id?: number | null;
  username: string;
  email: string;
  password: string;
  image?: string | null;
  queue?: any | null;
  money: number;
}
