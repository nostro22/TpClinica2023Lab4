import { Component } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { Observable, concatAll, distinct, distinctUntilChanged, filter, map, of, toArray } from 'rxjs';
import { AutenticadorService } from 'src/app/servicios/autenticador.service';
import { FileUploadService } from 'src/app/servicios/file-upload.service';
import { NotificacionesService } from 'src/app/servicios/notificaciones.service';

@Component({
  selector: 'app-mi-perfil',
  templateUrl: './mi-perfil.component.html',
  styleUrls: ['./mi-perfil.component.css']
})
export class MiPerfilComponent {
  public usuario: any;
  public misTurnos$!: Observable<any>;
  public listadoUsuarios: any = [];
  public especialidades: any = [];
  public habilitado: any;
  public especialidadActiva: string = "";
  public usuarioActual: any;
  public pacientes: any;
  public pacienteElegido: any;
  dias = [{ 'activo': false, 'dia': 'lunes' }, { 'activo': false, 'dia': 'martes' }, { 'activo': false, 'dia': 'miércoles' },
  { 'activo': false, 'dia': 'jueves' }, { 'activo': false, 'dia': 'viernes' }, { 'activo': false, 'dia': 'sábado' }]

  //extras

  public misHistoriales$!: Observable<any>;
  public historialClinicioSelecionado: any;
  historialClinico: any;
  historialClinicoFiltrado: any[] = [];

  hayHistorial: boolean = false;
  hayHistorialFiltrado: boolean = true;
  btnTodo: boolean = true;
  btnClinico: boolean = false;
  btnOdontologo: boolean = false;
  btnOftalmologo: boolean = false;

  fechaActual: Date = new Date();


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
    this.usuario = (await this.auth.getUserCurrentUser()).email;
    this.usuario = (await this.firebase.getUsuario(this.usuario))[0];
    this.loadUsuarios().then(() => {
      if (this.especialidadActiva != '') {
        this.loadEspecialista();
      }
    }).then(() => {

      if (this.listadoUsuarios.tipo === 'especialista') {
        this.misTurnos$ = this.firebase.getTurnosDeEspecialista(this.usuario.email).pipe(
          map((turnos: any) => turnos.map((turno: { paciente: any }) => turno.paciente)),
          concatAll(),
          distinct((paciente: any) => paciente.email),
          toArray()
        );

        this.misTurnos$.subscribe(value => {
          console.log(value);
        });
      }
    })


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

  verComentario(turno: any) {
    this.notificacionesS.showAlertSucces("Comentario", turno.comentario);
  }
  verResenia(turno: any) {
    this.notificacionesS.showAlertSucces("Reseña", turno.resenia);
  }
  async verHistorial(paciente: any) {

    let historial: any;
    historial = await this.firebase.getHistorial(paciente.email);
    historial = historial?.historialesList;
    this.historialClinicioSelecionado = historial[0];

  }

  cerrarHistorial() {
    this.historialClinicioSelecionado = false;
  }



}
