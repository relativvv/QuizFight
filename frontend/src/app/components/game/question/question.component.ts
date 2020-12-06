import { Component, OnInit } from '@angular/core';
import {TriviaService} from '../../../services/trivia.service';
import {Question} from '../../../entity/Question';
import {UserService} from '../../../services/user.service';

@Component({
  selector: 'app-question',
  templateUrl: './question.component.html',
  styleUrls: ['./question.component.less']
})
export class QuestionComponent implements OnInit {

  constructor(private readonly triviaService: TriviaService, public readonly userService: UserService) { }

  loading: boolean;
  question: Question;
  answers = [];
  questionString = 'Waiting for Question..';
  answerOne = null;
  answerTwo = null;
  answerThree = null;
  answerFour = null;
  lockedAnswer = null;
  money: number;

  ngOnInit(): void {
    this.loading = true;
    this.triviaService.getQuestion(1, 'multiple').subscribe((result) => {
      this.question = result.results[0];
      this.questionString = this.question.question;
      this.question.incorrect_answers.forEach((ans) => {
        this.answers.push(ans);
      });
      this.answers.push(this.question.correct_answer);
      this.setAnswers(this.answers);
      this.loading = false;
      switch (this.question.difficulty) {
        case 'easy':
          this.money = 5;
          break;
        case 'medium':
          this.money = 15;
          break;
        case 'hard':
          this.money = 25;
          break;
      }
    });
  }

  public lockAnswer(type: 'one' | 'two' | 'three' | 'four'): void {
    switch (type) {
      case 'one':
        document.getElementById('answerOne').style.backgroundColor = 'orange';
        document.getElementById('answerFour').style.backgroundColor = '#3f73e5';
        document.getElementById('answerFour').style.backgroundColor = '#3f73e5';
        document.getElementById('answerThree').style.backgroundColor = '#3f73e5';
        document.getElementById('answerTwo').style.backgroundColor = '#3f73e5';
        this.lockedAnswer = this.answerOne;
        break;
      case 'two':
        document.getElementById('answerTwo').style.backgroundColor = 'orange';
        document.getElementById('answerFour').style.backgroundColor = '#3f73e5';
        document.getElementById('answerThree').style.backgroundColor = '#3f73e5';
        document.getElementById('answerOne').style.backgroundColor = '#3f73e5';
        this.lockedAnswer = this.answerTwo;
        break;
      case 'three':
        document.getElementById('answerThree').style.backgroundColor = 'orange';
        document.getElementById('answerFour').style.backgroundColor = '#3f73e5';
        document.getElementById('answerTwo').style.backgroundColor = '#3f73e5';
        document.getElementById('answerOne').style.backgroundColor = '#3f73e5';
        this.lockedAnswer = this.answerThree;
        break;
      case 'four':
        document.getElementById('answerFour').style.backgroundColor = 'orange';
        document.getElementById('answerThree').style.backgroundColor = '#3f73e5';
        document.getElementById('answerTwo').style.backgroundColor = '#3f73e5';
        document.getElementById('answerOne').style.backgroundColor = '#3f73e5';
        this.lockedAnswer = this.answerFour;
        break;
    }
  }


  public setAnswers(arr: any[]): any {
    for (let i = 0; i < 4; i++) {
    const rnd = Math.floor(Math.random() * arr.length);
    const str = arr[rnd];
    if (this.hasAlreadyAnswerSet(str)) {
      if (this.isAllAnswersSet()) {
        return;
      }
      this.setAnswers(arr);
    } else {
      this.setMissingAnswer(str);
    }
    }
  }

  private isAllAnswersSet(): boolean {
    if (this.answerOne !== null &&
      this.answerTwo !== null &&
      this.answerThree !== null &&
      this.answerFour !== null) {
      return true;
    }
  }

  private setMissingAnswer(str: string): void {
    if (this.answerOne === null || this.answerOne === '') {
      this.answerOne = str;
      return;
    }

    if (this.answerTwo === null || this.answerTwo === '') {
      this.answerTwo = str;
      return;
    }

    if (this.answerThree === null || this.answerThree === '') {
      this.answerThree = str;
      return;
    }

    if (this.answerFour === null || this.answerFour === '') {
      this.answerFour = str;
      return;
    }
  }

  private hasAlreadyAnswerSet(str): boolean {
    if (this.answerOne === str ||
      this.answerTwo === str ||
      this.answerThree === str ||
      this.answerFour === str) {
      return true;
    }
  }
}
