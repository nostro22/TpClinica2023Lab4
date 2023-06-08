import { Component } from '@angular/core';
import { FileUploadService } from 'src/app/servicios/file-upload.service';
import { NotificacionesService } from 'src/app/servicios/notificaciones.service';

@Component({
  selector: 'app-usuarios',
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.css']
})
export class UsuariosComponent {
  public listadoUsuarios: any[] = [];
  public habilitaciones: { [email: string]: boolean } = {};
  options: { value: number; label: string; isSelected: boolean; }[] = [
    { value: 0, label: 'Habilitaciones', isSelected: false },
    { value: 1, label: 'Registro Paciente', isSelected: false },
    { value: 2, label: 'Registro Especialista', isSelected: false },
    { value: 3, label: 'Registro Administrador', isSelected: false }
  ];
  selectedOption = 0;
  public selectedValue="0";
  constructor(private firebase: FileUploadService, private notificacionesS:NotificacionesService) {
  }

  async onValueChange(selectedValue: number): Promise<void> {
    this.selectedValue = selectedValue.toString();
    this.options.forEach(option => {
      option.isSelected = (option.value === selectedValue);
    });
    this.loadUsuarios();
  }
  
  async isUsuarioHabilitado(email: string): Promise<boolean> {
    const estaHabilitado = await this.firebase.esEspecialitaAprobado(email);
    console.log(estaHabilitado);
    return estaHabilitado;
  }
  

  async ngOnInit() {
    this.options[0].isSelected=true;
    this.loadUsuarios();
  }

  async loadUsuarios() {
    this.notificacionesS.showSpinner();
    this.listadoUsuarios = await this.firebase.getUsuarios();
    console.log(this.listadoUsuarios);
    for (const usuario of this.listadoUsuarios) {
      this.habilitaciones[usuario.email] = await this.isUsuarioHabilitado(usuario.email);
    }
    this.notificacionesS.hideSpinner();
  }

  accionDesabilitar(email:string){
    this.firebase.desabilitarEspecialista(email);
    this.loadUsuarios();
  }
  accionHabilitar(email:string){
    this.firebase.habilitarEspecialista(email);
    this.loadUsuarios();
  }
}
