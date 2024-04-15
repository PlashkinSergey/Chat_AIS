export class Chat {
  constructor(
    public sendUserId: number,
    public recUserId: number,
  ) {}
  id: number = 1;
  // Для отображения на странице
  lastMessage?: string;
  lastMessageDate?: string;   
  chatPic?: string;
  chatName?: string;
}

export class Message {
  constructor(
    public text: string,
    public chatId: number,
    public userId: number,  
  ) {}
  id: number = 1;
  sentDate: string = "";
}
