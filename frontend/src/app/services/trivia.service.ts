import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class TriviaService {

  constructor(private readonly http: HttpClient) {}

  public getQuestion(amount: number,
                     type: 'multiple' | 'boolean',
  ): Observable<any> {
    return this.http.get<any>('https://opentdb.com/api.php?amount=' + amount + '&type=' + type);
  }

}
