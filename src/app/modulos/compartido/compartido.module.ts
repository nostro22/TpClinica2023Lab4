import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TimeFormatPipe } from 'src/app/pipes/time-format.pipe';
import { ArgentinaDatePipe } from 'src/app/pipes/argentina-date.pipe';



@NgModule({
  declarations: [TimeFormatPipe, ArgentinaDatePipe],
  imports: [
    CommonModule
  ],
  exports: [TimeFormatPipe,ArgentinaDatePipe]
})
export class CompartidoModule { }
