import {User} from './User';

export interface Game {
  id?: number;
  p1: User | null;
  p2: User | null;
  port?: number | null;
}
