import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[appHoverColor]'
})
export class HoverColorDirective {
  constructor(private el: ElementRef) { }

  @HostListener('mouseenter')
  onMouseEnter() {
    console.log("ENtre");
    this.changeColor('blue'); // Cambia el color a rojo al colocar el ratón sobre la palabra
  }

  @HostListener('mouseleave')
  onMouseLeave() {
    this.changeColor('black'); // Restaura el color original al quitar el ratón de la palabra
  }

  private changeColor(color: string) {
    this.el.nativeElement.style.color = color;
  }
}
