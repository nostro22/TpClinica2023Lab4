import { Component, ElementRef, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Paciente } from 'src/app/clases/paciente';
import { AutenticadorService } from 'src/app/servicios/autenticador.service';
import { FileUploadService } from 'src/app/servicios/file-upload.service';
import { NotificacionesService } from 'src/app/servicios/notificaciones.service';
@Component({
  selector: 'app-paciente-registro',
  templateUrl: './paciente-registro.component.html',
  styleUrls: ['./paciente-registro.component.css']
})
export class PacienteRegistroComponent {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  @ViewChild('fileInput') fileInput2!: ElementRef<HTMLInputElement>;
  foto1Url: string | null = null;
  foto2Url: string | null = null;
  public fotoPerfil: any;
  public fotoPerfil2: any;
  onFileDivClick(): void {
    this.fileInput.nativeElement.click();
  }
  onFileDivClick2(): void {
    const fileInput = document.getElementById('foto2') as HTMLInputElement;
    fileInput.click();
  }
  public constructor(
    private auth: AutenticadorService,
    private fileUploadService: FileUploadService,
    private fb: FormBuilder,
    private notificacionesS: NotificacionesService,
    private router: Router
  ) { }


  get nombre() {
    return this.formularioRegistroUsuario.get('nombre') as FormControl;
  }

  get apellido() {
    return this.formularioRegistroUsuario.get('apellido') as FormControl;
  }

  get edad() {
    return this.formularioRegistroUsuario.get('edad') as FormControl;
  }
  get dni() {
    return this.formularioRegistroUsuario.get('dni') as FormControl;
  }

  get obraSocial() {
    return this.formularioRegistroUsuario.get('obraSocial') as FormControl;
  }

  get email() {
    return this.formularioRegistroUsuario.get('email') as FormControl;
  }

  get terminos() {
    return this.formularioRegistroUsuario.get('terminos') as FormControl;
  }

  get clave() {
    return this.formularioRegistroUsuario.get('clave') as FormControl;
  }

  get foto1() {
    return this.formularioRegistroUsuario.get('foto1') as FormControl;
  }

  get upload1() {
    return document.getElementById("foto1") as HTMLInputElement;
  }
  get foto2() {
    return this.formularioRegistroUsuario.get('foto2') as FormControl;
  }

  get upload2() {
    return document.getElementById("foto2") as HTMLInputElement;
  }

  public formularioRegistroUsuario = this.fb.group({
    'nombre': ['', [Validators.required, this.spacesValidator]],
    'apellido': ['', [Validators.required, this.spacesValidator]],
    'edad': ['', [Validators.required, Validators.min(18), Validators.max(99)]],
    'dni': ['', [Validators.required, Validators.pattern(/^[1-9]\d{6,7}$/)]],
    'obraSocial': ['', Validators.required],
    'email': ['', [Validators.required, Validators.email]],
    'terminos': ['', Validators.requiredTrue],
    'clave': ['', [Validators.required, Validators.minLength(6)]],
    'foto1': ['', [Validators.required]],
    'foto2': ['', [Validators.required]],
  });

  private spacesValidator(control: AbstractControl): null | object {
    const nombre = <string>control.value;
    const spaces = nombre.includes(' ');

    return spaces
      ? { containsSpaces: true }
      : null;
  }

  setobraSocial(genero: string) {
    this.obraSocial.setValue(genero);
  }

  accesoRapido() {
    this.nombre.setValue("Eduardo");
    this.apellido.setValue("Sosa");
    this.email.setValue("Eduardo@gmail.com");
    this.obraSocial.setValue("Masculino");
    this.edad.setValue("32");
    this.terminos.setValue(true);
  }
  onFileSelected(event: any, photoId: string) {
    const file = event.target.files[0];
    if (file) {
      // Perform any necessary file validations or checks here

      // Read the selected file and update the respective photo URL
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        if (photoId === 'foto1') {
          this.foto1Url = imageUrl;
        }
        if (photoId === 'foto2') {
          this.foto2Url = imageUrl;
        }
      };
      reader.readAsDataURL(file);
    }
  }
  async registrarPaciente() {
    this.notificacionesS.showSpinner();
    if (this.formularioRegistroUsuario.valid) {
      if (!await this.auth.checkIfUserExists(this.email.value)) {
        this.fileUploadService.uploadFiles(this.upload1, "fotoPerfil", this.email.value).then(async () => {
          this.fileUploadService.uploadFiles(this.upload2, "fotoPerfil2", this.email.value).then(async () => {
            if (this.email.value != null) {
              this.fotoPerfil = await this.fileUploadService.getDownloadURLFromCollectionPerfil(this.email.value);
              this.fotoPerfil2 = await this.fileUploadService.getDownloadURLFromCollectionPerfil2(this.email.value);
              const usuario = new Paciente(this.dni.value, this.email.value, this.nombre.value, this.apellido.value, this.edad.value, this.obraSocial.value, this.fotoPerfil, this.fotoPerfil2);
              this.auth.altaPaciente(usuario, usuario.email, this.clave.value)
                .then(() => {
                  this.notificacionesS.showAlertSucces('Usuario registrado con éxito',"Verifique correo electronico para continuar");
                  this.notificacionesS.hideSpinner();
                  this.router.navigate([""]);
                })
                .catch(error => {
                  this.notificacionesS.hideSpinner();
                  console.error('Error al registrar usuario:', error);
                });
              }
              
            });
          });
        } else {
        this.notificacionesS.hideSpinner();
        this.notificacionesS.toastNotificationError("El correo ya esta registrado");
      }
    } else {
      this.notificacionesS.hideSpinner();
      console.warn('Formulario de registro de usuario no válido.');
    }
  }

  
}

