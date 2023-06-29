import { Pipe, PipeTransform } from '@angular/core';
import { DatePipe } from '@angular/common';

@Pipe({
  name: 'argentinaDate'
})
export class ArgentinaDatePipe implements PipeTransform {
  transform(timestamp: { seconds: number, nanoseconds: number }): string {
    const milliseconds = timestamp.seconds * 1000 + Math.floor(timestamp.nanoseconds / 1000000);
    const date = new Date(milliseconds);
    const datePipe = new DatePipe('es-AR');
    return datePipe.transform(date, 'dd/MM/yyyy HH:mm:ss') || '';
  }
}
