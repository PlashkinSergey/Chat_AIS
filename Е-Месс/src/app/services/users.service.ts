import { Injectable } from '@angular/core';
import { Observable, concatMap, from, map, of, take } from 'rxjs';
import { ProfileUser } from '../models/user-profile';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { HotToastService } from '@ngneat/hot-toast';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  constructor(
    private http: HttpClient, 
    private toast: HotToastService, 
  ) {}

  get currentUser$(): Observable<ProfileUser> {
    return of<ProfileUser>(JSON.parse(window.sessionStorage.getItem("user")!)).pipe(
      take(1), 
    )
  }
  get allUsers$(): Observable<ProfileUser[]> { 
    return this.http.get<ProfileUser[]>(environment.urlControllers + "/Users");
  }
  updateUser(user: ProfileUser): Observable<ProfileUser> {
    return this.http.put<ProfileUser>(environment.urlControllers + `/Users/${user.id}`, user);
  }
  userByEmail(email: string): Observable<ProfileUser | undefined> {
    return this.http.get<ProfileUser>(environment.urlControllers + "/Users/" + email);
  }
  userById(id: number): Observable<ProfileUser> {
    return this.http.get<ProfileUser>(environment.urlControllers +"/Users/"+ id);
  }
  addUser(user: ProfileUser): Observable<ProfileUser> {
    return this.http.post<ProfileUser>(environment.urlControllers +"/Users/Register", user).pipe(
      this.toast.observe({
        success: 'Успешная регистрация',
        loading: "Регистрация",
        error: ({ message }) => `${message}`,
      })
    );
  }
  getUser(email: string, password: string): Observable<ProfileUser> {
    return this.http.get<ProfileUser>(environment.urlControllers + "/Users/" + `${email}/${password}`);
  }
}
