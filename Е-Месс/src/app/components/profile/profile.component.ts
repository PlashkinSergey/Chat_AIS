import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HotToastService } from '@ngneat/hot-toast';
import { UntilDestroy } from '@ngneat/until-destroy';
import { Observable } from 'rxjs';
import { ProfileUser } from 'src/app/models/user-profile';
import { ImageUploadService } from 'src/app/services/image-upload.service';
import { UsersService } from 'src/app/services/users.service';

@UntilDestroy()
@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {
  user$: Observable<ProfileUser> = this.usersService.currentUser$;

  profileForm = new FormGroup({
    nickname: new FormControl('', Validators.required),
    login: new FormControl('', Validators.required),
    description: new FormControl(''),
  });

  constructor(
    private toast: HotToastService,
    private usersService: UsersService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.usersService.currentUser$
      .subscribe((user) => {
        this.profileForm.patchValue({...user});
      });
  }

  uploadImage(event: any, user: ProfileUser): void {}

  saveProfile(): void {
    if (!this.profileForm.valid) return;
    const profileData = this.profileForm.value;
    let user!: ProfileUser;
    this.user$.subscribe((curUser: ProfileUser) => user = curUser);
    user.nickname = profileData.nickname;
    user.login = profileData.login;
    user.description = profileData.description;
    this.usersService
      .updateUser(user)
      .pipe(
        this.toast.observe({
          loading: 'Обновление данных...',
          success: 'Данные обновлены',
          error: 'Ошибка при обновлений',
        })
      )
      .subscribe((current: ProfileUser) => {
        window.sessionStorage.clear();
        window.sessionStorage.setItem("user", JSON.stringify(current));
        this.router.navigate(["/home"])
      });
  }
}
