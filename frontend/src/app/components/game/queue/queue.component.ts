import {Component, HostListener, OnDestroy, OnInit} from '@angular/core';
import {UserService} from '../../../services/user.service';
import {Title} from '@angular/platform-browser';
import {finalize} from 'rxjs/operators';
import {User} from '../../../entity/User';
import {QueueService} from '../../../services/queue.service';
import {NavigationEnd, Router} from '@angular/router';

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
   public readonly router: Router
  ) {}

  imageSrc = '../assets/default_profile_picture.png';
  currentUser: User;
  opponent: User;
  loading: boolean;
  isInQueue: boolean;
  playerInQueueAmount: number;
  queuedPlayers: User[];
  opponentFound = false;

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
      this.queueService.removeFromQueue(user).subscribe();
    }
    clearInterval(this.intV);
    clearInterval(this.intV2);
  }

  public goBack(): void {
    window.history.back();
  }

  public inQueue(): void {
    this.intV2 = window.setInterval(() => {
      this.queueService.playerIsInQueue(this.currentUser.username).subscribe((result) => {
        this.isInQueue = result;
      }, () => this.isInQueue = false);
    }, 1000);
  }

  public getQueueAmount(): void {
    this.intV = setInterval(() => {
      this.queueService.getAmountOfPlayersInQueue().subscribe((result) => {
        this.playerInQueueAmount = result;
        if (this.playerInQueueAmount >= 2) {
          this.queueService.getQueuedPlayers().subscribe((solution) => {
            console.log(solution);
            this.queuedPlayers = solution;
            this.startGame();
          });
          clearInterval(this.intV);
        }
      });
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
      this.removeQueue(this.currentUser);
      this.removeQueue(this.opponent);
      //INSERT INTO GAME TABLE CREATE GAME
      window.setTimeout(() => {
        window.location.href = '/game';
      }, 3500);
    } else {
      alert('An error ocurred!');
      this.removeQueue(this.currentUser);
      window.location.href = '/';
    }
  }
}
