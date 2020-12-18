import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';
import {User} from '../entity/User';
import {HttpClient} from '@angular/common/http';
import {map} from 'rxjs/operators';

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

  public updateUser(username: string, email: string, money: number): Observable<User> {
    return this.http.put<User>(this.backend + '/user/update', {
      validateUsername: this.currentUserValue.username,
      validatePassword: this.currentUserValue.password,
      username,
      email,
      money
    });
  }

  public deleteUser(id: number): Observable<User> {
    return this.http.post<User>(this.backend + '/user/delete?id=' + id, {
      validateUsername: this.currentUserValue.username,
      validatePassword: this.currentUserValue.password
    });
  }


  /* ---------------------------- IMAGE ------------------------- */
  public getUserImage(username: string): Observable<string> {
    return this.http.get<string>(this.backend + `/user/getUserImage?username=` + username);
  }

  public uploadProfilePicture(image): Observable<any> {
    return this.http.put(this.backend + '/user/uploadimage',
      { username: this.currentUserValue.username, password: this.currentUserValue.password, image});
  }
  /* ---------------------------- IMAGE ------------------------- */

  public isLoggedIn(): boolean {
    return !!this.currentUserValue;
  }

  public getMoney(username: string): Observable<number> {
    return this.http.get<number>(this.backend + '/user/getmoney?username=' + username);
  }

  public get currentUserValue(): User {
    return this.currentUserObject.value;
  }

  public updatePassword(username: string, oldPassword: string, newPassword: string): Observable<User> {
    return this.http.put<User>(this.backend + '/user/changepassword', { username, oldPassword, newPassword });
  }

  public sendResetMail(url: string, email: string): Observable<any> {
    return this.http.post<any>(this.backend + '/user/resetpassword', {url, email});
  }

  public getAllUser(user: User): Observable<any> {
    return this.http.post<any>(this.backend + '/user/getalluser', { username: user.username, password: user.password });
  }

  public isAdmin(user: User): Observable<boolean> {
    return this.http.get<boolean>(this.backend + '/user/isadmin?id=' + user.id);
  }

  public logout(): void {
    localStorage.removeItem('currentUser');
    this.currentUserObject.next(null);
    window.location.href = '/';
  }
}
