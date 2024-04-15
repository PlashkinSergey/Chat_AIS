import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HotToastService } from '@ngneat/hot-toast';
import { UsersService } from 'src/app/services/users.service';
import { ProfileUser } from 'src/app/models/user-profile';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', Validators.required),
  });
  user$: Observable<ProfileUser | null> = this.userService.currentUser$; 
  constructor(
    private userService: UsersService,
    private router: Router,
    private toast: HotToastService
  ) {
    this.router.routeReuseStrategy.shouldReuseRoute = () => {
      return false;
    };
  }
  ngOnInit(): void {
    this.user$.subscribe((profile: ProfileUser | null) => {
      profile !== null ? this.router.navigate(["/home"]) : undefined;
    })
  }

  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }

  submit() {
    if (!this.loginForm.valid) {
      return;
    }
    const { email, password } = this.loginForm.value;
    this.userService.getUser(email, password).subscribe((user: ProfileUser) => {
      console.log(user);
      if (user == null) {
        this.toast.error("Такого пользователя не существует");
        return;
      }
      window.sessionStorage.setItem("user", JSON.stringify(user));
      this.toast.success("Успешная авторизация");
      window.location.reload();
    })
  }
}