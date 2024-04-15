export class ProfileUser {
  id: number = 1;
  email: string;
  login: string;
  nickname: string;
  password: string;
  description: string = "#";
  constructor(email: string, login: string, nickname:string, password: string) {
    this.email = email;
    this.login = login;
    this.password = password;
    this.nickname = nickname;
  }
  photoUrl?: string
}
