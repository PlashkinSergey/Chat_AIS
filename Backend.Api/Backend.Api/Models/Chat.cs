using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Api.Models;
public class Chat
{
    [Key]
    [Column("ChatId")]
    public int Id { get; set; }
    [Column("SenderUser")]
    public int SendUserId { get; set; }
    [Column("ReceiverUser")]
    public int RecUserId { get; set; }
}