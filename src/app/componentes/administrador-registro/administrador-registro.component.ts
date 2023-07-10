import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Administrador } from 'src/app/clases/administrador';
import { AutenticadorService } from 'src/app/servicios/autenticador.service';
import { FileUploadService } from 'src/app/servicios/file-upload.service';
import { NotificacionesService } from 'src/app/servicios/notificaciones.service';

@Component({
  selector: 'app-administrador-registro',
  templateUrl: './administrador-registro.component.html',
  styleUrls: ['./administrador-registro.component.css']
})
export class AdministradorRegistroComponent {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  foto1Url: string | null = null;
  public fotoPerfil: any;
  public capchaValorGenerado:string="";
  public especialidadesList: string[] = [];
  public constructor(
    private auth: AutenticadorService,
    private fileUploadService: FileUploadService,
    private fb: FormBuilder,
    private notifiacionS: NotificacionesService,
    private router: Router
  ) { }
  async ngOnInit(): Promise<void> {
    this.especialidadesList = await this.fileUploadService.getListEspecialidades();
    this.capchaValorGenerado = this.generateRandomString(6);
  }

  onFileDivClick(): void {
    this.fileInput.nativeElement.click();
  }

  captchaNoValido() {
    return this.capchaValorGenerado != this.capcha.value
  }
  generateRandomString(num: number) {
    const characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result1 = '';
    const charactersLength = characters.length;
    for (let i = 0; i < num; i++) {
      result1 += characters.charAt(
        Math.floor(Math.random() * charactersLength)
      );
    }
    return result1;
  }

  onFileSelected(event: any, photoId: string) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        if (photoId === 'foto1') {
          this.foto1Url = imageUrl;
        }
      };
      reader.readAsDataURL(file);
    }
  }
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
  get capcha() {
    return this.formularioRegistroUsuario.get('capcha') as FormControl;
  }


  public formularioRegistroUsuario = this.fb.group({
    'nombre': ['', [Validators.required, this.spacesValidator]],
    'apellido': ['', [Validators.required, this.spacesValidator]],
    'edad': ['', [Validators.required, Validators.min(18), Validators.max(99)]],
    'dni': ['', [Validators.required, Validators.pattern(/^[1-9]\d{6,7}$/)]],
    'email': ['', [Validators.required, Validators.email]],
    'terminos': ['', Validators.requiredTrue],
    'clave': ['', [Validators.required, Validators.minLength(6)]],
    'foto1': ['', [Validators.required]],
    'capcha': ['', [Validators.required]],

  });

  private spacesValidator(control: AbstractControl): null | object {
    const nombre = <string>control.value;
    const spaces = nombre.includes(' ');

    return spaces
      ? { containsSpaces: true }
      : null;
  }

  async registrarEspecialista() {
    this.notifiacionS.hideSpinner();
    if (this.formularioRegistroUsuario.valid) {
      if (!await this.auth.checkIfUserExists(this.email.value)) {
        this.fileUploadService.uploadFiles(this.upload1, "fotoPerfil", this.email.value).then(async () => {

          if (this.email.value != null) {
            this.fotoPerfil = await this.fileUploadService.getDownloadURLFromCollectionPerfil(this.email.value);
            const usuario = new Administrador(this.dni.value, this.email.value, this.nombre.value, this.apellido.value, this.edad.value, this.fotoPerfil);
            this.auth.altaAdministrador(usuario, usuario.email, this.clave.value)
              .then(() => {
                console.log('Usuario registrado con éxito.');
                this.fileUploadService.habilitarAdministrador(this.email.value);
                this.notifiacionS.toastNotificationInfo("Verifique correo electronico para poder iniciar seccion");
                this.notifiacionS.hideSpinner();
                this.router.navigate([""]);
              })
              .catch(error => {
                this.notifiacionS.hideSpinner();
                console.error('Error al registrar usuario:', error);
              });
            }
          });
        } else {
          this.notifiacionS.hideSpinner();
          this.notifiacionS.toastNotificationError("El correo ya esta registrado");
        }
      } else {
      this.notifiacionS.hideSpinner();
      this.notifiacionS.toastNotificationWarning('Formulario de registro de usuario no válido.');
    }
  }

}

