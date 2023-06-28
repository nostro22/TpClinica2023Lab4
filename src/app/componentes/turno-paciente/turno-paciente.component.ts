import { Component, OnInit } from '@angular/core';
import { AutenticadorService } from 'src/app/servicios/autenticador.service';
import { FileUploadService } from 'src/app/servicios/file-upload.service';
import { NotificacionesService } from 'src/app/servicios/notificaciones.service';

@Component({
  selector: 'app-turno-paciente',
  templateUrl: './turno-paciente.component.html',
  styleUrls: ['./turno-paciente.component.css']
})
export class TurnoPacienteComponent implements OnInit {

  public especialistaSeleccionado: any;
  public especialidadesSeleccionado: any;
  public especialidadSeleccionado: any;
  public diaSeleccionado: any;
  public cachedImages: { [key: string]: Promise<string> } = {};
  public especialistas: any;
  public diasTurnos: any;
  public diaHorarios: any;
  constructor(private auth: AutenticadorService, private firebase: FileUploadService, private notificationS: NotificacionesService) { }

  async obtenerImagenEspecialidad(especialidad: string): Promise<string> {

    return await this.firebase.getImagenEspecialidad(especialidad);
  }

  async pedirCitaA(horario: any) {
    let pacienteAux =(await this.auth.getUserCurrentUser()).email;
    pacienteAux = (await this.firebase.getUsuario(pacienteAux))[0];
    const cita = {
      especialista: this.especialistaSeleccionado,
      especialidad: this.especialidadSeleccionado,
      dia: this.diaSeleccionado,
      paciente: pacienteAux,
      horario: horario,
      estado: "sinAprobar"
    }
    console.log(cita.dia);
    console.log(this.especialistaSeleccionado);
    const opcionesFecha = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const dia = cita.dia.toLocaleDateString('es-ES', opcionesFecha);
    if (await this.notificationS.showAlertSuccesConfirmacion("Confirmacion de reserva de turno", "El turno asignado sera el "
      + dia + " a las " + cita.horario + " con el doctor " + this.especialistaSeleccionado.nombre + " especialidad " + cita.especialidad, "Confirmar Turno")) {
      this.firebase.subirCita(cita);
    }
    this.selecionadoDia(this.diaSeleccionado);
  }

  async selecionadoEspecialista(especialista: any) {
    this.especialidadSeleccionado = "";
    this.diaSeleccionado = "";
    this.notificationS.showSpinner();
    try {
      this.especialistaSeleccionado = especialista;
      console.log(especialista);
      let listaEspecialidades = await this.firebase.getListEspecialidades();
      listaEspecialidades = listaEspecialidades.filter(espe => espe.especialista == especialista.email);
      listaEspecialidades = listaEspecialidades.map(async (especialista) => {
        const especialistaCompleto = {
          especialidad: especialista.especialidad,
          especialista: especialista.especialista,
          imagen: await this.obtenerImagenEspecialidad(especialista.especialidad)
        };
        return especialistaCompleto;
      })
      this.especialidadesSeleccionado = await Promise.all(listaEspecialidades);

    } catch (error) {

    }
    finally {
      this.notificationS.hideSpinner();
    }

  }
  async selecionadoEspecialidad(especialidad: any) {
    this.notificationS.showSpinner();
    this.diaSeleccionado = "";
    try {
      this.especialidadSeleccionado = especialidad;
      const diasDisponibles = this.obtenerSiguientesQuinceDias();
      console.log(this.especialistaSeleccionado);
      let diasTrabaja = await this.firebase.getEspecialistaHorarios(this.especialistaSeleccionado.email, this.especialidadSeleccionado);
      console.log(diasTrabaja);
      if (diasTrabaja.length > 0) {
        let diasFiltrados: any[] = [];
        diasDisponibles.forEach((dia: any) => {
          let diaVerificar = this.obtenerNombreDia(dia.getDay());
          let siTrabajo = diasTrabaja[0].horario;
          siTrabajo.forEach((diaTrabaja: { dia: string; activo: any; }) => {
            if (diaTrabaja.dia == diaVerificar && diaTrabaja.activo) {
              diasFiltrados.push(dia);
            }
          })
          this.diasTurnos = diasFiltrados;
        });
      } else {
        this.especialidadSeleccionado = "";
        this.notificationS.showAlertDanger("Especialista Sin Horarios", "Este especialista no possee horarios abiertos para los siguientes 15 dias");
      }
    }
    catch {

    }
    finally {
      this.notificationS.hideSpinner();
    }
  }
  async selecionadoDia(dia: any) {
    this.notificationS.showSpinner();
    try {
      this.diaSeleccionado = dia;
      const duracion = (await this.firebase.getEspecialistaHorarios(this.especialistaSeleccionado.email, this.especialidadSeleccionado))[0].duracion;
      let horarioDelDia = await this.divideDayIntoSegments(duracion);
      console.log(this.especialistaSeleccionado.email);
      let citas = await this.firebase.getTurnosDeEspecialista(this.especialistaSeleccionado.email).toPromise();
      console.log(citas);
      citas = citas!.filter(cita => cita.dia.getDate() === this.diaSeleccionado.getDate());
      console.log(citas);
      const horariosOcupados = citas.map(turno => turno.horario);
      const horariosDisponiblesFiltrados = horarioDelDia.filter(horario => !horariosOcupados.includes(horario));
      this.diaHorarios = horariosDisponiblesFiltrados;
    }
    catch {
    }
    finally {
      this.notificationS.hideSpinner();
    }
  }
  

  obtenerNombreDia(diaSemana: number): string {
    const dias = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
    return dias[diaSemana];
  }
  restarFechas(listaFechas: Date[], fechasARestar: Date[]): Date[] {
    const fechasRestantes = listaFechas.filter(fecha => !fechasARestar.some(fechaARestar => fecha.getTime() === fechaARestar.getTime()));
    return fechasRestantes;
  }
  async ngOnInit(): Promise<void> {
    this.especialistas = await this.firebase.getUsuarios().then((lista) => {
      console.log(lista);
      lista = lista.filter((item: { tipo: string; }) => item.tipo == "especialista");
      console.log(lista);
      return lista;
    });
    this.diasTurnos = this.obtenerSiguientesQuinceDias();
  }

  divideDayIntoSegments(segmentDuration: number): string[] {
    const startHour = 8; // Start hour of the day
    const endHour = 19; // End hour of the day
    const segments: string[] = [];

    // Calculate the total number of segments based on the duration
    const totalSegments = Math.floor((endHour - startHour) * 60 / segmentDuration);

    // Iterate over the segments and calculate the start time for each segment
    for (let i = 0; i < totalSegments; i++) {
      const segmentStartHour = startHour + Math.floor(i * segmentDuration / 60);
      const segmentStartMinute = (i * segmentDuration) % 60;

      // Format the start time as a string with leading zeros if necessary
      const startTime = `${segmentStartHour.toString().padStart(2, '0')}:${segmentStartMinute.toString().padStart(2, '0')}`;

      // Calculate the end time by adding the segment duration to the start time
      const endTime = new Date(0, 0, 0, segmentStartHour, segmentStartMinute + segmentDuration).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      // Add the time range to the segments array
      segments.push(`${startTime} - ${endTime}`);
    }
    console.log(segments);
    return segments;
  }

  obtenerSiguientesQuinceDias(): Date[] {
    const listaFechas: Date[] = [];
    const hoy = new Date();

    for (let i = 0; i < 15; i++) {
      const fecha = new Date();
      fecha.setDate(hoy.getDate() + i);
      listaFechas.push(fecha);
    }

    return listaFechas;
  }



}
