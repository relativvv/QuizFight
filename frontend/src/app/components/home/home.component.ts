import { Component, OnInit } from '@angular/core';
import {UserService} from '../../services/user.service';
import {Title} from "@angular/platform-browser";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.less']
})
export class HomeComponent implements OnInit {

  constructor(
    public readonly userService: UserService,
    public readonly titleService: Title
  ) { }

  ngOnInit(): void {
    this.titleService.setTitle('QuizFight - Home');
  }

}
