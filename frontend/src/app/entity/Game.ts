import {User} from './User';

export interface Game {
  id?: number;
  p1: User | null;
  p2: User | null;
  p1Locked: string | null;
  p2Locked: string | null;
  p1Correct: number;
  p2Correct: number;
  question: string | null;
  answers: string[] | null;
  correctAnswer: string | null;
  mode: string;
  questionNumber: number;
  p1Status: string;
  p2Status: string;
  p1HP: number;
  p2HP: number;
  currentDifficulty: string | null;
}
