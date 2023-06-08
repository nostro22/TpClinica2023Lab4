import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PacienteRegistroComponent } from 'src/app/componentes/paciente-registro/paciente-registro.component';
import { AdministradorRegistroComponent } from 'src/app/componentes/administrador-registro/administrador-registro.component';
import { EspecialistaRegistroComponent } from 'src/app/componentes/especialista-registro/especialista-registro.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RegistroComponent } from 'src/app/componentes/registro/registro.component';
import { UsuariosComponent } from 'src/app/componentes/usuarios/usuarios.component';
import { FormulariosRegistroRoutingModule } from './formularios-registro-routing.module';


@NgModule({
  declarations: [
    PacienteRegistroComponent,
    AdministradorRegistroComponent,
    EspecialistaRegistroComponent,
    RegistroComponent,
    UsuariosComponent

  ],
  imports: [
    CommonModule,
    FormulariosRegistroRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    
  ]
})
export class FormulariosRegistroModule { }
