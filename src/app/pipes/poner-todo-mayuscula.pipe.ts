import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'ponerTodoMayuscula'
})
export class PonerTodoMayusculaPipe implements PipeTransform {
  transform(value: string): string {
    if (!value) return '';

    let words = value.split(' ');

    words = words.map(word => {
      return word.charAt(0).toUpperCase() + word.slice(1);
    });

    return words.join(' ');
  }


}
