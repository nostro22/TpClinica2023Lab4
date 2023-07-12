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

  public historialClinicioSelecionado: any;
  public pacienteElegido: any;
  historialClinico: any;
  public historiales: any;
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
    this.historialClinicioSelecionado = await this.firebaseService.getHistorial(this.usuario.email);
    this.historialClinicioSelecionado = this.historialClinicioSelecionado?.historialesList[0];
    console.log(this.historialClinicioSelecionado);

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
  async filterTurnosPaciente(value: string) {

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

      this.historiales = await this.firebaseService.getHistorialesPromise();
      this.misTurnos$ = this.firebaseService.getTurnosDeEspecialista(this.usuario.email).pipe(
        map((turnos: any) => {
          return turnos.map((turno: any) => {
            this.historiales.forEach((element: any) => {
              if (turno.paciente.email === element.paciente.email) {
                turno.historial = element;
              }
            });
            return turno;
          });
        })
      );
      this.misTurnos$ = this.misTurnos$.pipe(
        map(turnos=>turnos.filter((turno:any) =>{
          const detalles = turno.historial.detalles;
          let esta =false;
          if (detalles) {
            for (const key in detalles) {
              console.log(key);
              if (key.includes(value) || detalles[key].toString().includes(value)) {
                esta =  true;
              }
            }
          }

          diaEscrito = this.datePipe.transform(turno.dia, 'MMM d, yyyy');
          return (turno.especialidad.includes(value) || turno.especialista.email.includes(value) || turno.paciente.nombre.includes(value)
            || turno.horario.includes(value) || turno.estado.includes(value) || turno.especialidad.includes(value) || diaEscrito.includes(value)
            || turno.historial.altura == parseInt(value)
            || turno.historial.peso == parseInt(value)
            || turno.historial.temperatura == parseInt(value)
            || turno.historial.presion == parseInt(value)
            || esta
          )
        }))
      )
      this.misTurnos$.subscribe(turnos => {
        console.log(turnos);
      });
      
    }
  }

  filtroHistorial(paciente: any, busqueda: string) {
    let historialABuscar = this.firebaseService.getHistorial(paciente);
    return historialABuscar.then(historial => {
      historial = historial?.historialesList[0];
      return this.searchValue(historial, busqueda);
    });
  }

  searchValue(historial: any, search: any) {
    if (
      historial &&
      (String(historial.altura) == (search) ||
        String(historial.fecha) == (search) ||
        String(historial.peso) == (search) ||
        String(historial.presion) == (search) ||
        String(historial.temperatura) == (search))
    ) {
      return true;
    } else {
      return false;
    }
  }



  clickPaciente(paciente: any) {
    this.pacienteElegido = paciente;
    console.log(paciente);
    this.historialClinicioSelecionado = false;
    this.firebaseService.getTurnosDePaciente(paciente.email).subscribe(cita => {
      console.log(cita);

      const historialFiltrado = cita.filter(unaCita => unaCita.especialista.email == this.usuario.email);
      this.historialClinico = of(historialFiltrado);

    });
  }

  async verHistorial(usuario: any) {
    this.historialClinicioSelecionado = await this.firebaseService.getHistorial(usuario.email);
    this.historialClinicioSelecionado = this.historialClinicioSelecionado.historialesList[0];
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
      turno.resenia = await this.notificacionS.showAlertComentario("Agregue reseña del turno", "Ingrese reseña");
      this.cargarHistorial(turno.paciente);
      console.log(turno);
      this.firebaseService.subirCita(turno);
    }
  }


  async cargarHistorial(paciente: any) {
    let historial: any;
    console.log(paciente.email);
    historial = await this.firebaseService.getHistorial(paciente.email);
    let historialNuevo: any;
    historialNuevo = await this.notificacionS.showFormulario();
    console.log(historialNuevo);
    console.log(historial);

    if (historial != null) {
      historial = historial.historialesList[0];
      console.log("entre");
      historial = {
        uid: historial.uid,
        altura: historialNuevo?.altura || historial.altura,
        peso: historialNuevo?.peso || historial.peso,
        temperatura: historialNuevo?.temperatura || historial.temperatura,
        presion: historialNuevo?.presion || historial.presion,
        fechaInforme: new Date(),
        paciente: paciente,
        detalles: {
          // ...historial?.detalles,
          ...historialNuevo?.detalles,
        },

      };
      console.log(historial);

    } else {
      historial = {
        fechaInforme: new Date(),
        paciente: paciente,
        ...historialNuevo,
      };
    }

    this.firebaseService.subirHistorial(historial);

    console.log(historial);
  }


  verComentario(turno: any) {
    this.notificacionS.showAlertSucces("Comentario", turno.comentario);
  }
  verResenia(turno: any) {
    this.notificacionS.showAlertSucces("Reseña", turno.resenia);
  }

}
