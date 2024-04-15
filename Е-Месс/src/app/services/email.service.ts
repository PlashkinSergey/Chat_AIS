import { Injectable } from '@angular/core';
import { ProfileUser } from '../models/user-profile';

@Injectable({
  providedIn: 'root'
})
export class EmailService {

  constructor() { }

  sendEmail(user: ProfileUser) {
    
  }
}
