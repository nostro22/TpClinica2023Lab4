import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AutenticadorService } from 'src/app/servicios/autenticador.service';

@Component({
  selector: 'app-bienvenida',
  templateUrl: './bienvenida.component.html',
  styleUrls: ['./bienvenida.component.css']
})
export class BienvenidaComponent implements  OnInit {

  constructor(private router:Router, private auth:AutenticadorService){}
  ngOnInit(): void {
   this.checkToken();
  }
private UserAuthenticated:any;
public isUserAuthenticated=false;

async checkToken(): Promise<void> {
  const token = await this.auth.getToken();
  if (token !== '') {
    this.isUserAuthenticated = true;
  } else {
    this.UserAuthenticated = localStorage.getItem('token');
    if (this.UserAuthenticated != "") {
      const user = await this.auth.getUserByUID(this.UserAuthenticated);
      this.UserAuthenticated = user;
      this.isUserAuthenticated = true;
    }
  }
}

  goTo(destino:string){
    if(destino=="registro")
    {
      this.router.navigateByUrl("/lazy/"+destino);
      
    }
    else{
      
      this.router.navigateByUrl("/"+destino);
    }
  }
}
