export interface Question {
  category: number;
  type: 'multiple' | 'boolean';
  difficulty: string;
  question: string;
  correct_answer: string;
  wrong_answers: string[];
}
