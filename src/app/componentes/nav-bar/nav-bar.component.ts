import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { Router, NavigationEnd, NavigationStart } from '@angular/router';
import { AutenticadorService } from 'src/app/servicios/autenticador.service';
import { FileUploadService } from 'src/app/servicios/file-upload.service';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush // Add this line
})
export class NavBarComponent implements OnInit {
  nombreUsuarioSubject: BehaviorSubject<string> = new BehaviorSubject<string>('Visitante');
  nombreUsuario$ = this.nombreUsuarioSubject.asObservable();
  isUserAuthenticatedSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false); // Change type to boolean
  isUserAuthenticated$ = this.isUserAuthenticatedSubject.asObservable();
  isUserAdminSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false); // Change type to boolean
  isUserAdmin$ = this.isUserAdminSubject.asObservable();
  public usuario: any;

  constructor(
    private auth: AutenticadorService,
    private baseDatos: FileUploadService,
    private router: Router,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.refreshComponent();
      }
      if (event instanceof NavigationStart) {
        this.nombreUsuarioSubject.next('Visitante');
      }
    });
  }

  async refreshComponent(): Promise<void> {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const user = await this.auth.getUserByUID(token);
        const nombre = await user.nombre;
        this.nombreUsuarioSubject.next(nombre);
        this.usuario = (await this.baseDatos.getUsuario(user.email))[0];
        this.isUserAuthenticatedSubject.next(true); // Set the value to true for an authenticated user
        const isAdmin = await this.baseDatos.esAdmin(user.email);
        this.isUserAdminSubject.next(isAdmin);
      } else {
        this.isUserAuthenticatedSubject.next(false);
        this.isUserAdminSubject.next(false);
        this.nombreUsuarioSubject.next('Visitante');
      }
    } catch (error) {
      console.error('Error fetching isAdmin:', error);
    }
  }

  logOut(): void {
    this.auth.cerrarSeccion();
    localStorage.setItem('token', '');
    this.auth.tokenSubject.next('');
    this.refreshComponent();
    this.router.navigateByUrl('ingreso', { replaceUrl: true });
  }
}
