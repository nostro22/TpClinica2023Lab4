import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { initializeApp,provideFirebaseApp } from '@angular/fire/app';
import { environment } from '../environments/environment';
import { provideAuth,getAuth } from '@angular/fire/auth';
import { provideDatabase,getDatabase } from '@angular/fire/database';
import { provideFirestore,getFirestore } from '@angular/fire/firestore';
import { provideStorage,getStorage } from '@angular/fire/storage';
import { BienvenidaComponent } from './componentes/bienvenida/bienvenida.component';
import { ToastrModule } from 'ngx-toastr';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { IngresoComponent } from './componentes/ingreso/ingreso.component';
import { NavBarComponent } from './componentes/nav-bar/nav-bar.component';
import { NgxSpinnerModule } from 'ngx-spinner';
import { QuienComponent } from './componentes/quien/quien.component';
import { ErrorComponent } from './componentes/error/error.component';
import { TurnoPacienteComponent } from './componentes/turno-paciente/turno-paciente.component';
import { TurnoEspecialistaComponent } from './componentes/turno-especialista/turno-especialista.component';
import { TurnoAdministradorComponent } from './componentes/turno-administrador/turno-administrador.component';
import { TurnoSolicitarComponent } from './componentes/turno-solicitar/turno-solicitar.component';
import { MiPerfilComponent } from './componentes/mi-perfil/mi-perfil.component';
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';
import { MisTurnosComponent } from './componentes/mis-turnos/mis-turnos.component';
import { DatePipe } from '@angular/common';
import { CompartidoModule } from './modulos/compartido/compartido.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
// Register the 'es' locale
registerLocaleData(localeEs);
@NgModule({
  declarations: [
    AppComponent,
    BienvenidaComponent,
    IngresoComponent,
    NavBarComponent,
    QuienComponent,
    ErrorComponent,
    TurnoPacienteComponent,
    TurnoEspecialistaComponent,
    TurnoAdministradorComponent,
    TurnoSolicitarComponent,
    MiPerfilComponent,
    MisTurnosComponent,
    
  ],
  imports: [
    BrowserModule,
    NgbModule,
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAuth(() => getAuth()),
    provideDatabase(() => getDatabase()),
    provideFirestore(() => getFirestore()),
    provideStorage(() => getStorage()),
    ToastrModule.forRoot(),
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    NgxSpinnerModule,
    AppRoutingModule,
    CompartidoModule,
    BrowserAnimationsModule

  ],
  providers: [DatePipe],
  bootstrap: [AppComponent]
})
export class AppModule { }
