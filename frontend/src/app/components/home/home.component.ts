import { Component, OnInit } from '@angular/core';
import {UserService} from '../../services/user.service';
import {Title} from '@angular/platform-browser';
import {QueueService} from '../../services/queue.service';
import {User} from '../../entity/User';
import {ToastrService} from 'ngx-toastr';
import {GameService} from "../../services/game.service";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.less']
})
export class HomeComponent implements OnInit {

  constructor(
    public readonly userService: UserService,
    public readonly titleService: Title,
    public readonly queueService: QueueService,
    private readonly toastService: ToastrService
  ) { }

  public user: User;
  public fact: string;
  private facts: string[];

  ngOnInit(): void {
    this.titleService.setTitle('QuizFight - Home');
    this.user = this.userService.currentUserValue;
    this.facts = [
      'McDonald’s once made bubblegum-flavored broccoli',
      'Some fungi create zombies, then control their minds',
      'There’s only one letter that doesn’t appear in any U.S. state name - Q',
      'A cow-bison hybrid is called a “beefalo”',
      'Scotland has 421 words for “snow”',
      'Samsung tests phone durability with a butt-shaped robot',
      'The “Windy City” name has nothing to do with Chicago weather',
      'Peanuts aren’t technically nuts',
      'Armadillo shells are bulletproof',
      'Firefighters use wetting agents to make water wetter',
      'The longest English word is 189,819 letters long',
      'Octopuses lay 56,000 eggs at a time',
      'Blue whales eat half a million calories in one mouthful',
      'Most Disney characters wear gloves to keep animation simple',
      'The man with the world’s deepest voice can make sounds humans can’t hear',
      'The current American flag was designed by a high school student',
      'Cows don’t have upper front teeth',
      'Thanks to 3D printing, NASA can basically “email” tools to astronauts',
      'Only a quarter of the Sahara Desert is sandy',
      'There were active volcanoes on the moon when dinosaurs were alive',
      'No number before 1.000 contains the letter A',
      'The U.S. government saved every public tweet from 2006 through 2017',
      'The CIA headquarters has its own Starbucks, but baristas don’t write names on the cups',
      'Giraffe tongues can be 20 inches long',
      'There’s only one U.S. state capital without a McDonald’s - Montpelier, Vermont',
      'Europeans were scared of eating tomatoes when they were introduced',
      'The inventor of the microwave appliance only received $2 for his discovery',
      'The Eiffel Tower can grow more than six inches during the summer',
      'Bees can fly higher than Mount Everest',
      'Onions were found in the eyes of an Egyptian mummy',
      'Beethoven never knew how to multiply or divide',
      'Your brain synapses shrink while you sleep',
      'Neil Armstrong’s hair was sold in 2004 for $3.000'
    ];
    this.randomFact();
  }

  public insertIntoQueue(): void {
    this.queueService.addPlayerToQueue(this.user.username, this.user.password).subscribe();
    this.toastService.success('You joined the queue!');
  }

  private randomFact(): void {
    this.fact = this.facts[Math.floor(Math.random() * this.facts.length)];
  }
}
