import { Component } from '@angular/core';

@Component({
  selector: 'app-registro',
  templateUrl: './registro.component.html',
  styleUrls: ['./registro.component.css']
})
export class RegistroComponent {
  public loading?: boolean;
  registroPaciente: string = 'eleccion';

  cambiarRegistro(esPaciente: string) {
    this.registroPaciente = esPaciente;
  }
  async showLoading() {

    this.loading = true;
    return new Promise<void>((resolve) => setTimeout(() => resolve(), 3000));
  }
  async ngOnInit(): Promise<void> {
    this.loading = false;
  }
}
