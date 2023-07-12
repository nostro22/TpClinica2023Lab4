import { Directive, ElementRef, HostListener } from '@angular/core';
import { NotificacionesService } from '../servicios/notificaciones.service';

@Directive({
  selector: '[appAlertSpan]'
})
export class AlertSpanDirective {
  constructor(private el: ElementRef, private notificacion:NotificacionesService) { }

  @HostListener('mouseenter')
  onMouseEnter() {
    let texto = this.el.nativeElement.innerHTML;
    console.log(this.el.nativeElement.innerHTML)
  this.notificacion.showAlertSucces(texto,"Ayuda visual"); // Cambia el color a rojo al colocar el ratón sobre la palabra
  }

  @HostListener('mouseleave')
  onMouseLeave() {
    //this.changeColor('black'); // Restaura el color original al quitar el ratón de la palabra
  }

}
