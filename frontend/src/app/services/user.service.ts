import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})

export class UserService {

  constructor() {}

  public isLoggedIn(): boolean {
    return true;
  }

  public getMoney(): number {
    return 18736;
  }
}
