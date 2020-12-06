import { Component, OnInit } from '@angular/core';
import {UserService} from '../../services/user.service';
import {Title} from '@angular/platform-browser';
import {QueueService} from '../../services/queue.service';
import {User} from '../../entity/User';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.less']
})
export class HomeComponent implements OnInit {

  constructor(
    public readonly userService: UserService,
    public readonly titleService: Title,
    public readonly queueService: QueueService
  ) { }

  public user: User;

  ngOnInit(): void {
    this.titleService.setTitle('QuizFight - Home');
    this.user = this.userService.currentUserValue;
  }

  public insertIntoQueue(): void {
    this.queueService.addPlayerToQueue(this.user).subscribe();
  }
}
