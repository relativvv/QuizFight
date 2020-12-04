import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Question} from '../entity/Question';

@Injectable({
  providedIn: 'root'
})

export class TriviaService {

  constructor(private readonly http: HttpClient) {}

  public getQuestion(amount: number,
                     type: 'multiple' | 'boolean',
                     difficulty: 'easy' | 'medium' | 'hard',
                     category: number
                    ): Observable<Question> {
    return this.http.get<Question>('https://opentdb.com/api.php?amount=' + amount +
      '&category=' + category + '&difficulty=' + difficulty + '&type=' + type);
  }

}
