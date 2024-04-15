import { Component, DoCheck, OnInit, isDevMode } from '@angular/core';
import { Router } from '@angular/router';
import { UsersService } from './services/users.service';
import { ProfileUser } from './models/user-profile';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, DoCheck {
  user$!: Observable<ProfileUser>;
  constructor(
    private router: Router,
    private usersService: UsersService
  ) {}
  ngDoCheck(): void {
    this.user$ = this.usersService.currentUser$;
  }
  ngOnInit(): void {
    this.user$ = this.usersService.currentUser$;
  }
  logout(): void {
    window.sessionStorage.clear();
    this.router.navigate(["/login"])
  }
}
