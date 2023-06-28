import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import Swal from 'sweetalert2';
import { sendEmailVerification } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root'
})
export class NotificacionesService {


  constructor(private toastCtrl: ToastrService,private spinner: NgxSpinnerService) { }

   ////////    Toast notifications

   async toastNotificationWarning(mensaje: string) {
    const toast = await this.toastCtrl.warning("", mensaje, {
      timeOut: 3000,
    });
  }
  async toastNotificationInfo(mensaje: string) {
    const toast = await this.toastCtrl.info("", mensaje, {
      timeOut: 3000,
    });
  }

  async toastNotificationSuccess(mensaje: string) {
    const toast = await this.toastCtrl.success("", mensaje, {
      timeOut: 3000,
    });
  }
  async toastNotificationError(mensaje: string) {
    const toast = await this.toastCtrl.error("", mensaje, {
      timeOut: 3000,
    });
  }

  //////Alert 

  async showAlertCorreroVerificacion(user:any): Promise<void> {
    // You can customize the title, text, and other options here
    const result = await Swal.fire({
      title: "Correo de verificacion",
      text: "¿Desea Volver a recibir el correo de verificacion?",
      background: 'rgba(6, 214, 160, 0.8)',
      color:'white',
      //icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Enviar Correo de verificacion',
     // cancelButtonText: 'No, keep it.',
    });
  
    if (result.isConfirmed) {
      console.log("Envie el mail");
      sendEmailVerification(user);
    } else {
      // Perform the action when the user clicks "No, keep it!"
    }
  }
  async showAlertSucces(titulo:string,mensaje:string): Promise<void> {
    // You can customize the title, text, and other options here
    const result = await Swal.fire({
      title: titulo,
      text: mensaje,
      background: 'rgba(6, 214, 160, 0.8)',
      color:'white',
      // backdrop: `
      //   rgba(0,0,123,0.4)
      //   url("https://media.giphy.com/media/2A760H1p8R9UNpYCba/giphy.gif")
      //   top center
      //   no-repeat
      // `,
      //icon: 'warning',
      showCancelButton: false,
      confirmButtonText: 'Continuar',
     // cancelButtonText: 'No, keep it.',
    });
  
    if (result.isConfirmed) {
      // Perform the action when the user clicks "Yes, delete it!"
    } else {
      // Perform the action when the user clicks "No, keep it!"
    }
  }
  async showAlertSuccesConfirmacion(titulo:string,mensaje:string,btnTextConfirmacion:string): Promise<boolean> {
    // You can customize the title, text, and other options here
    const result = await Swal.fire({
      title: titulo,
      text: mensaje,
      background: 'rgba(6, 214, 160, 0.8)',
      color:'white',
      // backdrop: `
      //   rgba(0,0,123,0.4)
      //   url("https://media.giphy.com/media/2A760H1p8R9UNpYCba/giphy.gif")
      //   top center
      //   no-repeat
      // `,
      //icon: 'warning',
      showCancelButton: true,
      confirmButtonText: btnTextConfirmacion,
      cancelButtonText: 'No',
    });
  
    if (result.isConfirmed) {
     return true;
    } else {
    return false;
    }
  }
  async showAlertDanger(titulo:string,mensaje:string): Promise<void> {
    // You can customize the title, text, and other options here
    const result = await Swal.fire({
      title: titulo,
      text: mensaje,
      color:'white',
      background: 'rgba(247, 37, 133, 0.9)',
      backdrop: `
        rgba(0,0,123,0.4)
        top center
        no-repeat
      `,
      icon: 'error',
      showCancelButton: false,
      confirmButtonText: 'Continuar',
     // cancelButtonText: 'No, keep it.',
    });
  
    if (result.isConfirmed) {
      // Perform the action when the user clicks "Yes, delete it!"
    } else {
      // Perform the action when the user clicks "No, keep it!"
    }
  }

  ////Spinner

  showSpinner(){
    this.spinner.show();
  }
  hideSpinner(){
    this.spinner.hide();
  }
  
}
