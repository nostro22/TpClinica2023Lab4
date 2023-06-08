import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AutenticadorService } from '../servicios/autenticador.service';
import { FileUploadService } from '../servicios/file-upload.service';

@Injectable({
  providedIn: 'root'
})
export class IsAdminGuard implements CanActivate {
  constructor(private auth: AutenticadorService, private base: FileUploadService, private router: Router) {}

  async canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<boolean | UrlTree> {
    const isUsuario = await this.auth.usuarioAutenticado;

    if (await this.base.esAdmin(isUsuario?.email)) {
      console.log('Usuario es administrador:', isUsuario);
      return true;
    } else {
      return this.router.parseUrl('/error');
    }
  }
}
