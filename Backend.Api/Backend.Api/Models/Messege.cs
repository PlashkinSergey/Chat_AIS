using Microsoft.EntityFrameworkCore.Metadata.Internal;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Api.Models;
public class Message
{
    [Key]
    [Column("Id")]
    public int Id { get; set; }
    [Column("TextMessage")]
    public string Text { get; set; }
    [Column("ChatId")]
    public int ChatId { get; set; }
    [Column("SenderUserId")]
    public int UserId { get; set; }
    [Column("SenderDate")]
    public DateTime SendDate { get; set; }
}