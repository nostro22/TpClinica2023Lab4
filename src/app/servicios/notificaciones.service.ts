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
  async showAlertComentario(titulo: string, mensaje: string): Promise<string | false> {
    const result = await Swal.fire({
      title: titulo,
      html: `<input type="text" id="comentario" class="swal2-input" placeholder="Ingrese su comentario">`,
      background: 'rgba(6, 214, 160, 0.8)',
      color: 'white',
      showCancelButton: true,
      confirmButtonText: "Enviar",
      cancelButtonText: 'No',
      preConfirm: () => {
        const comentarioInput = document.getElementById('comentario') as HTMLInputElement;
        return comentarioInput.value;
      },
    });
  
    if (result.isConfirmed) {
      return result.value as string;
    } else {
      return false;
    }
  }


  async showFormulario(): Promise<{ altura: number, peso: number, temperatura: number, presion: number, detalles: any} | null> {
    const { value: formValues } = await Swal.fire({
      title: 'Ingrese los datos',
      html:
        `<input id="altura" class="swal2-input" type="number" placeholder="Altura (cm)" step="0.01" required>` +
        `<input id="peso" class="swal2-input" type="number" placeholder="Peso (kg)" step="0.01" required>` +
        `<input id="temperatura" class="swal2-input" type="number" placeholder="Temperatura (°C)" step="0.01" required>` +
        `<input id="presion" class="swal2-input" type="number" placeholder="Presión (mmHg)" step="0.01" required>` +
        `<div id="detalles-container"></div>` +
        `<button id="agregar-detalle" class="swal2-confirm swal2-styled" type="button" style="display: none">Agregar Detalle</button>`,
      background: 'rgba(6, 214, 160, 0.8)',
      color: 'white',
      showCancelButton: true,
      confirmButtonText: "Guardar",
      cancelButtonText: 'Cancelar',
      preConfirm: () => {
        const alturaInput = document.getElementById('altura') as HTMLInputElement;
        const pesoInput = document.getElementById('peso') as HTMLInputElement;
        const temperaturaInput = document.getElementById('temperatura') as HTMLInputElement;
        const presionInput = document.getElementById('presion') as HTMLInputElement;
        const detallesContainer = document.getElementById('detalles-container');
        const detallesInputs = detallesContainer?.getElementsByClassName('detalle-input') as HTMLCollectionOf<HTMLInputElement>;
        const claveInputs = detallesContainer?.getElementsByClassName('clave-input') as HTMLCollectionOf<HTMLInputElement>;
  
        const altura = parseFloat(alturaInput.value);
        const peso = parseFloat(pesoInput.value);
        const temperatura = parseFloat(temperaturaInput.value);
        const presion = parseFloat(presionInput.value);
  
        const detalles: { clave: string, valor: string }[] = [];
  
        for (let i = 0; i < detallesInputs.length; i++) {
          const clave = claveInputs[i].value;
          const valor = detallesInputs[i].value;
          detalles.push({ clave, valor });
        }
  
        return { altura, peso, temperatura, presion, detalles };
      },
      didOpen: () => {
        const agregarDetalleButton = document.getElementById('agregar-detalle');
        const detallesContainer = document.getElementById('detalles-container');
  
        agregarDetalleButton!.style.display = 'block';
  
        let detalleCount = 0;
  
        agregarDetalleButton!.addEventListener('click', () => {
          if (detalleCount < 3) {
            const claveInput = document.createElement('input');
            claveInput.classList.add('swal2-input');
            claveInput.classList.add('clave-input');
            claveInput.setAttribute('placeholder', 'Clave ' + (detalleCount + 1));
            claveInput.setAttribute('data-clave', '');
            detallesContainer!.appendChild(claveInput);
            const detalleInput = document.createElement('input');
            detalleInput.classList.add('swal2-input');
            detalleInput.classList.add('detalle-input');
            detalleInput.setAttribute('placeholder', 'Valor ' + (detalleCount + 1));
            detalleInput.setAttribute('data-clave', '');
            detallesContainer!.appendChild(detalleInput);
            detalleCount++;
          }
  
          if (detalleCount === 3) {
            agregarDetalleButton!.style.display = 'none';
          }
        });
  
        const alturaInput = document.getElementById('altura') as HTMLInputElement;
        const pesoInput = document.getElementById('peso') as HTMLInputElement;
        const temperaturaInput = document.getElementById('temperatura') as HTMLInputElement;
        const presionInput = document.getElementById('presion') as HTMLInputElement;
        const confirmButton = Swal.getConfirmButton();
        confirmButton!.disabled = true;
  
        function validateInputs() {
          if (alturaInput.value && pesoInput.value && temperaturaInput.value && presionInput.value) {
            confirmButton!.disabled = false;
          } else {
            confirmButton!.disabled = true;
          }
        }
  
        alturaInput.addEventListener('input', validateInputs);
        pesoInput.addEventListener('input', validateInputs);
        temperaturaInput.addEventListener('input', validateInputs);
        presionInput.addEventListener('input', validateInputs);
  
        validateInputs();
      },
      willClose: () => {
        const detallesContainer = document.getElementById('detalles-container');
        detallesContainer!.innerHTML = ''; 
      },
      focusConfirm: false,
      allowOutsideClick: false,
      allowEnterKey: false,
      inputValidator: () => {
        const alturaInput = document.getElementById('altura') as HTMLInputElement;
        const pesoInput = document.getElementById('peso') as HTMLInputElement;
        const temperaturaInput = document.getElementById('temperatura') as HTMLInputElement;
        const presionInput = document.getElementById('presion') as HTMLInputElement;
  
        if (!alturaInput.value || !pesoInput.value || !temperaturaInput.value || !presionInput.value) {
          return 'Por favor, complete todos los campos obligatorios.';
        }
        return null;
      },
    });
  
    if (formValues && formValues.altura && formValues.peso && formValues.temperatura && formValues.presion) {
      return formValues as { altura: number, peso: number, temperatura: number, presion: number, detalles: any };
    } else {
      return null;
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
