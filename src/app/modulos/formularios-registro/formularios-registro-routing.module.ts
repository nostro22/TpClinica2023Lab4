import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RegistroComponent } from 'src/app/componentes/registro/registro.component';
import { UsuariosComponent } from 'src/app/componentes/usuarios/usuarios.component';
import { IsAdminGuard } from 'src/app/guards/is-admin.guard';

const routes: Routes = [
  {path:"registro", title:"Registro", component: RegistroComponent},
  {path:"usuarios", title:"Usuarios", component: UsuariosComponent, canActivate:[IsAdminGuard]}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FormulariosRegistroRoutingModule { }
