import { Routes } from '@angular/router';

import { MainLayout } from './features/main-layout/main-layout';
import { About } from './features/about/about';
import { ServerConfigurator } from './features/server-configurator/server-configurator';
import { NotFound } from './features/not-found/not-found';
import { SignIn } from './features/sign-in/sign-in';
import { SignUp } from './features/sign-up/sign-up';

export const routes: Routes = [
    {
        path: '',
        component: MainLayout,
        children: [
            {
                path: '',
                component: About,
                title: 'Angular concepts research'
            },
            {
                path: 'server-configurator/:id',
                component: ServerConfigurator,
                title: 'Server configurator | Angular concepts research'
            }
        ]
    },
    {
        path: 'sign-in',
        component: SignIn,
        title: 'Sign in | Angular concepts research'
    },
    {
        path: 'sign-up',
        component: SignUp,
        title: 'Sign up | Angular concepts research'
    },
    {
        path: '**',
        component: NotFound,
        title: '404 | Angular concepts research'
    }
];
