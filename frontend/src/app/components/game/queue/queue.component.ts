import {Component, HostListener, OnDestroy, OnInit} from '@angular/core';
import {UserService} from '../../../services/user.service';
import {Title} from '@angular/platform-browser';
import {finalize, switchMap, timeout} from 'rxjs/operators';
import {User} from '../../../entity/User';
import {NavigationEnd, Router} from '@angular/router';
import {GameService} from '../../../services/game.service';
import {ToastrService} from 'ngx-toastr';
import {environment} from '../../../../environments/environment';
import {Game} from '../../../entity/Game';

@Component({
  selector: 'app-queue',
  templateUrl: './queue.component.html',
  styleUrls: ['./queue.component.less']
})
export class QueueComponent implements OnInit, OnDestroy {

  constructor(
   private readonly userService: UserService,
   private readonly titleService: Title,
   public readonly router: Router,
   private readonly gameService: GameService,
   private readonly toastService: ToastrService
  ) {}

  imageSrc = '../assets/default_profile_picture.png';
  currentUser: User;
  opponent: User;
  loading: boolean;
  gameFound: boolean;
  socket: any;
  isConnection = true;
  game: Game;

  errorSounds = ['../../../../assets/error-1.mp3', '../../../../assets/error-2.mp3'];

  ngOnInit(): void {
    this.titleService.setTitle('QuizFight - Queue');
    this.currentUser = this.userService.currentUserValue;

    this.checkIfQueueSocketIsOpen();

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
        this.removeQueue();
      }
    });

    this.socket = new WebSocket(environment.queueSocket);
    this.socket.onopen = () => {
      this.socket.send(
        JSON.stringify({
          type: 'joined',
          username: this.currentUser.username
        })
      );
    };

    this.socket.onError = () => {
      this.toastService.error('Connection to the queue failed!');

      const audio = new Audio(this.errorSounds[Math.floor(Math.random() * this.errorSounds.length)]);
      audio.volume = 0.15;
      audio.play();
    };

    this.socket.onmessage = (e) => {
      const json = JSON.parse(e.data);
      switch (json.type) {
        case 'gameFound':
          this.socket.send(
            JSON.stringify({
              type: 'readyToCreate',
            })
          );
          break;
        case 'initiateCreation':
          if (json.p1 && json.p2) {
            const game = {
              p1: json.p1,
              p2: json.p2
            };
            this.getOpponent(json.p1, json.p2);
            this.gameFound = true;

            this.toastService.success('Game found!');
            const audio = new Audio('../../../../assets/game-found.mp3');
            audio.volume = 0.2;
            audio.play();

            if (this.currentUser.username === json.p1) {

              setTimeout(() => {
                this.gameService.createNewGame(game).pipe(
                  switchMap((rs) => {
                    this.game = rs;

                    this.socket.send(
                      JSON.stringify({
                        type: 'redirectUsers',
                      })
                    );
                    return this.gameService.startGameSocket(rs.port).pipe(
                      timeout(1000000)
                    );
                  })
                ).subscribe(() => {
                });
              }, 2000);

            }
          }
          break;
        case 'redirect':
          setTimeout(() => {
            this.router.navigate(['/game']);
            this.socket.close();
          }, 2000);
          break;
      }
    };
  }

  @HostListener('window:unload', [ '$event' ])
  unloadHandler(): void {
    this.removeQueue();
  }

  ngOnDestroy(): void {
    this.removeQueue();
  }

  removeQueue(): void {
    this.socket.close();
  }

  goBack(): void {
    this.toastService.success('You left the queue');
    this.removeQueue();
    window.location.href = '/';
  }

  private getOpponent(p1Name: string, p2Name: string): void {
    if (p1Name === this.currentUser.username) {
      this.userService.getUserByUserName(p2Name).subscribe((result) => {
        this.opponent = result;
      });
    } else {
      this.userService.getUserByUserName(p1Name).subscribe((result) => {
        this.opponent = result;
      });
    }
  }

  private checkIfQueueSocketIsOpen(): void {
    const endInt = setInterval(() => {
      if (this.gameFound === false) {
        if (this.socket.readyState === WebSocket.CLOSED || this.socket.readyState === WebSocket.CLOSING) {
          this.toastService.error('Connection to the queue failed!');

          const audio = new Audio(this.errorSounds[Math.floor(Math.random() * this.errorSounds.length)]);
          audio.volume = 0.15;
          audio.play();
          this.isConnection = false;
          clearInterval(endInt);
          return;
        }
      } else {
        clearInterval(endInt);
        return;
      }
    }, 5000);
  }
}
