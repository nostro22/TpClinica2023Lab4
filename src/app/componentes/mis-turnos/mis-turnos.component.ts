import { Component, OnInit } from '@angular/core';
import { Observable, catchError, forkJoin, map, of, switchMap } from 'rxjs';
import { AutenticadorService } from 'src/app/servicios/autenticador.service';
import { FileUploadService } from 'src/app/servicios/file-upload.service';
import { NotificacionesService } from 'src/app/servicios/notificaciones.service';
import { DatePipe } from '@angular/common';
@Component({
  selector: 'app-mis-turnos',
  templateUrl: './mis-turnos.component.html',
  styleUrls: ['./mis-turnos.component.css']
})
export class MisTurnosComponent implements OnInit {
  public misTurnos$!: Observable<any>;
  public especialidades: any;
  public especialistas: any;
  public pacientes: any;
  public usuario: any;
  constructor(private datePipe: DatePipe, private firebaseService: FileUploadService, private auth: AutenticadorService, private notificacionS: NotificacionesService) { }
  filtro: string = '';
  public filterByInput() {
    this.filterTurnosPaciente(this.filtro);
  }

  async ngOnInit(): Promise<void> {
    this.usuario = (await this.auth.getUserCurrentUser()).email;
    this.usuario = (await this.firebaseService.getUsuario(this.usuario))[0];
    if (this.usuario.tipo == 'paciente') {
      this.misTurnos$ = this.firebaseService.getTurnosDePaciente(this.usuario.email);
      console.log(this.misTurnos$)
    }
    else {
      this.misTurnos$ = this.firebaseService.getTurnosDeEspecialista(this.usuario.email);

    }

    this.misTurnos$.subscribe(turnos => {
      const especialidades = turnos.map((turno: any) => turno.especialidad);
      const especialistas = turnos.map((turno: any) => turno.especialista.email);
      const pacientes = turnos.map((turno: any) => turno.paciente.email);
      this.especialidades = [...new Set(especialidades)];
      this.especialistas = [...new Set(especialistas)];
      this.pacientes = [...new Set(pacientes)];

      // Obtener los usuarios correspondientes a los especialistas
      const observables = this.especialistas.map((especialistaUnico: any) => this.firebaseService.getUsuario(especialistaUnico));
      forkJoin(observables).subscribe(responses => {
        this.especialistas = responses;
      });
      const observables2 = this.pacientes.map((pacienteUnico: any) => this.firebaseService.getUsuario(pacienteUnico));
      forkJoin(observables2).subscribe(responses => {
        this.pacientes = responses;
      });
    });
  }
  cambiarValorFiltro(filtro: string) {
    this.filtro = filtro;
    this.filterTurnosPaciente(filtro);
  }
  filterTurnosPaciente(value: string) {

    console.log(value);
    let diaEscrito: any;

    if (this.usuario.tipo == 'paciente') {
      this.misTurnos$ = this.firebaseService.getTurnosDePaciente(this.usuario.email).pipe(
        map(turnos => turnos.filter(turno => {
          diaEscrito = this.datePipe.transform(turno.dia, 'MMM d, yyyy');
          return (turno.especialidad.includes(value) || turno.especialista.email.includes(value) || turno.especialista.nombre.includes(value)
            || turno.horario.includes(value) || turno.estado.includes(value) || turno.especialidad.includes(value) || diaEscrito.includes(value)

          )
        }))
      );

    }
    else {
      this.misTurnos$ = this.firebaseService.getTurnosDeEspecialista(this.usuario.email).pipe(
        map(turnos => turnos.filter(turno => {
          diaEscrito = this.datePipe.transform(turno.dia, 'MMM d, yyyy');
          console.log(turno.paciente.email);
          return (turno.especialidad.includes(value) || turno.paciente.nombre.includes(value) || turno.horario.includes(value)
            || turno.estado.includes(value) || diaEscrito.includes(value)
          )
        }))
      );
    }
  }

  limpiarFiltros() {
    this.filtro = "";
    this.filterTurnosPaciente(this.filtro);
  }
  async cancelarTurno(turno: any) {
    if (await this.notificacionS.showAlertSuccesConfirmacion("Cancelacion Turno", "¿Esta Seguro que desea cancelar el turno?", "Si")) {
      turno.estado = "cancelado";
      turno.comentario = await this.notificacionS.showAlertComentario("Agrege comentario de cancelación", "Ingrese comentario");
      console.log(turno);
      this.firebaseService.subirCita(turno);
    }

  }
  async rechazarTurno(turno: any) {
    if (await this.notificacionS.showAlertSuccesConfirmacion("Rechar Turno", "¿Esta Seguro que desea rechazar el turno?", "Si")) {
      turno.estado = "rechazado";
      turno.comentario = await this.notificacionS.showAlertComentario("Agrege comentario de por que fue rechazado", "Ingrese comentario");
      console.log(turno);
      this.firebaseService.subirCita(turno);
    }

  }
  async aceptarTurno(turno: any) {
    if (await this.notificacionS.showAlertSuccesConfirmacion("Aprobación Turno", "¿Esta Seguro que desea aceptar el turno?", "Si")) {
      turno.estado = "aceptado";
      console.log(turno);
      this.firebaseService.subirCita(turno);
    }

  }
  async finalizarTurno(turno: any) {
    if (await this.notificacionS.showAlertSuccesConfirmacion("Finalizar Turno", "¿Esta Seguro que desea finalizar el turno?", "Si")) {
      turno.estado = "finalizado";
      turno.resenia = await this.notificacionS.showAlertComentario("Agrege reseña del turno", "Ingrese reseña");
      console.log(turno);
      this.firebaseService.subirCita(turno);
    }
  }




  verComentario(turno: any) {
    this.notificacionS.showAlertSucces("Comentario", turno.comentario);
  }
  verResenia(turno: any) {
    this.notificacionS.showAlertSucces("Reseña", turno.resenia);
  }

}
