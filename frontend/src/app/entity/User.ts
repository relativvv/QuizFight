export interface User {
  id?: number | null;
  username: string;
  email: string;
  password: string;
  isAdmin: boolean;
  image?: string | null;
  money: number;
  allTimeCorrect: number;
  gamesPlayed: number;
  gamesWon: number;
  resetToken: string | null;
}
