import {Component, HostListener, OnDestroy, OnInit} from '@angular/core';
import {UserService} from '../../../services/user.service';
import {GameService} from '../../../services/game.service';
import {Title} from '@angular/platform-browser';
import {ToastrService} from 'ngx-toastr';
import {User} from '../../../entity/User';
import {Game} from '../../../entity/Game';
import {environment} from '../../../../environments/environment';
import {switchMap} from 'rxjs/operators';

@Component({
  selector: 'app-ingame',
  templateUrl: './ingame.component.html',
  styleUrls: ['./ingame.component.less']
})
export class IngameComponent implements OnInit, OnDestroy {


  constructor(
    public readonly userService: UserService,
    private readonly gameService: GameService,
    private readonly titleService: Title,
    private readonly toastService: ToastrService
  ) {
    this.titleService.setTitle('QuizFight - Ingame');
    this.currentUser = userService.currentUserValue;
  }

  loading = false;
  currentUser: User;
  currentUserType;
  opponent: User;
  opponentType: string;
  game: Game;
  socket: any;
  timer = 132;
  waitingForOpponent: boolean;
  winner: string;
  countDownInterval: any;
  countUpInterval: any;
  fiftyfifty = false;
  reroll = false;
  backupAnswers = [];

  answerOne = null;
  answerTwo = null;
  answerThree = null;
  answerFour = null;
  correctAnswer: string;

  currentMode: 'finished' | 'ingame' | 'waiting' | 'questionResult';
  p1Locked: string;
  p2Locked: string;
  p1HP: number;
  p2HP: number;
  p1Correct: number;
  p2Correct: number;
  questionString: string;
  money: number;
  questionNumber = 1;
  errorSounds = ['../../../../assets/error-1.mp3', '../../../../assets/error-2.mp3'];
  winSounds = ['../../../../assets/win-1.mp3', '../../../../assets/win-2.mp3'];
  loseSound = ['../../../../assets/lose-1.mp3', '../../../../assets/lose-2.mp3'];
  socketBackend = environment.socketBackend;


  ngOnInit(): void {
    this.getGame();
  }

  ngOnDestroy(): void {
    this.deleteGame(true);
  }

  @HostListener('window:unload', [ '$event' ])
  unloadHandler(event): void {
    this.deleteGame(true);
  }

  getGame(): void {
    this.gameService.getGameByPlayer().pipe(
      switchMap((game: Game) => {
      this.game = game;
      this.checkIfGameExists();
      this.manageSocket();
      if (game.p1.username === this.currentUser.username) {
        this.currentUserType = 'p1';
        this.opponent = game.p2;
        this.opponentType = 'p2';

        this.currentUser.gamesPlayed++;
        return this.userService.updateUser(
          this.currentUser.username,
          this.currentUser.email,
          this.currentUser.money,
          this.currentUser.allTimeCorrect,
          this.currentUser.gamesPlayed,
          this.currentUser.gamesWon
        );


      } else {
        this.currentUserType = 'p2';
        this.opponent = game.p1;
        this.opponentType = 'p1';

        this.currentUser.gamesPlayed++;
        return this.userService.updateUser(
          this.currentUser.username,
          this.currentUser.email,
          this.currentUser.money,
          this.currentUser.allTimeCorrect,
          this.currentUser.gamesPlayed,
          this.currentUser.gamesWon
        );
      }
    })).subscribe(() => {}, () => { this.deleteGame(true); });
  }


  private manageSocket(): void {
    this.socket = new WebSocket(environment.socketBackend + this.game.port);
    this.socket.onopen = (e) => {
      this.socket.send(
        JSON.stringify({
          type: 'joined',
          username: this.currentUser.username,
          userType: this.currentUserType
        })
      );
    };

    this.socket.onError = (e) => {
      this.toastService.error('Connection to the game failed!');
      const audio = new Audio(this.errorSounds[Math.floor(Math.random() * this.errorSounds.length)]);
      audio.volume = 0.15;
      audio.play();
      setTimeout(() => {
        this.deleteGame(false);
      }, 1500);

    };

    this.socket.onmessage = (e) => {
      const json = JSON.parse(e.data);
      switch (json.type) {
        case 'firstQuestion':
          this.questionString = json.questionString;
          this.correctAnswer = json.correctAnswer;
          this.money = json.money;
          this.currentMode = json.currentMode;
          this.p1HP = json.p1HP;
          this.p2HP = json.p2HP;
          this.p1Correct = json.p1Correct;
          this.p2Correct = json.p2Correct;
          this.setAnswers(json.answers);

          this.countDownInterval = setInterval(() => {
            this.timer--;

            if (this.timer <= 0) {
              this.socket.send(
                JSON.stringify({
                  type: 'readyQuestion',
                  username: this.currentUser.username,
                  userType: this.currentUserType
                })
              );

              this.currentMode = 'waiting';
              clearInterval(this.countDownInterval);
            }
          }, 82);
          break;

        case 'questionFinish':
          this.currentMode = 'questionResult';
          this.correctAnswer = json.correctAnswer;
          if (this.fiftyfifty) {
            this.setAnswers(this.backupAnswers);
          }

          if (this.game.p1.username === this.currentUser.username) {
            if (this.correctAnswer === this.p1Locked) {
              this.p1Correct++;
              const dmg = this.randomNumber(32, 45);
              this.dealDamage(dmg);

              const audio = new Audio('../../../../assets/correct.mp3');
              audio.volume = 0.15;
              audio.play();

              this.toastService.success('Correct, you dealed ' + dmg + ' damage!');

              this.currentUser.allTimeCorrect++;
              this.currentUser.money += this.money;
              this.userService.updateUser(
                this.currentUser.username,
                this.currentUser.email,
                this.currentUser.money,
                this.currentUser.allTimeCorrect,
                this.currentUser.gamesPlayed,
                this.currentUser.gamesWon
              ).subscribe();

            } else {
              this.toastService.error('Sorry, that was not correct!');
              const audio = new Audio('../../../../assets/wrong.mp3');
              audio.volume = 0.15;
              audio.play();
            }

          } else if (this.game.p2.username === this.currentUser.username) {
            if (this.correctAnswer === this.p2Locked) {
              this.p2Correct++;
              const dmg = this.randomNumber(32, 45);
              this.dealDamage(dmg);

              this.toastService.success('Correct, you dealed ' + dmg + ' damage!');

              const audio = new Audio('../../../../assets/correct.mp3');
              audio.volume = 0.15;
              audio.play();

              this.currentUser.allTimeCorrect++;
              this.currentUser.money += this.money;
              this.userService.updateUser(
                this.currentUser.username,
                this.currentUser.email,
                this.currentUser.money,
                this.currentUser.allTimeCorrect,
                this.currentUser.gamesPlayed,
                this.currentUser.gamesWon
              ).subscribe();

            } else {
              this.toastService.error('Sorry, that was not correct!');
              const audio = new Audio('../../../../assets/wrong.mp3');
              audio.volume = 0.15;
              audio.play();
            }
          }

          this.p1Locked = json.p1Locked;
          this.p2Locked = json.p2Locked;
          if (this.game.p1.username === this.currentUser.username) {
            this.socket.send(
              JSON.stringify({
                type: 'readyQuestionFinish',
                username: this.currentUser.username,
                userType: this.currentUserType,
                p1Correct: this.p1Correct,
                p2HP: this.p2HP
              })
            );
          } else if (this.game.p2.username === this.currentUser.username) {
            this.socket.send(
              JSON.stringify({
                type: 'readyQuestionFinish',
                username: this.currentUser.username,
                userType: this.currentUserType,
                p2Correct: this.p2Correct,
                p1HP: this.p1HP
              })
            );
          }
          break;

        case 'updatePlayerData':
          this.p1Correct = json.p1Correct;
          this.p2Correct = json.p2Correct;
          this.p1HP = json.p1HP;
          this.p2HP = json.p2HP;

          if (this.p1HP <= 0 || this.p2HP <= 0) {
            this.currentMode = 'finished';
            this.p1Locked = null;
            this.p2Locked = null;
            this.questionString = null;
            this.toastService.success('The game has finished!');
            this.socket.send(
              JSON.stringify({
                type: 'endGame',
                username: this.currentUser.username,
                userType: this.currentUserType,
              })
            );

            if (this.p1HP <= 0 && this.p2HP <= 0) {
              this.winner = 'both';
            } else if (this.p1HP <= 0) {
              this.winner = 'p2';

              this.toastService.success('You won, you gained 150 Coins!');
              this.currentUser.gamesWon++;
              this.currentUser.money += 150;
              this.userService.updateUser(
                this.currentUser.username,
                this.currentUser.email,
                this.currentUser.money,
                this.currentUser.allTimeCorrect,
                this.currentUser.gamesPlayed,
                this.currentUser.gamesWon
              ).subscribe();

              if (this.game.p2.username === this.currentUser.username) {
                const audio = new Audio(this.winSounds[Math.floor(Math.random() * this.winSounds.length)]);
                audio.volume = 0.15;
                audio.play();
              } else if (this.game.p1.username === this.currentUser.username) {
                const audio = new Audio(this.loseSound[Math.floor(Math.random() * this.winSounds.length)]);
                audio.volume = 0.15;
                audio.play();
              }

            } else if (this.p2HP <= 0) {
              this.winner = 'p1';

              this.toastService.success('You won, you gained 150 Coins!');
              this.currentUser.gamesWon++;
              this.currentUser.money += 150;
              this.userService.updateUser(
                this.currentUser.username,
                this.currentUser.email,
                this.currentUser.money,
                this.currentUser.allTimeCorrect,
                this.currentUser.gamesPlayed,
                this.currentUser.gamesWon
              ).subscribe();

              if (this.game.p1.username === this.currentUser.username) {
                const audio = new Audio(this.winSounds[Math.floor(Math.random() * this.winSounds.length)]);
                audio.volume = 0.15;
                audio.play();
              } else if (this.game.p2.username === this.currentUser.username) {
                const audio = new Audio(this.loseSound[Math.floor(Math.random() * this.winSounds.length)]);
                audio.volume = 0.15;
                audio.play();
              }
            }

            this.socket.close();
            return;
          }

          this.socket.send(
            JSON.stringify({
              type: 'emitStartCountUp',
              username: this.currentUser.username,
              userType: this.currentUserType,
            })
          );
          break;

        case 'startCountUp':
          this.countUpInterval = setInterval(() => {
            this.timer++;

            if (this.timer === 95) {
              document.getElementsByClassName('question')[0].classList.add('drop-out');
              document.getElementsByClassName('question-answers')[0].classList.add('drop-out');
              window.setTimeout(() => {
                document.getElementsByClassName('question')[0].classList.remove('drop-out');
                document.getElementsByClassName('question-answers')[0].classList.remove('drop-out');
              }, 5000);
            }

            if (this.timer >= 132) {
              this.p1Locked = null;
              this.p2Locked = null;
              this.answerOne = null;
              this.answerTwo = null;
              this.answerThree = null;
              this.answerFour = null;
              this.correctAnswer = null;

              this.currentMode = 'ingame';

              this.socket.send(
                JSON.stringify({
                  type: 'readyCountUp',
                  username: this.currentUser.username,
                  userType: this.currentUserType
                })
              );
              clearInterval(this.countUpInterval);
            }
          }, 120);
          break;

        case 'nextQuestion':
          this.questionNumber++;
          this.timer = 132;
          this.questionString = json.questionString;
          this.money = json.money;
          this.setAnswers(json.answers);

          document.getElementsByClassName('question')[0].classList.add('fade-in');
          document.getElementsByClassName('question-answers')[0].classList.add('fade-in');
          window.setTimeout(() => {
            document.getElementsByClassName('question')[0].classList.remove('fade-in');
            document.getElementsByClassName('question-answers')[0].classList.remove('fade-in');
          }, 3000);

          const newNumber = document.createElement('button');
          const matFab = document.createAttribute('mat-fab');
          const ngContentAtt = document.createAttribute('_ngcontent-frq-c244');
          newNumber.setAttributeNode(matFab);
          newNumber.setAttributeNode(ngContentAtt);
          newNumber.style.backgroundColor = '#0084b8';
          newNumber.classList.add('mat-focus-indicator');
          newNumber.classList.add('stepper');
          newNumber.classList.add('mat-fab');
          newNumber.classList.add('mat-button-base');
          newNumber.classList.add('mat-accent');
          newNumber.classList.add('get-big');
          newNumber.innerHTML = this.questionNumber.toString();
          document.getElementById('question-stepper').insertBefore(
            newNumber, document.getElementById('question-stepper').lastChild
          );

          this.countDownInterval = setInterval(() => {
            this.timer--;

            if (this.timer <= 0) {
              this.socket.send(
                JSON.stringify({
                  type: 'readyQuestion',
                  username: this.currentUser.username,
                  userType: this.currentUserType
                })
              );
              this.currentMode = 'waiting';
              clearInterval(this.countDownInterval);
            }
          }, 82);
          break;
      }
    };
  }

  private dealDamage(dmg: number): void {
    if (this.game.p1.username === this.currentUser.username) {
      this.p2HP -= dmg;
    } else if (this.game.p2.username === this.currentUser.username) {
      this.p1HP -= dmg;
    }
  }

  private setAnswers(arr: any[]): any {
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

  private randomNumber(min, max): number {
    return Math.floor(Math.random() * (max - min + 1) + min);
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


  public lockAnswer(type: 'one' | 'two' | 'three' | 'four'): void {
    if (this.currentMode === 'ingame' && this.game) {
      switch (type) {
        case 'one':
          document.getElementById('answerOne').style.backgroundColor = 'orange';
          document.getElementById('answerFour').style.backgroundColor = '#3f73e5';
          document.getElementById('answerThree').style.backgroundColor = '#3f73e5';
          document.getElementById('answerTwo').style.backgroundColor = '#3f73e5';
          if (this.game.p1.username === this.currentUser.username) {
            this.p1Locked = this.answerOne;
          } else {
            this.p2Locked = this.answerOne;
          }

          this.socket.send(
            JSON.stringify({
              type: 'lockAnswer',
              answer: 'one',
              answerString: this.answerOne,
              username: this.currentUser.username,
              userType: this.currentUserType
            })
          );
          break;
        case 'two':
          document.getElementById('answerTwo').style.backgroundColor = 'orange';
          document.getElementById('answerFour').style.backgroundColor = '#3f73e5';
          document.getElementById('answerThree').style.backgroundColor = '#3f73e5';
          document.getElementById('answerOne').style.backgroundColor = '#3f73e5';
          if (this.game.p1.username === this.currentUser.username) {
            this.p1Locked = this.answerTwo;
          } else {
            this.p2Locked = this.answerTwo;
          }

          this.socket.send(
            JSON.stringify({
              type: 'lockAnswer',
              answer: 'two',
              answerString: this.answerTwo,
              username: this.currentUser.username,
              userType: this.currentUserType
            })
          );
          break;
        case 'three':
          document.getElementById('answerThree').style.backgroundColor = 'orange';
          document.getElementById('answerFour').style.backgroundColor = '#3f73e5';
          document.getElementById('answerTwo').style.backgroundColor = '#3f73e5';
          document.getElementById('answerOne').style.backgroundColor = '#3f73e5';
          if (this.game.p1.username === this.currentUser.username) {
            this.p1Locked = this.answerThree;
          } else {
            this.p2Locked = this.answerThree;
          }

          this.socket.send(
            JSON.stringify({
              type: 'lockAnswer',
              answer: 'three',
              answerString: this.answerThree,
              username: this.currentUser.username,
              userType: this.currentUserType
            })
          );
          break;
        case 'four':
          document.getElementById('answerFour').style.backgroundColor = 'orange';
          document.getElementById('answerThree').style.backgroundColor = '#3f73e5';
          document.getElementById('answerTwo').style.backgroundColor = '#3f73e5';
          document.getElementById('answerOne').style.backgroundColor = '#3f73e5';
          if (this.game.p1.username === this.currentUser.username) {
            this.p1Locked = this.answerFour;
          } else {
            this.p2Locked = this.answerFour;
          }

          this.socket.send(
            JSON.stringify({
              type: 'lockAnswer',
              answer: 'four',
              answerString: this.answerFour,
              username: this.currentUser.username,
              userType: this.currentUserType
            })
          );
          break;
      }
    } else {
      this.toastService.error('You cannot lock an answer at the moment');
    }
  }

  private checkIfGameExists(): void {
    const endInt = setInterval(() => {
      if (this.currentMode !== 'finished') {
        if (this.socket.readyState === WebSocket.CLOSED || this.socket.readyState === WebSocket.CLOSING) {
          this.errorAction();
          clearInterval(endInt);
          return;
        }

        this.gameService.getGameByPlayer().subscribe(() => {}, () => {
          this.errorAction();
          clearInterval(endInt);
          return;
        });
      }
    }, 5000);
  }

  deleteGame(redirect: boolean): void {
    this.toastService.success('You left the game!');
    this.currentMode = 'finished';
    if (this.socket && (this.socket.readyState !== WebSocket.CLOSED || this.socket.readyState !== WebSocket.CLOSING)) {
      this.socket.close();
    }

    if (this.game) {
      this.gameService.deleteGame(this.game.id).subscribe();
    }

    clearInterval(this.countDownInterval);
    clearInterval(this.countUpInterval);

    if (redirect) {
      window.location.href = '/';
    }
  }

  private errorAction(): void {
    this.toastService.error('The game has ended unexpectedly, maybe your opponent has left the game, or the connection to the server was lost.');
    this.currentMode = 'finished';
    clearInterval(this.countDownInterval);
    clearInterval(this.countUpInterval);

    const audio = new Audio(this.errorSounds[Math.floor(Math.random() * this.errorSounds.length)]);
    audio.volume = 0.15;
    audio.play();
    this.deleteGame(false);
  }
}
