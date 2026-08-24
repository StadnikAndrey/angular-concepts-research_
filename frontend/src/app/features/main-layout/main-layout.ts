import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

import { menu } from './main-layout.types';

import { Notification } from '../../shared/components/notification/notification';

@Component({
  selector: 'app-main-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, Notification],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.scss',
})
export class MainLayout {
  menu: menu = [
    {
      name: 'Server (id 416)',
      path: '/server-configurator/416'
    },
    {
      name: 'Server (id 407)',
      path: '/server-configurator/407'
    },
    {
      name: 'Server (id 302)',
      path: '/server-configurator/302'
    },
    {
      name: 'Server (id 318)',
      path: '/server-configurator/318'
    },
    {
      name: 'Sign in',
      path: '/sign-in'
    },
     {
      name: 'Sign up',
      path: '/sign-up'
    }
  ]
}