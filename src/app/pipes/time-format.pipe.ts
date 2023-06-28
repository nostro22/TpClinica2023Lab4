import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'timeFormat' })
export class TimeFormatPipe implements PipeTransform {
  transform(value: string): string {
    const [startTime, endTime] = value.split(' - ');
    const formattedStartTime = this.formatTime(startTime);
    const formattedEndTime = this.formatTime(endTime);
    return `${formattedStartTime} - ${formattedEndTime}`;
  }

  private formatTime(time: string): string {
    const [hours, minutes] = time.split(':');
    let formattedHours = parseInt(hours, 10) % 12;
    const formattedMinutes = minutes;
    const period = parseInt(hours, 10) < 12 ? 'am' : 'pm';

    if (formattedHours === 0) {
      formattedHours = 12;
    }

    return `${formattedHours}:${formattedMinutes} ${period}`;
  }
}
