import { Component } from '@angular/core';
import { AutenticadorService } from 'src/app/servicios/autenticador.service';
import { FileUploadService } from 'src/app/servicios/file-upload.service';
import { NotificacionesService } from 'src/app/servicios/notificaciones.service';
@Component({
  selector: 'app-mi-perfil',
  templateUrl: './mi-perfil.component.html',
  styleUrls: ['./mi-perfil.component.css']
})
export class MiPerfilComponent {
  public listadoUsuarios: any = [];
  public especialidades: any = [];
  public habilitado:any;
  public dias=['lunes','martes','miercoles', 'jueves', 'viernes', 'sabado'];
 
  
  public selectedValue="0";
  constructor(private firebase: FileUploadService, private notificacionesS:NotificacionesService, private auth:AutenticadorService) {
  }

  async onValueChange(selectedValue: number): Promise<void> {
    
    this.loadUsuarios();
  }
  
  async isUsuarioHabilitado(email: string): Promise<boolean> {
    const estaHabilitado = await this.firebase.esEspecialitaAprobado(email);
    console.log(estaHabilitado);
    return estaHabilitado;
  }
  

  async ngOnInit() {
    this.loadUsuarios();
  }

  async loadUsuarios() {
    this.notificacionesS.showSpinner();
    this.listadoUsuarios = await this.auth.getUserCurrentUser();
    this.listadoUsuarios = await this.firebase.getUsuario(this.listadoUsuarios.email);
    this.listadoUsuarios= this.listadoUsuarios[0];
    console.log(this.listadoUsuarios);
    this.habilitado = await this.isUsuarioHabilitado(this.listadoUsuarios.email);
    this.especialidades = await this.firebase.getEspecialidadesPorEmail(this.listadoUsuarios.email);
    if(this.habilitado)
    {
      this.habilitado="SI";
    }else{
      this.habilitado="NO";
    }
    this.notificacionesS.hideSpinner();
  }

  
}
