import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, ValidationErrors, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Especialista } from 'src/app/clases/especialista';
import { AutenticadorService } from 'src/app/servicios/autenticador.service';
import { FileUploadService } from 'src/app/servicios/file-upload.service';
import { NotificacionesService } from 'src/app/servicios/notificaciones.service';

@Component({
  selector: 'app-especialista-registro',
  templateUrl: './especialista-registro.component.html',
  styleUrls: ['./especialista-registro.component.css']
})
export class EspecialistaRegistroComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  foto1Url: string | null = null;
  public fotoPerfil: any;
  public fotoPerfil2: any;
  public especialidadesList: any; 
  public capchaValorGenerado:string="";
  public constructor(
    private auth: AutenticadorService,
    private fileUploadService: FileUploadService,
    private fb: FormBuilder,
    private notificacionesS: NotificacionesService,
    private router: Router
  ) { 
    
  }
  async ngOnInit(): Promise<void> {
    this.especialidadesList = await this.fileUploadService.getListEspecialidades();
    this.capchaValorGenerado = this.generateRandomString(6);

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

  onFileDivClick(): void {
    this.fileInput.nativeElement.click();
  }
  cambiarEspecialidad(especialidad:string){
    this.especialidad.setValue(especialidad);
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

  get especialidad() {
    return this.formularioRegistroUsuario.get('especialidad') as FormControl;
  }
  get especialidad2() {
    return this.formularioRegistroUsuario.get('especialidad2') as FormControl;
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
    'especialidad': ['', Validators.required],
    'especialidad2': ['', ],
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

  
  
  setEspecialidad(valor: string) {
    this.especialidad.setValue(valor);
  }

  accesoRapido() {
    this.nombre.setValue("Eduardo");
    this.apellido.setValue("Sosa");
    this.email.setValue("Eduardo@gmail.com");
    this.especialidad.setValue("Masculino");
    this.edad.setValue("32");
    this.terminos.setValue(true);
  }

  captchaNoValido() {
    return this.capchaValorGenerado != this.capcha.value
  }

  async registrarEspecialista() {
    this.notificacionesS.showSpinner();
    if (this.formularioRegistroUsuario.valid) {
      if (!await this.auth.checkIfUserExists(this.email.value)) {
        this.fileUploadService.uploadFiles(this.upload1, "fotoPerfil", this.email.value).then(async () => {

          if (this.email.value != null) {
            this.fotoPerfil = await this.fileUploadService.getDownloadURLFromCollectionPerfil(this.email.value);
            this.fotoPerfil2 = await this.fileUploadService.getDownloadURLFromCollectionPerfil2(this.email.value);
            const usuario = new Especialista(this.dni.value, this.email.value, this.nombre.value, this.apellido.value, this.edad.value, this.especialidad.value, this.especialidad2.value, this.fotoPerfil);
            this.auth.altaEspecialista(usuario, usuario.email, this.clave.value)
              .then(() => {
                this.notificacionesS.showAlertSucces("Usuario registrado con éxito","Verifique correo electronico para continuar");
                this.notificacionesS.hideSpinner();
                this.router.navigate([""]);
              })
              .catch(error => {
                this.notificacionesS.hideSpinner();
                console.error('Error al registrar usuario:', error);
              });
            }
          });
        } else {
        this.notificacionesS.hideSpinner();
        this.notificacionesS.toastNotificationError("El correo ya esta registrado");
      }
    } else {
      this.notificacionesS.hideSpinner();
      this.notificacionesS.toastNotificationError('Formulario de registro de usuario no válido.');
    }
  }

 
}

