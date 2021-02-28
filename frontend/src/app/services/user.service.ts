import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';
import {User} from '../entity/User';
import {HttpClient} from '@angular/common/http';
import {map} from 'rxjs/operators';
import {Router} from '@angular/router';
import {ToastrService} from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})

export class UserService {

  currentUserObject: BehaviorSubject<User>;
  public currentUser: Observable<User>;
  backend = 'http://localhost:8000';
  constructor(private http: HttpClient, private router: Router, private readonly toastService: ToastrService) {
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

  public updateUser(username: string,
                    email: string,
                    money: number,
                    allTimeCorrect: number,
                    gamesPlayed: number,
                    gamesWon: number): Observable<User> {
    return this.http.put<User>(this.backend + '/user/update', {
      username,
      email,
      money,
      allTimeCorrect,
      gamesPlayed,
      gamesWon
    }).pipe(
      map(user => {
        localStorage.removeItem('currentUser');
        localStorage.setItem('currentUser', JSON.stringify(user));
        this.currentUserObject.next(user);
        return user;
      }));
  }

  public deleteUser(id: number): Observable<User> {
    return this.http.post<User>(this.backend + '/user/delete?id=' + id, {
      validateUsername: this.currentUserValue.username,
      validatePassword: this.currentUserValue.password
    });
  }

  public getRank(id: number): Observable<number> {
    return this.http.get<number>(this.backend + '/user/getrank?id=' + id);
  }

  public getTopList(): Observable<User[]> {
    return this.http.get<User[]>(this.backend + '/user/toplist');
  }


  /* ---------------------------- IMAGE ------------------------- */
  public getUserImage(username: string): Observable<string> {
    return this.http.get<string>(this.backend + `/user/getUserImage?username=` + username);
  }

  public uploadProfilePicture(image): Observable<User> {
    return this.http.put<User>(this.backend + '/user/uploadimage',
      { username: this.currentUserValue.username, password: this.currentUserValue.password, image}).pipe(
      map(user => {
        localStorage.removeItem('currentUser');
        localStorage.setItem('currentUser', JSON.stringify(user));
        this.currentUserObject.next(user);
        return user;
      }));
  }
  /* ---------------------------- IMAGE ------------------------- */

  public isLoggedIn(): boolean {
    return !!this.currentUserValue;
  }

  public getMoney(username: string): Observable<number> {
    return this.http.get<number>(this.backend + '/user/getmoney?username=' + username);
  }

  public addMoney(amount: number): Observable<User> {
    return this.http.put<User>(this.backend + '/user/addmoney',
      { username: this.currentUserValue.username, password: this.currentUserValue.password, amount});
  }

  public get currentUserValue(): User {
    return this.currentUserObject.value;
  }

  public updatePassword(username: string, oldPassword: string, newPassword: string): Observable<User> {
    return this.http.put<User>(this.backend + '/user/changepassword', { username, oldPassword, newPassword }).pipe(
      map(user => {
        localStorage.removeItem('currentUser');
        localStorage.setItem('currentUser', JSON.stringify(user));
        this.currentUserObject.next(user);
        return user;
      })
    );
  }

  public sendResetMail(email: string): Observable<any> {
    return this.http.post<any>(this.backend + '/user/resetpassword', {email});
  }

  public resetPassword(token: string, password: string): Observable<any> {
    return this.http.post<any>(this.backend + '/user/passwordreset', {token, password});
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
    this.router.navigate(['/']);
    this.toastService.success('Successfully logged out!');
    window.location.href = '/';
  }
}
