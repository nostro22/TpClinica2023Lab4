import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { createUserWithEmailAndPassword, fetchSignInMethodsForEmail, getAuth, sendEmailVerification, signInWithEmailAndPassword } from '@angular/fire/auth';
import { AutenticadorService } from 'src/app/servicios/autenticador.service';
import { FileUploadService } from 'src/app/servicios/file-upload.service';
import { NotificacionesService } from 'src/app/servicios/notificaciones.service';
@Component({
  selector: 'app-ingreso',
  templateUrl: './ingreso.component.html',
  styleUrls: ['./ingreso.component.scss']
})
export class IngresoComponent {
  public constructor(private fb: FormBuilder, private router: Router, private notificacionS: NotificacionesService, private autenticatorS: AutenticadorService, private dataBase: FileUploadService) { }
  public loading?: boolean;
  public auth = getAuth();
  public pacientesImagenes: string[] = ['../../../assets/user.png', '../../../assets/user.png', '../../../assets/user.png', '../../../assets/user.png', '../../../assets/user.png', '../../../assets/user.png'];
  public cuentas = ['1axieschoolarnostro@gmail.com', '2axieschoolarnostro@gmail.com', '3axieschoolarnostro@gmail.com', 'julioeduardo4682@gmail.com', 'eduardososasegovia.ar@gmail.com', 'eduardososasegovia@gmail.com']

  get email() {
    return this.formularioRegistroUsuario.get('email') as FormControl;
  }
  get clave() {
    return this.formularioRegistroUsuario.get('clave') as FormControl;
  }

  

  public formularioRegistroUsuario = this.fb.group({
    'email': ['', [Validators.required, Validators.email]],
    'clave': ['', [Validators.required, Validators.minLength(6)]],
  });

  private spacesValidator(control: AbstractControl): null | object {
    const nombre = <string>control.value;
    const spaces = nombre.includes(' ');

    return spaces
      ? { containsSpaces: true }
      : null;
  }


  accesoRapido(usuario: string) {
    ///Pacientes
    if (usuario == 'paciente1') {
      this.email.setValue("1axieschoolarnostro@gmail.com");
      this.clave.setValue("123456");
    }
    else if (usuario == 'paciente2') {
      this.email.setValue("2axieschoolarnostro@gmail.com");
      this.clave.setValue("123456");
    }
    else if (usuario == 'paciente3') {
      this.email.setValue("3axieschoolarnostro@gmail.com");
      this.clave.setValue("123456");
    }
    ///Especialistas
    else if (usuario == 'especialista1') {
      this.email.setValue("julioeduardo4682@gmail.com");
      this.clave.setValue("123456");
    }
    else if (usuario == 'especialista2') {
      this.email.setValue("eduardososasegovia.ar@gmail.com");
      this.clave.setValue("123456");
    }
    ///Administrador
    else if (usuario == 'administrador') {
      this.email.setValue("eduardososasegovia@gmail.com");
      this.clave.setValue("123456");
    }

  }

  async logUsuario() {
    this.notificacionS.showSpinner();
    try {
      await new Promise((resolve) => setTimeout(resolve, 3000)); // wait for 3 seconds
      const user = await signInWithEmailAndPassword(this.auth, this.email.value, this.clave.value);
      if (await this.autenticatorS.checkEmailVerificationStatus()) 
      {
        if (await this.dataBase.esEspecialita(this.email.value)) {
          if (await this.dataBase.esEspecialitaAprobado(this.email.value)) {
            this.notificacionS.showAlertSucces("Bienvenido", "bienvenido especialita");
            this.autenticatorS.autenticateSingIn(user);
            this.router.navigate(["home"]); // navigate to the desired route
          } else {
            this.notificacionS.toastNotificationError("aun debe der aprobado por el Administrado");
          }
        }
        else if (await this.dataBase.esPaciente(this.email.value)) {

          this.notificacionS.showAlertSucces("Bienvenido", "bienvenido paciente");
          this.autenticatorS.autenticateSingIn(user);
          this.router.navigate(["home"]); // navigate to the desired route
        }
        else if (await this.dataBase.esAdmin(this.email.value)) {
          this.notificacionS.showAlertSucces("Bienvenido", "bienvenido admin").then(() => {
            this.autenticatorS.autenticateSingIn(user);
            this.router.navigate(["home"]); // navigate to the desired route
          });
        }
        this.autenticatorS.subirHistorialLogin(this.email.value);
      } else {
        this.notificacionS.toastNotificationWarning('No se pudo autenticar al usuario.');
        this.notificacionS.toastNotificationInfo('Es necesario verificar el correo Electronico');
        this.notificacionS.showAlertCorreroVerificacion(user.user);
        
      }
    } catch (error: any) {
      switch (error.code) {
        case 'auth/user-not-found':
          this.notificacionS.toastNotificationWarning('El usuario no se encuentra registrado.');
          break;
        case 'auth/wrong-password':
          this.notificacionS.toastNotificationWarning('Combinacion de Clave y correo electronico erronea.');
          break;
        default:
          this.notificacionS.toastNotificationWarning('Llene ambos campos correo electronico y clave');
          break;
      }
    } finally {
      this.notificacionS.hideSpinner();
    }
  }

  async ngOnInit(): Promise<void> {
    this.loading = false;

    for (let i = 0; i < this.cuentas.length; i++) {
      const cuenta = this.cuentas[i];
      const downloadUrl = await this.dataBase.getDownloadURLFromCollectionPerfil(cuenta);
      if (downloadUrl !== null) {
        this.pacientesImagenes[i] = downloadUrl;
      } else {
        this.pacientesImagenes[i] = 'https://media.giphy.com/media/26xBIygOcC3bAWg3S/giphy.gif';
      }
    }
  }

}
