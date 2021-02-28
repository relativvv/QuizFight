import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-item-card',
  templateUrl: './item-card.component.html',
  styleUrls: ['./item-card.component.less']
})
export class ItemCardComponent implements OnInit {

  @Input() imageSrc: string;
  @Input() imageAlt: string;
  @Input() damage: number;
  @Input() health: number;
  @Input() weight: number;
  @Input() statusType: 'fire' | 'water' | 'air' | 'earth' | 'dragon' | 'electric';
  @Input() rarity: 'common' | 'rare' | 'superRare' | 'epic' | 'legendary';

  constructor() { }

  ngOnInit(): void {
  }

}
