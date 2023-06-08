/// <reference types="@angular/localize" />

import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';

// Configurar CORS
const corsHeaders: { [key: string]: string } = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept, Authorization'
};
Object.keys(corsHeaders).forEach(key => {
  document.head.append(key, corsHeaders[key]);
});

enableProdMode();

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));
