export interface Item {
  imageSrc: string;
  imageAlt: string;
  damage: number;
  health: number;
  weight: number;
  statusType: 'fire' | 'water' | 'air' | 'earth' | 'dragon' | 'electric';
  rarity: 'common' | 'rare' | 'superRare' | 'epic' | 'legendary';
}
