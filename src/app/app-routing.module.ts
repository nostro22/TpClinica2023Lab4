import { NgModule } from '@angular/core';

import { RouterModule, Routes } from '@angular/router';
import { BienvenidaComponent } from './componentes/bienvenida/bienvenida.component';
import { QuienComponent } from './componentes/quien/quien.component';
import { IngresoComponent } from './componentes/ingreso/ingreso.component';
import { ErrorComponent } from './componentes/error/error.component';
import { TurnoPacienteComponent } from './componentes/turno-paciente/turno-paciente.component';
import { TurnoEspecialistaComponent } from './componentes/turno-especialista/turno-especialista.component';
import { TurnoAdministradorComponent } from './componentes/turno-administrador/turno-administrador.component';
import { MiPerfilComponent } from './componentes/mi-perfil/mi-perfil.component';
import { MisTurnosComponent } from './componentes/mis-turnos/mis-turnos.component';

const routes: Routes = [
  { path: "", pathMatch: "full", title: "Bienvenida", component: BienvenidaComponent },
  { path: "home", redirectTo: "" },
  { path: "ingreso", title: "Ingreso", component: IngresoComponent },
  { path: "turno/paciente", title: "Turno Paciente", component: TurnoPacienteComponent },
  { path: "turno/especialista", title: "Turno especialista", component: TurnoEspecialistaComponent },
  { path: "turnos", title: "Turno administrador", component: TurnoAdministradorComponent },
  { path: "misTurnos", title: "Mis Turnos", component: MisTurnosComponent },
  { path: "perfil", title: "perfil", component: MiPerfilComponent },
  { path: "404", title: "Error", component: ErrorComponent },
  { path: "quien", title: "Eduardo Andres Sosa Segovia", component: QuienComponent },
  { path: "lazy", loadChildren: () => import('./modulos/formularios-registro/formularios-registro.module').then(m => m.FormulariosRegistroModule) },
  { path: '**', redirectTo: '404' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }