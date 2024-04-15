import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HotToastService } from '@ngneat/hot-toast';
import { ProfileUser } from 'src/app/models/user-profile';
import { resolve } from 'dns';
import { UsersService } from 'src/app/services/users.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {

  resetForm!: FormGroup;

  constructor(
    private router: Router,
    private usersService: UsersService,
    private toast: HotToastService,
  ) { }

  ngOnInit(): void {
    this.resetForm = new FormGroup({
      email: new FormControl('', [Validators.email, Validators.required]),
      password: new FormControl('', 
      [
        Validators.required,
        Validators.minLength(6), 
        Validators.pattern(/^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*\W)(?!.* ).{6,16}$/)
      ]),
      repPassword: new FormControl('', [Validators.required], [this.correctRepeatPassword.bind(this)])
    })
  }

  submit(): void {
    if (this.resetForm.invalid) return;
    this.usersService.userByEmail(this.resetForm.value.email).subscribe((user: ProfileUser | undefined) => {
      if (user) {
        const code: string = this.generateCode();
        let userCode: string | null = prompt(`Введите код ${code}`);
        if (code !== userCode) {
          this.toast.error("Код неверный, повторите попытку");
          return;
        }
        user.password = this.resetForm.value.password;
        this.usersService.updateUser(user).pipe(
          this.toast.observe({
            success: 'Пароль изменён',
            loading: "Смена пароля",
            error: ({ message }) => `${message}`,
          })
        ).subscribe((user: ProfileUser) => {
          this.router.navigate(["/login"])
        })
      } else {
        this.toast.error("Такого пользователя не существует");
      }
    })
  }

  correctRepeatPassword(control: AbstractControl): Promise<any> {
    return new Promise((resolve, reject) => {
      if (this.resetForm.value.password !== control.value) {
         resolve({noCorrectPassword: true});
      } else {
        resolve(null);
      }
    })
  }

  private generateCode(): string {
    let result: string = "";
    const numbers: string = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ" + "ABCDEFGHIJKLMNOPQRSTUVWXYZ".toLowerCase();
    for (let i = 0; i < 4; ++i) {
      const index = Math.ceil(Math.random() * numbers.length);
      result += numbers[index - 1];
    }
    return result;
  }

}
