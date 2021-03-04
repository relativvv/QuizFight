import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'booleanAsString'})

export class BooleanAsString implements PipeTransform {

  transform(value: boolean): string {
    switch (value) {
      case true:
        return 'Yes';
      case false:
      default:
        return 'No';
    }
  }
}
