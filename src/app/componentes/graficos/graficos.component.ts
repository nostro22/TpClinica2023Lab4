import { Component } from '@angular/core';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';
import { DatePipe } from '@angular/common';
const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';
import { Chart, BarElement, BarController, CategoryScale, Decimation, Filler, Legend, Title, Tooltip, LinearScale, registerables } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { FileUploadService } from 'src/app/servicios/file-upload.service';
import { NotificacionesService } from 'src/app/servicios/notificaciones.service';
import { Subscription } from 'rxjs';


@Component({
  selector: 'app-graficos',
  templateUrl: './graficos.component.html',
  styleUrls: ['./graficos.component.scss']
})
export class GraficosComponent {

  listaLogs: any[] = [];
  listaTurnos: any[] = [];
  private logsSubscription!: Subscription;
  private turnosSubscription!: Subscription;
  //@ts-ignore
  chartPorEspecialidad: any;


  banderaChartSolicitados: boolean = true;
  banderaChartFinalizados = true;

  //directivas

  constructor(private firestore: FileUploadService, private datePipe: DatePipe, private notificacionesS: NotificacionesService) {
    Chart.register(BarElement, BarController, CategoryScale, Decimation, Filler, Legend, Title, Tooltip, LinearScale, ChartDataLabels);
    Chart.register(...registerables);
  }

  fechaDeHoy(): string {
    const currentDate = new Date();
    return this.datePipe.transform(currentDate, 'yyyy-MM-dd HH:mm') || '';
  }

  ngOnInit(): void {
    this.logsSubscription = this.firestore.getLogs().subscribe((logs: any) => {
      this.listaLogs = logs;
      this.listaLogs.forEach(async (l) => {
        l.usuario = await this.firestore.getUsuario(l.usuario);
      });
    });

    this.turnosSubscription = this.firestore.getTurnos().subscribe((turnos) => {
      this.listaTurnos = turnos;

      this.generarChartClienteHumor();
      this.generarChartTurnosPorDia();
      this.generarChartTurnosSolicitadosPorMedico(this.listaTurnos);
      this.generarChartTurnosFinalizadosPorMedico(this.listaTurnos);
    });
}


  ngOnDestroy(): void {
    this.logsSubscription.unsubscribe();
    this.turnosSubscription.unsubscribe();
  }

  // LOGS DE USUARIOS
  descargarPDFLogs() {
    this.notificacionesS.showSpinner();
    const DATA = document.getElementById('pdflogs');
    const doc = new jsPDF('p', 'pt', 'a4');
    const options = {
      background: 'white',
      scale: 2,
    };

    //@ts-ignore
    html2canvas(DATA, options)
      .then((canvas) => {
        const img = canvas.toDataURL('image/PNG');
        const imgProps = (doc as any).getImageProperties(img);
        const pdfWidth = doc.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

        // Calculate number of pages needed
        const pagesNeeded = Math.ceil(pdfHeight / doc.internal.pageSize.getHeight());

        // Loop over each page and insert image
        for (let i = 0; i < pagesNeeded; i++) {
          // Make sure we don't add a new page on the first iteration
          if (i !== 0) {
            doc.addPage();
          }

          const startHeight = pdfWidth * i;

          doc.addImage(
            img,
            'PNG',
            0, // x coord
            -startHeight, // y coord
            pdfWidth,
            pdfHeight
          );
        }

        return doc;
      })
      .then((docResult) => {
        this.notificacionesS.hideSpinner();
        docResult.save(`logs_usuarios.pdf`);
      });
  }

  descargarExcelLogs() {
    let listaMapeada = this.listaLogs.map(log => {
      return {
        fecha: log.fecha,
        perfil: log.usuario[0].tipo,
        nombre: log.usuario[0].nombre,
        apellido: log.usuario[0].apellido,
      }
    });
    this.exportAsExcelFile(listaMapeada, 'logUsuarios');
  }

  // CHART CANTIDAD DE TURNOS POR ESPECIALIDAD
  generarChartClienteHumor() {
    const ctx = (<any>(
      document.getElementById('turnosPorEspecialidad')
    )).getContext('2d');

    const colors = [
      '#79B340',
      '#494288',
      '#CB799A',
      '#DE699A',
      '#F7B891',
      '#950992',
      '#756D94',
    ];

    let i = 0;
    const turnosColores = this.listaTurnos.map(
      (_) => colors[(i = (i + 1) % colors.length)]
    );

    let listaTurnos = [0, 0, 0];
    this.listaTurnos.forEach((t) => {
      if (t.especialidad == 'pediatra') {
        listaTurnos[0]++;
      } else if (t.especialidad == 'odontologo') {
        listaTurnos[1]++;
      } else if (t.especialidad == 'traumatologo') {
        listaTurnos[2]++;
      }
    });

    this.chartPorEspecialidad = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Pediatra', 'Odontologo', 'Traumatologo'],
        datasets: [
          {
            label: undefined,
            data: listaTurnos,
            backgroundColor: turnosColores,
            borderColor: ['#fff'],
            borderWidth: 0,
          },
        ],
      },
      options: {
        responsive: true,
        layout: {
          padding: 20,
        },
        plugins: {
          legend: {
            position: 'top',
            display: false,
          },
          title: {
            display: true,
            color: '#fff',
            font: {
              size: 20,
            }
          },
          datalabels: {
            color: '#fff',
            anchor: 'center',
            align: 'center',
            font: {
              size: 15,
              weight: 'bold',
            },
          },
        },
      },
    });
  }

  descargarPDFTurnosPorEspecialidad() {
    this.notificacionesS.showSpinner();
    const DATA = document.getElementById('pdfTurnosPorEspecialidad');
    const doc = new jsPDF('p', 'pt', 'a4');
    const options = {
      background: 'white',
      scale: 2,
    };
    //@ts-ignore
    html2canvas(DATA, options)
      .then((canvas) => {
        const img = canvas.toDataURL('image/PNG');

        const bufferX = 30;
        const bufferY = 30;
        const imgProps = (doc as any).getImageProperties(img);
        const pdfWidth = doc.internal.pageSize.getWidth() - 2 * bufferX;
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        doc.addImage(img, 'PNG', bufferX, bufferY, pdfWidth, pdfHeight, undefined, 'FAST');
        return doc;
      })
      .then((docResult) => {
        this.notificacionesS.hideSpinner();
        docResult.save(`turnos_por_especialidad.pdf`);
      });
  }

  descargarExcelTurnosPorEspecialidad() {
    const listaTurnos = [
      { especialidad: 'Pediatra', turnos: 0 },
      { especialidad: 'Odontologia', turnos: 0 },
      { especialidad: 'Traumatologia', turnos: 0 },
    ];
    this.listaTurnos.forEach((t) => {
      if (t.especialidad == 'pediatra') {
        listaTurnos[0].turnos++;
      } else if (t.especialidad == 'odontologo') {
        listaTurnos[1].turnos++;
      } else if (t.especialidad == 'traumatologo') {
        listaTurnos[2].turnos++;
      }
    });
    this.exportAsExcelFile(listaTurnos, 'turnosPorEspecialidad');
  }

  // CHART CANTIDAD DE TURNOS POR DIA
  generarChartTurnosPorDia() {
    const ctx = (<any>document.getElementById('turnosPorDia')).getContext('2d');

    const colors = ['#79B340', '#494288', '#CB799A', '#DE699A', '#F7B891', '#950992', '#756D94'];

    let i = 0;
    const turnosColores = this.listaTurnos.map(
      (_) => colors[(i = (i + 1) % colors.length)]
    );

    let listaTurnosPorDia = [0, 0, 0, 0, 0, 0];
    this.listaTurnos.forEach((t) => {
      if (new Date(t.dia).getDay() == 1) {
        listaTurnosPorDia[0]++;
      } else if (new Date(t.dia).getDay() == 2) {
        listaTurnosPorDia[1]++;
      } else if (new Date(t.dia).getDay() == 3) {
        listaTurnosPorDia[2]++;
      } else if (new Date(t.dia).getDay() == 4) {
        listaTurnosPorDia[3]++;
      } else if (new Date(t.dia).getDay() == 5) {
        listaTurnosPorDia[4]++;
      } else if (new Date(t.dia).getDay() == 6) {
        listaTurnosPorDia[5]++;
      }
    });

    this.chartPorEspecialidad = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO'],
        datasets: [
          {
            label: undefined,
            data: listaTurnosPorDia,
            backgroundColor: turnosColores,
            borderColor: ['#000'],
            borderWidth: 0,

          },
        ],
      },
      options: {
        responsive: true,
        layout: {
          padding: 15,
        },
        plugins: {
          legend: {
            position: 'top',
            display: true,
          },

          datalabels: {
            color: '#fff',
            anchor: 'center',
            align: 'center',
            font: {
              size: 15,
              weight: 'bold',
            },
          },
        },
      },
    });
  }

  descargarPDFTurnosPorDia() {
    this.notificacionesS.showSpinner();
    const DATA = document.getElementById('pdfTurnosPorDia');
    const doc = new jsPDF('p', 'pt', 'a4');
    const options = {
      background: 'white',
      scale: 2,
    };
    //@ts-ignore
    html2canvas(DATA, options)
      .then((canvas) => {
        const img = canvas.toDataURL('image/PNG');

        const bufferX = 30;
        const bufferY = 30;
        const imgProps = (doc as any).getImageProperties(img);
        const pdfWidth = doc.internal.pageSize.getWidth() - 2 * bufferX;
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        doc.addImage(img, 'PNG', bufferX, bufferY, pdfWidth, pdfHeight, undefined, 'FAST');
        return doc;
      })
      .then((docResult) => {
        this.notificacionesS.hideSpinner();
        docResult.save(`turnos_por_dia.pdf`);
      });
  }

  descargarExcelTurnosPorDia() {
    const listaTurnosPorDia = [
      {
        Fecha: new Date(),
        Lunes: 0,
        Martes: 0,
        Miercoles: 0,
        Jueves: 0,
        Viernes: 0,
        Sabado: 0,
      },
    ];
    this.listaTurnos.forEach((t) => {
      if (new Date(t.dia).getDay() == 1) {
        //@ts-ignore
        listaTurnosPorDia[0].Lunes++;
      } else if (new Date(t.dia).getDay() == 2) {
        //@ts-ignore
        listaTurnosPorDia[0].Martes++;
      } else if (new Date(t.dia).getDay() == 3) {
        //@ts-ignore
        listaTurnosPorDia[0].Miercoles++;
      } else if (new Date(t.dia).getDay() == 4) {
        //@ts-ignore
        listaTurnosPorDia[0].Jueves++;
      } else if (new Date(t.dia).getDay() == 5) {
        //@ts-ignore
        listaTurnosPorDia[0].Viernes++;
      } else if (new Date(t.dia).getDay() == 6) {
        //@ts-ignore
        listaTurnosPorDia[0].Sabado++;
      }
    });
    this.exportAsExcelFile(listaTurnosPorDia, 'turnosPorDia');
  }

  // CHART CANTIDAD DE TURNOS SOLICITADOS POR MEDICO
  generarChartTurnosSolicitadosPorMedico(listado: any[]) {
    const ctx = (<any>(
      document.getElementById('turnosSolicitadosPorMedico')
    )).getContext('2d');

    const colors = [
      '#79B340',
      '#494288',
      '#CB799A',
      '#DE699A',
      '#F7B891',
      '#950992',
      '#756D94',
    ];

    let i = 0;
    const turnosColores = this.listaTurnos.map(
      (_) => colors[(i = (i + 1) % colors.length)]
    );
    let listaTurnosSolicitadosPorMedico = [0, 0];
    listado.forEach((t) => {
      if (
        t.especialista.email == 'julioeduardo4682@gmail.com' &&
        t.estado == 'sinAprobar'
      ) {
        listaTurnosSolicitadosPorMedico[0]++;
      } else if (
        t.especialista.email == 'eduardososasegovia.ar@gmail.com' &&
        t.estado == 'sinAprobar'
      ) {
        listaTurnosSolicitadosPorMedico[1]++;
      }
    });

    this.chartPorEspecialidad = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Especialista 1', 'Especialista 2'],
        datasets: [
          {
            label: undefined,
            data: listaTurnosSolicitadosPorMedico,
            backgroundColor: turnosColores,
            borderColor: ['#000'],
            borderWidth: 0,
          },
        ],
      },
      options: {
        responsive: true,
        layout: {
          padding: 20,
        },
        plugins: {
          legend: {
            position: 'top',
            display: true,
          },
          title: {
            display: true,
            color: '#fff',
            font: {
              size: 20,
            }
          },
          datalabels: {
            color: '#fff',
            anchor: 'center',
            align: 'center',
            font: {
              size: 15,
              weight: 'bold',
            },
          },
        },
      },
    });
  }

  descargarPDFTurnosSolicitadosPorMedico() {
    this.notificacionesS.showSpinner();
    const DATA = document.getElementById('pdfTurnosSolicitadosPorMedico');
    const doc = new jsPDF('p', 'pt', 'a4');
    const options = {
      background: 'white',
      scale: 2,
    };
    //@ts-ignore
    html2canvas(DATA, options)
      .then((canvas) => {
        const img = canvas.toDataURL('image/PNG');

        const bufferX = 30;
        const bufferY = 30;
        const imgProps = (doc as any).getImageProperties(img);
        const pdfWidth = doc.internal.pageSize.getWidth() - 2 * bufferX;
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        doc.addImage(img, 'PNG', bufferX, bufferY, pdfWidth, pdfHeight, undefined, 'FAST');
        return doc;
      })
      .then((docResult) => {
        this.notificacionesS.hideSpinner();
        docResult.save(`turnosSolicitadosPorMedico.pdf`);
      });
  }

  descargarExcelTurnosSolicitadosPorMedico() {
    let listaTurnosSolicitadosPorMedico = [
      {
        Fecha: new Date(),
        Especialista1: 0,
        Especialista2: 0,
      },
    ];

    const currentDate = new Date();
    const futureDate = new Date(currentDate.getTime() + 84600000 * 7);
    const listadoFiltrado: any[] = [];
    this.listaTurnos.forEach((t) => {
      if (
        new Date(t.dia).getTime() <= futureDate.getTime() &&
        t.estado == 'sinAprobar'
      ) {
        listadoFiltrado.push(t);
      }
    });

    listadoFiltrado.forEach((t) => {
      if (
        t.especialista.email == 'julioeduardo4682@gmail.com' &&
        t.estado == 'sinAprobar'
      ) {
        listaTurnosSolicitadosPorMedico[0].Especialista1++;
      } else if (
        t.especialista.email == 'eduardososasegovia.ar@gmail.com' &&
        t.estado == 'sinAprobar'
      ) {
        listaTurnosSolicitadosPorMedico[0].Especialista2++;
      }

    });

    this.exportAsExcelFile(
      listaTurnosSolicitadosPorMedico,
      'turnosSolicitadosPorMedico'
    );
  }

  filtrarTurnosPorDias(cantidadDias: number) {
    this.banderaChartSolicitados = false;

    setTimeout(() => {
      this.banderaChartSolicitados = true;
      setTimeout(() => {
        const currentDate = new Date();
        const futureDate = new Date(
          currentDate.getTime() + 84600000 * cantidadDias
        );
        const listadoFiltrado: any[] = [];
        this.listaTurnos.forEach((t) => {
          if (
            new Date(t.dia).getTime() <=
            futureDate.getTime() &&
            t.estado == 'sinAprobar'
          ) {
            listadoFiltrado.push(t);
          }
        });
        console.log(this.listaTurnos)
        console.log(listadoFiltrado)
        this.generarChartTurnosSolicitadosPorMedico(listadoFiltrado);
      }, 500);
    }, 100);
  }

  // CHART CANTIDAD DE TURNOS FINALIZADOS POR MEDICO
  generarChartTurnosFinalizadosPorMedico(listado: any[]) {
    const ctx = (<any>(
      document.getElementById('turnosFinalizadosPorMedico')
    )).getContext('2d');

    const colors = [
      '#79B340',
      '#494288',
      '#CB799A',
      '#DE699A',
      '#F7B891',
      '#950992',
      '#756D94',
    ];

    let i = 0;
    const turnosColores = this.listaTurnos.map(
      (_) => colors[(i = (i + 1) % colors.length)]
    );

    let listaTurnosFinalizadosPorMedico = [0, 0];
    listado.forEach((t) => {
      if (
        t.especialista.email == 'julioeduardo4682@gmail.com' &&
        t.estado == 'finalizado'
      ) {
        listaTurnosFinalizadosPorMedico[0]++;
      } else if (
        t.especialista.email == 'eduardososasegovia.ar@gmail.com' &&
        t.estado == 'finalizado'
      ) {
        listaTurnosFinalizadosPorMedico[1]++;
      }
    });

    this.chartPorEspecialidad = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Especialista 1', 'Especialista 2'],
        datasets: [
          {
            label: undefined,
            data: listaTurnosFinalizadosPorMedico,
            backgroundColor: turnosColores,
            borderColor: ['#000'],
            borderWidth: 0,
          },
        ],
      },
      options: {
        responsive: true,
        layout: {
          padding: 20,
        },
        plugins: {
          legend: {
            position: 'top',
            display: true,
          },
          title: {
            display: true,
            color: '#fff',
            font: {
              size: 20,
            }
          },
          datalabels: {
            color: '#fff',
            anchor: 'center',
            align: 'center',
            font: {
              size: 15,
              weight: 'bold',
            },
          },
        },
      },
    });
  }

  descargarExcelTurnosFinalizadosPorMedico() {
    let listaTurnosFinalizadosPorMedico = [
      {
        Fecha: new Date(),
        Especialista1: 0,
        Especialista2: 0,
      },
    ];

    const currentDate = new Date();
    const futureDate = new Date(currentDate.getTime() + 84600000 * 7);
    const listadoFiltrado: any[] = [];
    this.listaTurnos.forEach((t) => {
      if (
        new Date(t.dia).getTime() <= futureDate.getTime() &&
        t.estado == 'finalizado'
      ) {

        listadoFiltrado.push(t);
      }
    });

    listadoFiltrado.forEach((t) => {
      if (
        t.especialista.email == 'julioeduardo4682@gmail.com' &&
        t.estado == 'finalizado'
      ) {
        listaTurnosFinalizadosPorMedico[0].Especialista1++;
      } else if (
        t.especialista.email == 'eduardososasegovia.ar@gmail.com' &&
        t.estado == 'finalizado'
      ) {
        listaTurnosFinalizadosPorMedico[0].Especialista2++;
      }
    });

    this.exportAsExcelFile(
      listaTurnosFinalizadosPorMedico,
      'turnosFinalizadosPorMedico'
    );
  }

  descargarPDFTurnosFinalizadosPorMedico() {
    this.notificacionesS.showSpinner();
    const DATA = document.getElementById('pdfTurnosFinalizadosPorMedico');
    const doc = new jsPDF('p', 'pt', 'a4');
    const options = {
      background: 'white',
      scale: 2,
    };
    //@ts-ignore
    html2canvas(DATA, options)
      .then((canvas) => {
        const img = canvas.toDataURL('image/PNG');

        const bufferX = 30;
        const bufferY = 30;
        const imgProps = (doc as any).getImageProperties(img);
        const pdfWidth = doc.internal.pageSize.getWidth() - 2 * bufferX;
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        doc.addImage(img, 'PNG', bufferX, bufferY, pdfWidth, pdfHeight, undefined, 'FAST');
        return doc;
      })
      .then((docResult) => {
        this.notificacionesS.hideSpinner();
        docResult.save(`turnosFinalizadosPorMedico.pdf`);
      });
  }

  filtrarTurnosPorDiasFinalizados(cantidadDias: number) {
    this.banderaChartFinalizados = false;

    setTimeout(() => {
      this.banderaChartFinalizados = true;
      setTimeout(() => {
        const currentDate = new Date();
        const futureDate = new Date(
          currentDate.getTime() + 84600000 * cantidadDias
        );
        const listadoFiltrado: any[] = [];
        this.listaTurnos.forEach((t) => {
          if (
            new Date(t.dia).getTime() <=
            futureDate.getTime() &&
            t.estado == 'finalizado'
          ) {
            listadoFiltrado.push(t);
          }
        });
        this.generarChartTurnosFinalizadosPorMedico(listadoFiltrado);
      }, 500);
    }, 100);
  }

  // UTILES
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
}
