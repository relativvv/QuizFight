import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';
import {Game} from '../entity/Game';
import {User} from '../entity/User';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})

export class GameService {

  currentUserObject: BehaviorSubject<User>;
  public currentUser: Observable<User>;
  backend = environment.backend;
  constructor(private http: HttpClient) {
    this.currentUserObject = new BehaviorSubject<User>(JSON.parse(localStorage.getItem('currentUser')));
    this.currentUser = this.currentUserObject.asObservable();
  }

  createNewGame(game: Game): Observable<Game> {
    return this.http.post<Game>(this.backend + '/game/createnew',
      {
      validateUsername: this.currentUserValue.username,
      validatePassword: this.currentUserValue.password,
      game
    });
  }

  isIngame(user: User): Observable<any> {
    return this.http.get<any>(this.backend + '/game/isingame?id=' + user.id);
  }

  getGameByPlayer(): Observable<Game> {
    return this.http.post<Game>(this.backend + '/game/getgame',
      {
        username: this.currentUserValue.username,
        password: this.currentUserValue.password
      });
  }

  startGameSocket(port: number): Observable<any> {
    return this.http.get(this.backend + '/game/startsocket?port=' + port);
  }

  deleteGame(id: number): Observable<Game> {
    return this.http.post<Game>(this.backend + '/game/deletegame',
      {
        validateUsername: this.currentUserValue.username,
        validatePassword: this.currentUserValue.password,
        id
      });
  }

  public get currentUserValue(): User {
    return this.currentUserObject.value;
  }
}
