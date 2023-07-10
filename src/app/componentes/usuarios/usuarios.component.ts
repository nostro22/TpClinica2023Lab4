import { Component } from '@angular/core';
import { Observable, concatAll, distinct, distinctUntilChanged, filter, map, of, toArray } from 'rxjs';
import { AutenticadorService } from 'src/app/servicios/autenticador.service';
import { FileUploadService } from 'src/app/servicios/file-upload.service';
import { NotificacionesService } from 'src/app/servicios/notificaciones.service';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';
const EXCEL_TYPE =
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';
@Component({
  selector: 'app-usuarios',
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.css']
})
export class UsuariosComponent {
  public usuario: any;
  public listadoUsuarios: any;
  public listadoUsuarios$: any;
  public habilitaciones: { [email: string]: boolean } = {};
  public misTurnos$!: Observable<any>;
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

  options: { value: number; label: string; isSelected: boolean; }[] = [
    { value: 0, label: 'Habilitaciones y datos', isSelected: false },
    { value: 1, label: 'Registro Paciente', isSelected: false },
    { value: 2, label: 'Registro Especialista', isSelected: false },
    { value: 3, label: 'Registro Administrador', isSelected: false }
  ];
  selectedOption = 0;
  public selectedValue = "0";
  constructor(private firebase: FileUploadService, private notificacionesS: NotificacionesService, private auth: AutenticadorService) {
  }
  exportAsExcelFile(json: any[], excelFileName: string): void {
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(json);
    const workbook: XLSX.WorkBook = {
      Sheets: { data: worksheet },
      SheetNames: ['data'],
    };
    const excelBuffer: any = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    });
    this.saveAsExcelFile(excelBuffer, excelFileName);
  }

  saveAsExcelFile(buffer: any, fileName: string): void {
    const data: Blob = new Blob([buffer], { type: EXCEL_TYPE });
    FileSaver.saveAs(
      data,
      fileName + '_export_' + new Date().getTime() + EXCEL_EXTENSION
    );
  }


  async onDownloadExcelClick(usuario: any) {
    const citasUsuario = await this.firebase.getTurnosDePaciente(usuario.email).toPromise();
    const filename = 'table.xlsx';
  
    if (citasUsuario) {
      console.log(citasUsuario);
      citasUsuario.map(cita =>{
        cita.especialista=cita.especialista.nombre;
        cita.paciente = cita.paciente.nombre;
      })
      console.log(citasUsuario);
      this.exportAsExcelFile(citasUsuario, filename);
    } else {
      // Handle the case when citasUsuario is undefined
      console.log('citasUsuario is undefined');
    }
  }
  
  async descargarHojaCalculoTodos() {
    let listadoTodosLosUsuarios = await this.firebase.getUsuarios();
   
    const filename = 'ListaCompleta.xlsx';
    this.exportAsExcelFile(listadoTodosLosUsuarios, filename);
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
    this.options[0].isSelected = true;
    this.loadUsuarios();

    this.usuario = (await this.auth.getUserCurrentUser()).email;
    this.usuario = (await this.firebase.getUsuario(this.usuario))[0];
    this.loadUsuarios().then(() => {
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
    this.listadoUsuarios = await this.firebase.getUsuarios();
    console.log(this.listadoUsuarios);
    for (const usuario of this.listadoUsuarios) {
      this.habilitaciones[usuario.email] = await this.isUsuarioHabilitado(usuario.email);
    }
    let usuarioActualAuxiliar = await this.auth.getUserCurrentUser();
    usuarioActualAuxiliar = await this.firebase.getUsuario(usuarioActualAuxiliar.email);
    usuarioActualAuxiliar = usuarioActualAuxiliar[0];
    this.usuarioActual = usuarioActualAuxiliar;
    this.habilitado = await this.isUsuarioHabilitado(usuarioActualAuxiliar.email);
    this.especialidades = await this.firebase.getEspecialidadesPorEmail(usuarioActualAuxiliar.email);
    if (this.habilitado) {
      this.habilitado = "SI";
      this.especialidadActiva = this.especialidades[0];
    } else {
      this.habilitado = "NO";
      this.especialidadActiva = this.especialidades[0];
    }
    this.notificacionesS.hideSpinner();
  }

  accionDesabilitar(email: string) {
    this.firebase.desabilitarEspecialista(email);
    this.loadUsuarios();
  }
  accionHabilitar(email: string) {
    this.firebase.habilitarEspecialista(email);
    this.loadUsuarios();
  }
  public especialidades: any = [];
  public habilitado: any;
  public especialidadActiva: string = "";
  public usuarioActual: any;
  public pacientes: any;
  public pacienteElegido: any;
  dias = [{ 'activo': false, 'dia': 'lunes' }, { 'activo': false, 'dia': 'martes' }, { 'activo': false, 'dia': 'miércoles' },
  { 'activo': false, 'dia': 'jueves' }, { 'activo': false, 'dia': 'viernes' }, { 'activo': false, 'dia': 'sábado' }]



  clickPaciente(paciente: any) {
    this.pacienteElegido = paciente;
    console.log(paciente);
    this.historialClinicioSelecionado = false;
    this.firebase.getTurnosDePaciente(paciente.email).subscribe(cita => {
      console.log(cita);

      const historialFiltrado = cita.filter(unaCita => unaCita.especialista.email == this.usuario.email);
      this.historialClinico = of(historialFiltrado);

    });
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
