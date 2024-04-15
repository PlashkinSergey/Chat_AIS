import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Chat, Message } from '../models/chat';
import { ProfileUser } from '../models/user-profile';
import { UsersService } from './users.service';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { HotToastService } from '@ngneat/hot-toast';

@Injectable({
  providedIn: 'root',
})
export class ChatsService {

  constructor(
    private usersService: UsersService,
    private http: HttpClient,
    private toast: HotToastService, 
  ) {}

  get myChats$(): Observable<Chat[]> {
    let current!: ProfileUser;
    this.usersService.currentUser$.subscribe((user: ProfileUser) => {
      current = user;
    })
    return this.http.get<Chat[]>(environment.urlControllers + `/Chats/${current.id}`).pipe(
      map((chats: Chat[]) => {
        for (let i = 0; i < chats.length; ++i) {
          this.getChatMessages$(chats[i].id).subscribe((messages: Message[]) => {
            if (messages.length === 0) return;
            const message: Message = messages[messages.length - 1];
            chats[i].lastMessage = message.text;
            chats[i].lastMessageDate = message.sentDate;
          })
          const id: number = chats[i].recUserId === current.id ? chats[i].sendUserId : chats[i].recUserId
          this.usersService.userById(id).subscribe((user: ProfileUser) => {
            chats[i].chatName = user.nickname;
          })
        }
        return chats;
      })
    );
  }
  
  createChat(otherUser: ProfileUser): Observable<number> {
    let current!: ProfileUser;
    this.usersService.currentUser$.subscribe((user: ProfileUser) => {
      current = user;
    })
    const chat: Chat = new Chat(current.id, otherUser.id);
    return this.http.post<number>(environment.urlControllers + "/Chats", chat);
  }

  isExistingChat(otherUserId: number): Observable<number | null> {
    return this.myChats$.pipe(
      map((chats: Chat[]) => {
        for (let chat of chats) {
          if (chat.recUserId === otherUserId || chat.sendUserId == otherUserId) {
            return chat.id;
          }
        }
        return null;
      })
    )
  }
  
  addChatMessage(chatId: number, textMessage: string): Observable<Message | null> {
    let current!: ProfileUser;
    this.usersService.currentUser$.subscribe((user: ProfileUser) => {
      current = user;
    })
    const message: Message = new Message(textMessage, chatId, current.id);
    return this.http.post<Message | null>(environment.urlControllers + `/Messages/AddMessange`, message);
  }

  getChatMessages$(chatId: number): Observable<Message[]> {
    return this.http.get<Message[]>(environment.urlControllers + `/Messages/${chatId}`);
  }

  getChatById(id: number): Observable<Chat> {
    return this.http.get<Chat>(environment.urlControllers + `/Chats/${id}`);
  }

  deleteChat(chat: Chat) : Observable<string> {
    return this.http.delete<string>(environment.urlControllers + `/Chats/${chat.id}`).pipe(
      this.toast.observe({
        success: 'Чат удалён',
        loading: "Удаление чата",
        error: ({ message }) => `${message}`,
      })
    )
  }
}
