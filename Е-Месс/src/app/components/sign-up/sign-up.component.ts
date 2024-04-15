import { Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { HotToastService } from '@ngneat/hot-toast';
import { ProfileUser } from 'src/app/models/user-profile';
import { UsersService } from 'src/app/services/users.service';

export function passwordsMatchValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;
    if (password && confirmPassword && password !== confirmPassword) {
      return {
        passwordsDontMatch: true,
      };
    }
    return null;
  };
}

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.scss'],
})
export class SignUpComponent implements OnInit {
  
  signUpForm!: FormGroup;

  constructor(
    private toast: HotToastService,
    private router: Router,
    private usersService: UsersService
  ) {}

  ngOnInit(): void {
    this.signUpForm = new FormGroup(
    {
      email: new FormControl('', [Validators.email, Validators.required]),
      login: new FormControl('', Validators.required),
      nickname: new FormControl('', Validators.required),
      password: new FormControl('', 
      [
        Validators.required, 
        Validators.minLength(6),
        Validators.pattern(/^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*\W)(?!.* ).{6,16}$/)
      ]),
      confirmPassword: new FormControl('', Validators.required),
    },
    { validators: passwordsMatchValidator() }
  );
  }

  get name() {
    return this.signUpForm.get('name');
  }

  get email() {
    return this.signUpForm.get('email');
  }

  get password() {
    return this.signUpForm.get('password');
  }

  get confirmPassword() {
    return this.signUpForm.get('confirmPassword');
  }

  submit() {
    if (!this.signUpForm.valid) return;
    const {email, login, nickname, password} = this.signUpForm.value;
    this.usersService.userByEmail(email).subscribe(
      (profile: ProfileUser | undefined) => {
        if (profile) {
          this.toast.error(`Email ${profile.email} уже зарегистрирован`)
          return
        } 
        let user: ProfileUser = new ProfileUser(email, login, nickname, password);
        this.usersService.addUser(user).subscribe((profile: ProfileUser) => {
            this.router.navigate(["/login"])
        });
      }
    );
  }
}