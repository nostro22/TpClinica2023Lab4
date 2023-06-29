import { Component } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { Observable, concatAll, distinct, distinctUntilChanged, filter, map, of, toArray } from 'rxjs';
import { AutenticadorService } from 'src/app/servicios/autenticador.service';
import { FileUploadService } from 'src/app/servicios/file-upload.service';
import { NotificacionesService } from 'src/app/servicios/notificaciones.service';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-usuarios',
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.css']
})
export class UsuariosComponent {
  public usuario: any;
  public listadoUsuarios: any;
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
    { value: 0, label: 'Habilitaciones', isSelected: false },
    { value: 1, label: 'Registro Paciente', isSelected: false },
    { value: 2, label: 'Registro Especialista', isSelected: false },
    { value: 3, label: 'Registro Administrador', isSelected: false }
  ];
  selectedOption = 0;
  public selectedValue = "0";
  constructor(private firebase: FileUploadService, private notificacionesS: NotificacionesService, private auth:AutenticadorService) {
  }
  downloadExcelTable(data: any[], filename: string) {
    // Crear un nuevo libro de Excel
    const workbook = XLSX.utils.book_new();

    // Convertir el arreglo de datos a una hoja de cálculo
    const worksheet = XLSX.utils.json_to_sheet(data);

    // Agregar la hoja de cálculo al libro
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

    // Convertir el libro a un archivo Excel binario
    const excelData = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

    // Crear un Blob con los datos del Excel
    const blob = new Blob([excelData], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

    // Crear un enlace de descarga
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;

    // Simular un clic en el enlace para iniciar la descarga
    link.click();
  }

  onDownloadExcelClick( usuario:any) {
    console.log(usuario);
    const tableData = [
      usuario
      // Agrega más filas según sea necesario
    ];

    const filename = 'table.xlsx';

    this.downloadExcelTable(tableData, filename);
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
