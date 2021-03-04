import {Component, HostListener, OnDestroy, OnInit} from '@angular/core';
import {UserService} from '../../../services/user.service';
import {GameService} from '../../../services/game.service';
import {User} from '../../../entity/User';
import {Game} from '../../../entity/Game';
import {Title} from '@angular/platform-browser';
import {ToastrService} from 'ngx-toastr';
import {catchError, delay, map, repeat, retry, skip, switchMap, takeUntil, tap} from 'rxjs/operators';
import {EMPTY, iif, interval, NEVER, Observable, of, timer} from 'rxjs';

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

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        if (this.currentMode === 'ingame' && this.game) {
          this.leaveGame();
        }
      }
    });
  }

  loading = false;
  answers = [];
  questionString = 'Waiting for question..';
  correctAnswer: string;
  answerOne = null;
  answerTwo = null;
  answerThree = null;
  answerFour = null;
  money: number;
  timer = 132;
  questionNumber: number;
  currentUser: User;
  opponent: User;
  game: Game;
  waitingForOpponent = false;
  currentMode = 'ingame';
  userIsIngame: boolean;
  countUpInterval;
  timerInterval;

  ngOnInit(): void {
    this.isInGame();
    this.getGameObject();
  }

  ngOnDestroy(): void {
    this.leaveGame();
    window.location.href = '/';
    alert('Please stop googling!');
  }

  public runGame(): void {
    this.gameService.getGameByPlayer().pipe(
      switchMap((game: Game) => {
        this.game = game;
        this.questionString = game.question;
        this.getMoney();
        this.setAnswers(game.answers);
        return interval(82).pipe(
          takeUntil(timer(10900))
        );
      }),
      switchMap((n) => {
        if (this.timer > 0) {
          this.timer--;
        }
        if (this.timer <= 0) {
          this.timer--;
          this.currentMode = 'questionResult';
          const newInt = this.questionNumber + 1;
          if (this.game.p1.username === this.currentUser.username) {
            this.game.p1Status = 'q' + newInt;
            return this.gameService.updateGameObject(this.game, 'p1');
          } else {
            this.game.p2Status = 'q' + newInt;
            return this.gameService.updateGameObject(this.game, 'p2');
          }
        }
        return NEVER;
      }),
    switchMap((a) => {
        this.game = a;
        this.waitingForOpponent = true;
        return this.gameService.getFullGameByPlayer();
      }),
    switchMap((fullGame) => {
        if (this.answerOne === fullGame.correctAnswer ||
              this.answerTwo === fullGame.correctAnswer ||
              this.answerThree === fullGame.correctAnswer ||
              this.answerFour === fullGame.correctAnswer) {

              this.game = fullGame;
              this.correctAnswer = fullGame.correctAnswer;

              if (this.game.p1Status === this.game.p2Status) {
                this.waitingForOpponent = false;
                console.log(fullGame);
                if (this.game.p1.username === this.currentUser.username) {
                  if (this.game.p1Locked) {
                    if (this.game.p1Locked === fullGame.correctAnswer) {
                      this.game.p1Correct++;
                      this.game.p1.allTimeCorrect++;
                      this.dealDamage('p2');
                      this.game.p1.money += this.money;
                      this.toastService.success('That was correct, you gained ' + this.money + '$!');
                      return this.userService.addMoney(this.money);
                    } else {
                      this.toastService.error('Sorry, that was not correct!');
                      return this.updateGameObject();
                    }
                  }
                } else if (this.game.p2.username === this.currentUser.username) {
                  if (this.game.p2Locked) {
                    if (this.game.p2Locked === fullGame.correctAnswer) {
                      this.game.p2Correct++;
                      this.game.p2.allTimeCorrect++;
                      this.dealDamage('p1');
                      this.game.p2.money += this.money;
                      this.toastService.success('That was correct, you gained ' + this.money + '$!');
                      return this.userService.addMoney(this.money);
                    } else {
                      this.toastService.error('Sorry, that was not correct!');
                      return this.updateGameObject();
                    }
                  }
                }
              }
            } else {
              this.waitingForOpponent = false;
              return NEVER;
            }
        return this.updateGameObject();
      }),
      switchMap((sd) => {
        if (sd.type === 'p1' || sd.username === this.currentUser.username) {
          return this.gameService.updateGameObject(this.game, 'p1');
        } else if (sd.type === 'p2' || sd.username === this.currentUser.username) {
          return this.gameService.updateGameObject(this.game, 'p2');
        }

        return this.updateGameObject();
      }),
      switchMap((g2) => {
        if (g2.type === 'p1') {
          return this.userService.updateUser(
            this.game.p1.username,
            this.game.p1.email,
            this.game.p1.money,
            this.game.p1.allTimeCorrect,
            this.game.p1.gamesPlayed,
            this.game.p1.gamesWon
          );
        } else if (g2.type === 'p2') {
          return this.userService.updateUser(
            this.game.p2.username,
            this.game.p2.email,
            this.game.p2.money,
            this.game.p2.allTimeCorrect,
            this.game.p2.gamesPlayed,
            this.game.p2.gamesWon
          );
        }
        return EMPTY;
      }),
      switchMap((fds) => {
        return interval(120).pipe(
          takeUntil(timer(1410))
        );
      }),
      switchMap((c) => {
        if (this.timer < 132) {
          this.waitingForOpponent = false;
          this.timer++;
        }

        if (this.timer === 10) {
          return this.gameService.getGameByPlayer();
        }
        return NEVER;
      }),
      switchMap((game) => {
        this.game.p1HP = game.p1HP;
        this.game.p2HP = game.p2HP;
        this.game.p1Correct = game.p1Correct;
        this.game.p2Correct = game.p2Correct;
        return interval(120).pipe(
          takeUntil(timer(4910))
        );
      }),
      switchMap(() => {
        this.timer++;
        if (this.timer === 50) {
          return this.updateQuestion(false);
        }
        return NEVER;
      }),
      switchMap((withQ) => {
        return interval(120).pipe(
          takeUntil(timer(9900))
        );
      }),
      switchMap((kjlo) => {
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
          this.game.p1Locked = null;
          this.game.p2Locked = null;
          this.resetAnswers();
          this.questionString = 'Waiting for question...';
          return this.gameService.getGameByPlayer();
        }
        return NEVER;
      }),
    switchMap((game) => {
        this.game = game;
        if (game.p1HP > 0 && game.p2HP > 0) {
          this.currentMode = 'ingame';
          this.questionNumber++;

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

          this.game.questionNumber = this.questionNumber;
          this.timer = 132;
          this.questionString = 'Waiting for question...';
          this.setAnswers(game.answers);
          this.runGame();
          document.getElementsByClassName('question')[0].classList.add('fade-in');
          document.getElementsByClassName('question-answers')[0].classList.add('fade-in');
          window.setTimeout(() => {
            document.getElementsByClassName('question')[0].classList.remove('fade-in');
            document.getElementsByClassName('question-answers')[0].classList.remove('fade-in');
          }, 3000);
        } else {
          this.currentMode = 'finished';
          const winner = this.getPlayerWithMoreHP();
          return this.userService.updateUser(
            winner.username,
            winner.email,
            winner.money,
            winner.allTimeCorrect,
            winner.gamesPlayed,
            winner.gamesWon + 1
          );
        }
        return EMPTY;
      }),
    ).subscribe(() => {}, () => { this.unexpectedEnd(); return; });
  }

  @HostListener('window:unload', [ '$event' ])
  unloadHandler(event): void {
    this.leaveGame();
  }

  public leaveGame(): void {
    this.toastService.success('You left the game.');
    if (this.game) {
      this.deleteGame().subscribe();
    }
  }

  public backToStart(): void {
    this.leaveGame();
    window.location.href = '/';
  }

  public showWinner(): boolean {
    if (this.game.p1.username === this.currentUser.username) {
      if (this.game.p1HP >= this.game.p2HP) {
        return true;
      }
    } else if (this.game.p1.username === this.opponent.username) {
      if (this.game.p1HP >= this.game.p2HP) {
        return true;
      }
    }
  }

  getPlayerWithMoreHP(): User | null {
    if (this.game.p1HP > this.game.p2HP) {
      return this.game.p1;
    } else if (this.game.p2HP > this.game.p1HP) {
      return this.game.p2;
    }

    return null;
  }

  private deleteGame(): Observable<any> {
    return this.gameService.deleteGame(this.game.id);
  }

  private isInGame(): void {
    this.gameService.isIngame(this.currentUser).subscribe((result) => {
      this.userIsIngame = result.ingame;
    }, () => {
      window.location.href = '/';
    });
  }

  private unexpectedEnd(): void {
    this.toastService.error('The game has ended. Nobody will get a reward.');
    this.currentMode = 'finished';
    this.waitingForOpponent = false;
    this.deleteGame().subscribe();
  }

  private getGameObject(): void {
    this.gameService.getGameByPlayer().subscribe((result) => {
      this.game = result;

      if (this.game.p1.username === this.currentUser.username) {
        this.opponent = this.game.p2;
      } else {
        this.opponent = this.game.p1;
      }

      this.questionString = this.game.question;
      this.questionNumber = this.game.questionNumber;
      this.setAnswers(this.game.answers);
      this.getMoney();
      this.runGame();
    }, () => { this.unexpectedEnd(); window.location.href = '/'; return; });
  }

  private updateQuestion(update = true): Observable<any> {
    if (update) {
      this.resetAnswers();
    }
    return this.gameService.updateQuestion(this.game);
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
            this.game.p1Locked = this.answerOne;
          } else {
            this.game.p2Locked = this.answerOne;
          }
          break;
        case 'two':
          document.getElementById('answerTwo').style.backgroundColor = 'orange';
          document.getElementById('answerFour').style.backgroundColor = '#3f73e5';
          document.getElementById('answerThree').style.backgroundColor = '#3f73e5';
          document.getElementById('answerOne').style.backgroundColor = '#3f73e5';
          if (this.game.p1.username === this.currentUser.username) {
            this.game.p1Locked = this.answerTwo;
          } else {
            this.game.p2Locked = this.answerTwo;
          }
          break;
        case 'three':
          document.getElementById('answerThree').style.backgroundColor = 'orange';
          document.getElementById('answerFour').style.backgroundColor = '#3f73e5';
          document.getElementById('answerTwo').style.backgroundColor = '#3f73e5';
          document.getElementById('answerOne').style.backgroundColor = '#3f73e5';
          if (this.game.p1.username === this.currentUser.username) {
            this.game.p1Locked = this.answerThree;
          } else {
            this.game.p2Locked = this.answerThree;
          }
          break;
        case 'four':
          document.getElementById('answerFour').style.backgroundColor = 'orange';
          document.getElementById('answerThree').style.backgroundColor = '#3f73e5';
          document.getElementById('answerTwo').style.backgroundColor = '#3f73e5';
          document.getElementById('answerOne').style.backgroundColor = '#3f73e5';
          if (this.game.p1.username === this.currentUser.username) {
            this.game.p1Locked = this.answerFour;
          } else {
            this.game.p2Locked = this.answerFour;
          }
          break;
      }
      this.updateGameObject().subscribe();
    } else {
      this.toastService.error('You cannot lock an answer at the moment');
    }
  }


  private dealDamage(who: string): void {
    const crit = Math.floor(Math.random() * 10);
    switch (who) {
      case 'p1':
        if (crit === 5) {
          this.game.p1HP = this.game.p1HP - 45;
          this.toastService.success('CRIT! - You dealed 17 damage!');
        } else {
          this.game.p1HP = this.game.p1HP - 32;
          this.toastService.success('You dealed 10 damage!');
        }
        break;
      case 'p2':
        if (crit === 5) {
          this.game.p2HP = this.game.p2HP - 45;
          this.toastService.success('CRIT! - You dealed 17 damage!');
        } else {
          this.game.p2HP = this.game.p2HP - 32;
          this.toastService.success('You dealed 10 damage!');
        }
        break;

      default:
        return;
    }
  }

  private getMoney(): void {
    switch (this.game.currentDifficulty) {
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
  }

  private resetAnswers(): void {
    this.answerOne = null;
    this.answerTwo = null;
    this.answerThree = null;
    this.answerFour = null;
    this.answers = [];
    this.game.p1Locked = null;
    this.game.p2Locked = null;
    this.correctAnswer = null;
    if (document.getElementById('answerFour') !== null) {
      document.getElementById('answerFour').style.backgroundColor = '#3f73e5';
      document.getElementById('answerThree').style.backgroundColor = '#3f73e5';
      document.getElementById('answerTwo').style.backgroundColor = '#3f73e5';
      document.getElementById('answerOne').style.backgroundColor = '#3f73e5';
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

  private updateGameObject(global = false): Observable<any> {
    if (!global) {
      if (this.game.p1.username === this.currentUser.username) {
        return this.gameService.updateGameObject(this.game, 'p1');
      } else {
        return this.gameService.updateGameObject(this.game, 'p2');
      }
    } else {
      return this.gameService.updateGameObject(this.game);
    }
  }
}
