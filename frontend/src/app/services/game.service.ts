import {Injectable} from '@angular/core';
import {TriviaService} from './trivia.service';

@Injectable({
  providedIn: 'root'
})

export class GameService {

  constructor(private readonly triviaService: TriviaService) {}

  public generateGameKey() {

  }

  public getOpponent() {

  }

  public getPlayers() {

  }

  public getQuestion() {

  }

  public askQuestion() {

  }

  public dealDamage() {

  }
}
