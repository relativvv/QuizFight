import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {User} from '../entity/User';

@Injectable({
  providedIn: 'root'
})

export class QueueService {

  constructor(private http: HttpClient) {}

  backend = 'http://localhost:8000';

  public getAmountOfPlayersInQueue(): Observable<number> {
    return this.http.get<number>(this.backend + '/queue/totalamount');
  }

  public getQueuedPlayers(): Observable<User[]> {
    return this.http.get<User[]>(this.backend + '/queue/getqueued');
  }

  public playerIsInQueue(username: string): Observable<boolean> {
    return this.http.get<boolean>(this.backend + '/user/isinqueue?username=' + username);
  }

  public addPlayerToQueue(user: User): Observable<User> {
    return this.http.post<User>(this.backend + '/queue/addtoqueue', user);
  }

  public removeFromQueue(user: User): Observable<User> {
    return this.http.post<User>(this.backend + '/queue/removefromqueue', user);
  }
}
