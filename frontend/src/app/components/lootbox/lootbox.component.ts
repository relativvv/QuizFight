import {Component, OnInit, ViewChild} from '@angular/core';
import {Title} from '@angular/platform-browser';

@Component({
  selector: 'app-lootbox',
  templateUrl: './lootbox.component.html',
  styleUrls: ['./lootbox.component.less']
})
export class LootboxComponent implements OnInit {

  @ViewChild('lootbox') lootbox;
  hitsNeeded: number;

  possibleMusic = ['coffin-dance.mp3', 'deja-vu.mp3', 'electric-zoo.mp3', 'gas-gas-gas.mp3', 'instantmagichour.mp3', 'wide-putin.mp3'];
  items = [];
  possibleStatusTypes = ['fire', 'water', 'air', 'earth', 'dragon', 'electric'];
  possibleRarities = [
    'common',
    'common',
    'common',
    'common',
    'common',
    'common',
    'common',
    'common',
    'common',
    'common',
    'rare',
    'rare',
    'rare',
    'rare',
    'rare',
    'rare',
    'rare',
    'superRare',
    'superRare',
    'superRare',
    'superRare',
    'epic',
    'epic',
    'legendary'];

  constructor(private readonly titleService: Title) {
    titleService.setTitle('QuizFight - Lootbox');
  }

  ngOnInit(): void {
    this.hitsNeeded = this.randomIntFromInterval(5, 11);
    this.getItems();
  }

  randomIntFromInterval(min, max): number {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  hitLootbox(): void {
    this.hitsNeeded--;
    const audio = new Audio('../../../../assets/hitmarker_2.mp3');
    audio.volume = 0.15;
    audio.play();
    if (this.hitsNeeded === 0) {
      this.playMusic();
      this.lootbox.nativeElement.remove();
    }
  }

  playMusic(): void {
    const random = this.randomIntFromInterval(1, this.possibleMusic.length) - 1;
    console.log(random);
    const audio = new Audio('../../../../assets/' + this.possibleMusic[random]);
    audio.volume = 0.1;
    audio.play();
  }

  getItems(): void {
    const amount = this.randomIntFromInterval(4, 6);
    for (let i = 0; i < amount; i++) {
      const toAdd = {
        imageSrc: '../../../../assets/default_profile_picture.png',
        imageAlt: 'itemPic',
        damage: this.randomIntFromInterval(35, 111),
        health: this.randomIntFromInterval(63, 214),
        weight: this.randomIntFromInterval(1, 12),
        statusType: this.possibleStatusTypes[this.randomIntFromInterval(1, this.possibleStatusTypes.length - 1)],
        rarity: this.possibleRarities[this.randomIntFromInterval(1, this.possibleRarities.length - 1)]
      };
      this.items.push(toAdd);
    }
  }

}
