import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';
import {Game} from '../entity/Game';
import {User} from '../entity/User';
import {HttpClient} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})

export class GameService {

  currentUserObject: BehaviorSubject<User>;
  public currentUser: Observable<User>;
  backend = 'http://localhost:8000';
  constructor(private http: HttpClient) {
    this.currentUserObject = new BehaviorSubject<User>(JSON.parse(localStorage.getItem('currentUser')));
    this.currentUser = this.currentUserObject.asObservable();
  }

  getAllGames(): Observable<Game[]> {
    return this.http.post<Game[]>(this.backend + '/game/getrunning',
      {
        validateUsername: this.currentUserValue.username,
        validatePassword: this.currentUserValue.password
      });
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

  getFullGameByPlayer(): Observable<Game> {
    return this.http.post<Game>(this.backend + '/game/getfullgame',
      {
        username: this.currentUserValue.username,
        password: this.currentUserValue.password
      });
  }

  updateGameObject(game: Game, type?: string): Observable<Game> {
    return this.http.put<Game>(this.backend + '/game/updategame',
      {
        validateUsername: this.currentUserValue.username,
        validatePassword: this.currentUserValue.password,
        type,
        game
      });
  }

  updateQuestion(game: Game): Observable<Game> {
    return this.http.put<Game>(this.backend + '/game/updatequestion',
      {
        validateUsername: this.currentUserValue.username,
        validatePassword: this.currentUserValue.password,
        game
      });
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
