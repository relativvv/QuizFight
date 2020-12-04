import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';
import {User} from '../entity/User';
import {HttpClient} from '@angular/common/http';
import {map} from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})

export class UserService {

  currentUserObject: BehaviorSubject<User>;
  public currentUser: Observable<User>;
  backend = 'http://localhost:8000';
  constructor(private http: HttpClient) {
    this.currentUserObject = new BehaviorSubject<User>(JSON.parse(localStorage.getItem('currentUser')));
    this.currentUser = this.currentUserObject.asObservable();
  }

  public registerUser(user: User): Observable<User> {
    return this.http.post<User>(this.backend + '/user/register', user);
  }

  public loginUser(username: string, password: string): Observable<User> {
    return this.http.post<User>(this.backend + '/user/login', {username, password})
      .pipe(
        map(user => {
          localStorage.setItem('currentUser', JSON.stringify(user));
          this.currentUserObject.next(user);
          return user;
        })
      );
  }

  public isLoggedIn(): boolean {
    return !!this.currentUserValue;
  }

  public getMoney(): number {
    return 18736;
  }

  public get currentUserValue(): User {
    return this.currentUserObject.value;
  }

  public logout(): void {
    localStorage.removeItem('currentUser');
    this.currentUserObject.next(null);
    window.location.href = '/';
  }
}
