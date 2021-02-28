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
                .split('&eacute;').join('é')
                .split('&Eacute;').join('É')
                .split('&Atilde;').join('Ã')
                .split('&atilde;').join('ã')
                .split('&Iacute;').join('Í')
                .split('&iacute;').join('í')
                .split('&Oacute;').join('Ó')
                .split('&oacute;').join('ó')
                .split('&ntilde;').join('ñ')
                .split('&deg;').join('º')
                .split('&cent;').join('¢')
                .split('&apos;').join('\'');
  }
}
