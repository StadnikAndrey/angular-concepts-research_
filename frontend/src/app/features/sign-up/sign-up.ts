import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormGroup, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';

import { SignUpApi } from './data-access/sign-up-api';

type SignUpForm = {
  login: FormControl<string | null>;
  password: FormControl<string | null>;
}

@Component({
  selector: 'app-sign-up',
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './sign-up.html',
  styleUrl: './sign-up.scss',
})
export class SignUp {
  private router = inject(Router);
  private apiSignUp = inject(SignUpApi);

  signUpForm = new FormGroup<SignUpForm>({
    login: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6), Validators.pattern(/[a-zA-Z0-9-_]{6, 20}/i)]),
  });

  get login() {
    return this.signUpForm.controls.login;
  }

  signUp(e: any) {
    console.log(this.signUpForm.status);
    let formData = this.signUpForm.value;
    this.apiSignUp.signUp(formData).subscribe({
      next: (data) => {
        if (data.ok == true) {
          // this.router.navigate(['/sign-in']);
          // console.log('ok');
        } else {
          // console.log('ok: false');
        }

        // console.log(data);
      },
      error: (err) => {
        console.log(err.message);
        // console.log('Sign up error!');
      }
    });
  }
}
