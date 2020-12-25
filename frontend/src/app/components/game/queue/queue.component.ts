import {Component, HostListener, OnDestroy, OnInit} from '@angular/core';
import {UserService} from '../../../services/user.service';
import {Title} from '@angular/platform-browser';
import {finalize} from 'rxjs/operators';
import {User} from '../../../entity/User';
import {QueueService} from '../../../services/queue.service';
import {NavigationEnd, Router} from '@angular/router';
import {GameService} from '../../../services/game.service';
import {Game} from '../../../entity/Game';
import {ToastrService} from 'ngx-toastr';

@Component({
  selector: 'app-queue',
  templateUrl: './queue.component.html',
  styleUrls: ['./queue.component.less']
})
export class QueueComponent implements OnInit, OnDestroy {

  constructor(
   private readonly userService: UserService,
   private readonly titleService: Title,
   public readonly queueService: QueueService,
   public readonly router: Router,
   private readonly gameService: GameService,
   private readonly toastService: ToastrService
  ) {}

  imageSrc = '../assets/default_profile_picture.png';
  currentUser: User;
  opponent: User;
  loading: boolean;
  isInQueue = true;
  playerInQueueAmount: number;
  queuedPlayers: User[];
  opponentFound = false;
  toCreate: Game;
  isIngame = false;

  intV: any;
  intV2: any;

  ngOnInit(): void {
    this.titleService.setTitle('QuizFight - Queue');
    this.currentUser = this.userService.currentUserValue;
    this.inQueue();
    this.getQueueAmount();
    if (this.currentUser != null) {
      this.loading = true;
      this.userService.getUserImage(this.currentUser.username).pipe(
        finalize(() => this.loading = false)
      ).subscribe((e) => {
        this.imageSrc = e.toString();
      }, () => this.imageSrc = '../assets/default_profile_picture.png');
    }
    this.router.events.subscribe((val) => {
      if (val instanceof NavigationEnd) {
        this.removeQueue(this.currentUser);
      }
    });
  }

  @HostListener('window:unload', [ '$event' ])
  unloadHandler(): void {
    this.removeQueue(this.currentUser);
  }

  ngOnDestroy(): void {
    this.removeQueue(this.currentUser);
  }

  public removeQueue(user: User): void {
    if (this.isInQueue) {
      this.queueService.removeFromQueue(user.username, user.password).subscribe();
    }
    clearInterval(this.intV);
    clearInterval(this.intV2);
  }

  public goBack(): void {
    this.toastService.success('You left the queue');
    this.removeQueue(this.currentUser);
    window.location.href = '/';
  }

  public inQueue(): void {
    this.intV2 = window.setInterval(() => {
      this.queueService.playerIsInQueue(this.currentUser.username).subscribe((result) => {
        this.isInQueue = result;
      }, () => this.isInQueue = false);
    }, 1000);
  }

  public getQueueAmount(): void {
    let isReady = true;
    this.intV = setInterval(() => {
      if (isReady) {
        isReady = false;
        this.queueService.getAmountOfPlayersInQueue().subscribe((result) => {
          this.playerInQueueAmount = result;
          if (this.playerInQueueAmount >= 2) {
            this.queueService.getQueuedPlayers().subscribe((solution) => {
              this.queuedPlayers = solution;
              this.startGame();
            });
            clearInterval(this.intV);
          }
        }, () => {}, () => { isReady = true; });
      }
    }, 1000);
  }

  public getOpponent(): void {
    for (let i = 0; i < this.queuedPlayers.length; i++) {
      if (this.queuedPlayers[i].username !== this.currentUser.username) {
        this.opponent = this.queuedPlayers[i];
        return;
      }
    }
  }

  public startGame(): void {
    this.getOpponent();
    if (this.opponent !== null) {
      document.getElementById('waiting-container').remove();
      this.opponentFound = true;

      this.toCreate = {
          currentDifficulty: null,
          p1Status: 'q1',
          p2Status: 'q1',
          p1HP: 100,
          p2HP: 100,
          p1: this.currentUser,
          p2: this.opponent,
          p1Locked: null,
          p2Locked: null,
          p1Correct: 0,
          p2Correct: 0,
          answers: null,
          correctAnswer: null,
          question: null,
          questionNumber: 1,
          mode: 'ingame'
        };

      const played = this.currentUser.gamesPlayed + 1;

      this.userService.updateUser(
        this.currentUser.username,
        this.currentUser.email,
        this.currentUser.money,
        this.currentUser.allTimeCorrect,
        played,
        this.currentUser.gamesWon
      ).subscribe();
      this.gameService.createNewGame(this.toCreate).subscribe(() => {

      }, () => {}, () => { this.router.navigate(['/game']); });
      this.removeQueue(this.currentUser);
      this.toastService.success('Game found!');
      const audio = new Audio('../../../../assets/game-found.mp3');
      audio.play();
    } else {
      this.removeQueue(this.currentUser);
      window.location.href = '/';
      this.toastService.error('An error ocurred, you were kicked out of the queue!');
    }
  }
}
