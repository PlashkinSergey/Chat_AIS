import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import {
  combineLatest,
  map,
  Observable,
  of,
  startWith,
  switchMap,
  take,
  tap,
} from 'rxjs';
import { Chat, Message } from 'src/app/models/chat';
import { ProfileUser } from 'src/app/models/user-profile';
import { ChatsService } from 'src/app/services/chats.service';
import { UsersService } from 'src/app/services/users.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  constructor(
    private usersService: UsersService,
    private chatsService: ChatsService,
    private router: Router
  ) {}
  ngOnInit(): void {
    this.user$.subscribe((user: ProfileUser) =>{
      if (!user) {
        this.router.navigate(['/login']);
      }
    })
    const connection: HubConnection = new HubConnectionBuilder()
      .withUrl("https://localhost:7098/chat").build()
    connection.start().then(() => {}).catch((error) => {
        console.log(error.toString());})
    connection.on("BroadcastMessage", () => this.updateData());
    this.messages$ = this.chatListControl.valueChanges.pipe(
      map((value) => +value[0]),
      switchMap((chatId: number) => this.chatsService.getChatMessages$(chatId)),
      tap(() => {
        this.scrollToBottom();
      })
    );

  }
  @ViewChild('endOfChat')
  endOfChat!: ElementRef;

  user$: Observable<ProfileUser> = this.usersService.currentUser$;
  myChats$: Observable<Chat[]> = this.chatsService.myChats$;

  searchControl = new FormControl('');
  messageControl = new FormControl('');
  chatListControl = new FormControl('');

  messages$: Observable<Message[]> | undefined;
  otherUsers$: Observable<ProfileUser[]> = combineLatest([this.usersService.allUsers$, this.user$]).pipe(
    map(([users, user]) => {
      return users.filter((u: ProfileUser) => u.id !== user.id)
    })
  )
  
  users$: Observable<ProfileUser[]> = combineLatest([
    this.otherUsers$,
    this.searchControl.valueChanges.pipe(startWith('')),
  ]).pipe(
    map(([users, searchString]) => {
      return users.filter((u) =>
        u.nickname.toLowerCase().includes(String(searchString).toLowerCase())
      );
    })
  );

 selectedChat$ = combineLatest([
    this.chatListControl.valueChanges,
    this.myChats$,
  ]).pipe(map(([value, chats]) => {
    return chats.find((c) => c.id === +value[0])
  }));

  createChat(user: ProfileUser) {
    this.chatsService
      .isExistingChat(user.id)
      .pipe(
        switchMap((chatId: number | null) => {
          if (!chatId) {
            return this.chatsService.createChat(user);
          } else {
            return of(chatId).pipe(take(1));
          }
        })
      )
      .subscribe((chatId) => {
        this.chatListControl.setValue([chatId]);
        this.selectedChat$ = this.chatsService.myChats$.pipe(
          map((chats: Chat[]) => chats.find((c: Chat) => c.id === chatId))
        )
      });
  }
  sendMessage(): void {
    const message: string = this.messageControl.value;
    const selectedChatId: number = this.chatListControl.value[0];
    if (message && selectedChatId) {
      this.chatsService
        .addChatMessage(selectedChatId, message)
        .subscribe((mes: Message | null) => {
          if (mes === null) return;
          this.messages$ = this.chatsService.getChatMessages$(selectedChatId).pipe(
            tap(() => this.scrollToBottom())
          )
        });
      this.messageControl.setValue('');
    }
  }

  scrollToBottom() {
    setTimeout(() => {
      if (this.endOfChat) {
        this.endOfChat.nativeElement.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  }

  private updateData(): void {
    this.user$ = this.usersService.currentUser$;
    this.otherUsers$ = combineLatest([this.usersService.allUsers$, this.user$]).pipe(
      map(([users, user]) => {
        return users.filter((u: ProfileUser) => u.id !== user.id)
      })
    )
    const selectedChatId: number = this.chatListControl.value[0];
    this.myChats$ = this.chatsService.myChats$;
    this.selectedChat$ = this.myChats$.pipe(
      map((chats: Chat[]) => chats.find((chat: Chat) => chat.id === selectedChatId))
    )
    if (selectedChatId !== undefined) {
      this.messages$ = this.chatsService.getChatMessages$(selectedChatId).pipe(
        tap(() => this.scrollToBottom())
      )
    }
  }

  activeChat(chat: Chat) : void {
    if (chat === null) return;
    this.selectedChat$ = of(chat).pipe(
      take(1)
    )
    this.messages$ = this.chatsService.getChatMessages$(chat.id).pipe(
      tap(() => this.scrollToBottom())
    );
  }

  delChat(chat: Chat): void {
    if (confirm(`Удалить чат с ${chat.chatName}?`)) {
      this.chatsService.deleteChat(chat).subscribe((request: string) => {});
    }
  }
}