import { Directive, ElementRef, HostListener } from '@angular/core';
import { NotificacionesService } from '../servicios/notificaciones.service';

@Directive({
  selector: '[appToastSpan]'
})
export class ToastSpanDirective {
  constructor(private el: ElementRef, private notificacion:NotificacionesService) { }

  @HostListener('mouseenter')
  onMouseEnter() {
    let texto = this.el.nativeElement.innerHTML;
    console.log(this.el.nativeElement.innerHTML)
  this.notificacion.toastNotificationInfo(texto); // Cambia el color a rojo al colocar el ratón sobre la palabra
  }

  @HostListener('mouseleave')
  onMouseLeave() {
    //this.changeColor('black'); // Restaura el color original al quitar el ratón de la palabra
  }

  private changeColor(color: string) {
   // this.el.nativeElement.style.color = color;
  }

}
