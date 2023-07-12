import { Component } from '@angular/core';
import { trigger, transition, style, query, animate, group } from '@angular/animations';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  animations: [
    trigger('routeAnimations', [
      transition('* => QuienPage', [
        // Animation for "quien" route
        query(':enter, :leave', 
          style({ position: 'fixed', width: '100%', height: '100%' }), 
          { optional: true }
        ),
        group([
          query(':enter', [
            style({ transform: 'scale(0)' }),
            animate('0.5s ease-in-out', 
              style({ transform: 'scale(1)' })
            )
          ], { optional: true }),
          query(':leave', [
            style({ transform: 'scale(1)' }),
            animate('0.5s ease-in-out', 
              style({ transform: 'scale(0)' })
            )
          ], { optional: true }),
        ])
      ]),
      transition('* => MisTurnosPage', [
        // Animation for "misTurnos" route
        query(':enter, :leave', 
          style({ position: 'fixed', width: '100%', height: '100%' }), 
          { optional: true }
        ),
        group([
          query(':enter', [
            style({ opacity: 0 }),
            animate('0.5s ease-in-out', 
              style({ opacity: 1 })
            )
          ], { optional: true }),
          query(':leave', [
            style({ opacity: 1 }),
            animate('0.5s ease-in-out', 
              style({ opacity: 0 })
            )
          ], { optional: true }),
        ])
      ]),
      transition('* <=> *', [
        // Default animation for other routes
        query(':enter, :leave', 
          style({ position: 'fixed', width: '100%', height: '100%' }), 
          { optional: true }
        ),
        group([
          query(':enter', [
            style({ transform: 'translateY(-100%)' }),
            animate('0.5s ease-in-out', 
              style({ transform: 'translateY(0%)' })
            )
          ], { optional: true }),
          query(':leave', [
            style({ transform: 'translateY(0%)' }),
            animate('0.5s ease-in-out', 
              style({ transform: 'translateY(100%)' })
            )
          ], { optional: true }),
        ])
      ]),
    ])
  ]
  
})
export class AppComponent {
  title = 'tp2Clinica';
  constructor(private router: Router) {

  }

  prepareRoute(outlet: RouterOutlet) {
    return outlet && outlet.activatedRouteData && outlet.activatedRouteData['animation'];
  }
}