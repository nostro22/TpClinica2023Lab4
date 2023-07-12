import { Component } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Observable, Subject, concatAll, distinct, distinctUntilChanged, filter, forkJoin, map, of, takeUntil, toArray } from 'rxjs';
import { AutenticadorService } from 'src/app/servicios/autenticador.service';
import { FileUploadService } from 'src/app/servicios/file-upload.service';
import { NotificacionesService } from 'src/app/servicios/notificaciones.service';
import { DatePipe } from '@angular/common';
@Component({
  selector: 'app-mi-perfil',
  templateUrl: './mi-perfil.component.html',
  styleUrls: ['./mi-perfil.component.css']
})
export class MiPerfilComponent {
  public usuario: any;
  public misTurnos$!: Observable<any>;
  public especialidades: any = [];
  public especialistas: any;
  public habilitado: any;
  public especialidadActiva: string = "";
  public pacientes: any;
  public pacienteElegido: any;
  private destroy$ = new Subject<void>();

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
   filtro: string="";
  constructor(private firebase: FileUploadService,
    private notificacionesS: NotificacionesService,
    private auth: AutenticadorService,
    private datePipe: DatePipe,
    private fb: FormBuilder) {
  }

  get duracion() {
    return this.formularioHorario.get('duracion') as FormControl;
  }
  public formularioHorario = this.fb.group({
    'duracion': ['', [Validators.required, Validators.min(30)]],
  });

  cambiarValorFiltro(filtro: string) {
    this.filtro = filtro;
    this.filterTurnosPaciente(filtro);
  }
  public filterByInput() {
    this.filterTurnosPaciente(this.filtro);
  }
  async cargarHistorial(paciente: any) {
    let historial: any;
    console.log(paciente.email);
    historial = await this.firebase.getHistorial(paciente.email);
    let historialNuevo: any;
   // historialNuevo = await this.notificacionS.showFormulario();
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

    this.firebase.subirHistorial(historial);

    console.log(historial);
  }

  filterTurnosPaciente(value: string) {

    console.log(value);
    let diaEscrito: any;

    if (this.usuario.tipo == 'paciente') {
      this.misTurnos$ = this.firebase.getTurnosDePaciente(this.usuario.email).pipe(
        map(turnos => turnos.filter(turno => {
          diaEscrito = this.datePipe.transform(turno.dia, 'MMM d, yyyy');
          return (turno.especialidad.includes(value) || turno.especialista.email.includes(value) || turno.especialista.nombre.includes(value)
            || turno.horario.includes(value) || turno.estado.includes(value) || turno.especialidad.includes(value) || diaEscrito.includes(value)
          )
        }))
      );
    }
    else {


      //let esta =  this.filtroHistorial(turno.paciente.email, value);
      this.misTurnos$ = this.firebase.getTurnosDeEspecialista(this.usuario.email).pipe(
        map(turnos => turnos.filter(turno => {

          diaEscrito = this.datePipe.transform(turno.dia, 'MMM d, yyyy');
          // console.log( esta)
          return (turno.especialidad.includes(value) || turno.paciente.nombre.includes(value) || turno.horario.includes(value)
            || turno.estado.includes(value) || diaEscrito.includes(value)
          )
        }))
      );
    }
  }
  async onValueChange(selectedValue: string): Promise<void> {
    this.notificacionesS.showSpinner();
    try {
      this.especialidadActiva = selectedValue;
      if (this.usuario.tipo == "especialista") {

        let horario = await this.firebase.getEspecialistaHorarios(this.usuario.email, selectedValue);
        if (horario.length > 0) {
          this.dias = horario[0].horario;
          this.duracion.setValue(horario[0].duracion);
        }
        else {
          this.dias = [{ 'activo': false, 'dia': 'lunes' }, { 'activo': false, 'dia': 'martes' }, { 'activo': false, 'dia': 'miércoles' },
          { 'activo': false, 'dia': 'jueves' }, { 'activo': false, 'dia': 'viernes' }, { 'activo': false, 'dia': 'sábado' }];
        }

      }
    } catch (error) {

    } finally {
      this.notificacionesS.hideSpinner();
    }

  }

  async isUsuarioHabilitado(email: string): Promise<boolean> {
    if (this.usuario.tipo == "especialista") {
      const estaHabilitado = await this.firebase.esEspecialitaAprobado(email);
      console.log(estaHabilitado);
      return estaHabilitado;
    }
    return false;
  }


  async ngOnInit() {
    this.usuario = (await this.auth.getUserCurrentUser()).email;
    this.usuario = (await this.firebase.getUsuario(this.usuario))[0];
    if (this.usuario.tipo == 'paciente') {
      this.misTurnos$ = this.firebase.getTurnosDePaciente(this.usuario.email);
      console.log(this.misTurnos$)
      this.misTurnos$.subscribe(turnos => {
        const especialidades = turnos.map((turno: any) => turno.especialidad);
        const especialistas = turnos.map((turno: any) => turno.especialista.email);
        const pacientes = turnos.map((turno: any) => turno.paciente.email);
        this.especialidades = [...new Set(especialidades)];
        this.especialistas = [...new Set(especialistas)];
        this.pacientes = [...new Set(pacientes)];
        
        // Obtener los usuarios correspondientes a los especialistas
        const observables = this.especialistas.map((especialistaUnico: any) => this.firebase.getUsuario(especialistaUnico));
        forkJoin(observables).subscribe(responses => {
          this.especialistas = responses;
        });
        const observables2 = this.pacientes.map((pacienteUnico: any) => this.firebase.getUsuario(pacienteUnico));
        forkJoin(observables2).subscribe(responses => {
          this.pacientes = responses;
        });
      });
      
    }





    
    console.log(this.usuario)
    if (this.usuario.tipo == "paciente") {
      this.historialClinicioSelecionado = await this.firebase.getHistorial(this.usuario.email);
      this.historialClinicioSelecionado = this.historialClinicioSelecionado?.historialesList;
      this.historialClinicioSelecionado = this.historialClinicioSelecionado[0];
      console.log(this.historialClinicioSelecionado);
    }
    this.loadUsuarios().then(() => {
      if (this.especialidadActiva != '') {
        this.loadEspecialista();
      }
    }).then(() => {

      if (this.usuario.tipo === 'especialista') {
        this.misTurnos$ = this.firebase.getTurnosDeEspecialista(this.usuario.email).pipe(
          map((turnos: any) => turnos.map((turno: { paciente: any }) => turno.paciente)),
          concatAll(),
          distinct((paciente: any) => paciente.email),
          toArray(),
          takeUntil(this.destroy$)  // Add this line
        )
      }
    })


  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }





  async loadUsuarios() {
     this.notificacionesS.showSpinner();
    if (this.usuario.tipo == "especialista") {

      this.especialidades = await this.firebase.getEspecialidadesPorEmail(this.usuario.email);

      if (this.habilitado) {
        this.habilitado = "SI";
        this.especialidadActiva = this.especialidades[0];
      } else {
        this.habilitado = "NO";
        this.especialidadActiva = this.especialidades[0];
      }
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
    console.log(this.usuario.email)
    console.log(this.especialidadActiva)
    console.log(this.dias)
    console.log(this.duracion.value)
    this.notificacionesS.showSpinner();
    this.auth.altaHorario(this.usuario.email, this.especialidadActiva, this.dias, this.duracion.value).then(
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

  descargarHistorialPdf() {
    const DATA = document.getElementById('pdf');
    const doc = new jsPDF('p', 'pt', 'a4');
    const options = {
      background: 'white',
      scale: 2,
    };
    //@ts-ignore
    html2canvas(DATA, options)
      .then((canvas: any) => {
        const img = canvas.toDataURL('image/PNG');

        const bufferX = 30;
        const bufferY = 30;
        const imgProps = (doc as any).getImageProperties(img);
        const pdfWidth = doc.internal.pageSize.getWidth() - 2 * bufferX;
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        doc.addImage(
          img,
          'PNG',
          bufferX,
          bufferY,
          pdfWidth,
          pdfHeight,
          undefined,
          'FAST'
        );
        return doc;
      })
      .then((docResult: any) => {
        docResult.save(`historial_clinico.pdf`);
      });
  }





}
