import { Component } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
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
  public habilitado: any;
  public especialidadActiva: string = "";
  public usuarioActual: any;
  dias = [{ 'activo': false, 'dia': 'lunes' }, { 'activo': false, 'dia': 'martes' }, { 'activo': false, 'dia': 'miércoles' },
  { 'activo': false, 'dia': 'jueves' }, { 'activo': false, 'dia': 'viernes' }, { 'activo': false, 'dia': 'sábado' }]


  public selectedValue = "0";
  constructor(private firebase: FileUploadService,
    private notificacionesS: NotificacionesService,
    private auth: AutenticadorService,
    private fb: FormBuilder) {
  }

  get duracion() {
    return this.formularioHorario.get('duracion') as FormControl;
  }
  public formularioHorario = this.fb.group({
    'duracion': ['', [Validators.required, Validators.min(30)]],
  });

  async onValueChange(selectedValue: string): Promise<void> {
    this.notificacionesS.showSpinner();
    try {
      this.especialidadActiva = selectedValue;
      let horario = await this.firebase.getEspecialistaHorarios(this.usuarioActual.email, selectedValue);
      if (horario.length > 0) {
        this.dias = horario[0].horario;
        this.duracion.setValue(horario[0].duracion);
      }
      else {
        this.dias = [{ 'activo': false, 'dia': 'lunes' }, { 'activo': false, 'dia': 'martes' }, { 'activo': false, 'dia': 'miércoles' },
        { 'activo': false, 'dia': 'jueves' }, { 'activo': false, 'dia': 'viernes' }, { 'activo': false, 'dia': 'sábado' }];
      }

    } catch (error) {

    } finally {
      this.notificacionesS.hideSpinner();
    }

  }

  async isUsuarioHabilitado(email: string): Promise<boolean> {
    const estaHabilitado = await this.firebase.esEspecialitaAprobado(email);
    console.log(estaHabilitado);
    return estaHabilitado;
  }


  async ngOnInit() {
    this.loadUsuarios().then(() => {
      if (this.especialidadActiva != '') {
        this.loadEspecialista();
      }
    });
  }

  async loadUsuarios() {
    this.notificacionesS.showSpinner();
    this.listadoUsuarios = await this.auth.getUserCurrentUser();
    this.listadoUsuarios = await this.firebase.getUsuario(this.listadoUsuarios.email);
    this.listadoUsuarios = this.listadoUsuarios[0];
    this.usuarioActual = this.listadoUsuarios;
    this.habilitado = await this.isUsuarioHabilitado(this.listadoUsuarios.email);
    this.especialidades = await this.firebase.getEspecialidadesPorEmail(this.listadoUsuarios.email);
    if (this.habilitado) {
      this.habilitado = "SI";
      this.especialidadActiva = this.especialidades[0];
    } else {
      this.habilitado = "NO";
      this.especialidadActiva = this.especialidades[0];
    }
    this.notificacionesS.hideSpinner();
  }
  async loadEspecialista() {
    this.onValueChange(this.especialidadActiva);
  }

  cambiarDia(estado: boolean, dia: string) {
    let indice = this.dias.findIndex(elemento => dia == elemento.dia);
    this.dias[indice].activo = estado;
  }

  actualizarHorario() {
    console.log(this.listadoUsuarios.especialidad)
    console.log(this.dias)
    console.log(this.duracion.value)
    this.notificacionesS.showSpinner();
    this.auth.altaHorario(this.listadoUsuarios.email, this.especialidadActiva, this.dias, this.duracion.value).then(
      () => {
        this.notificacionesS.hideSpinner();
      }
    );
  }


}
