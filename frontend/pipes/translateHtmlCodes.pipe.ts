import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'translateHtmlCodes'})

export class TranslateHtmlCodesPipe implements PipeTransform {

  transform(value: string): string {
    return value.split('&#039;').join('\'')
                .split('&quot;').join('"')
                .split('&auml;').join('ä')
                .split('&Auml;').join('Ä')
                .split('&uuml;').join('ü')
                .split('&Uuml;').join('Ü')
                .split('&ouml;').join('ö')
                .split('&Ouml;').join('Ö')
                .split('&amp;').join('&')
                .split('&lt;').join('<')
                .split('&gt;').join('>')
                .split('&apos;').join('\'');
  }
}
