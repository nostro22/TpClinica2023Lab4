import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TimeFormatPipe } from 'src/app/pipes/time-format.pipe';
import { ArgentinaDatePipe } from 'src/app/pipes/argentina-date.pipe';
import { PonerTodoMayusculaPipe } from 'src/app/pipes/poner-todo-mayuscula.pipe';



@NgModule({
  declarations: [TimeFormatPipe, ArgentinaDatePipe, PonerTodoMayusculaPipe],
  imports: [
    CommonModule
  ],
  exports: [TimeFormatPipe,ArgentinaDatePipe,PonerTodoMayusculaPipe]
})
export class CompartidoModule { }
