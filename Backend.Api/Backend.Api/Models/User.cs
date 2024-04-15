using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Api.Models;
public class User
{
    [Key]
    [Column("UserID")]
    public int Id { get; set; }
    [Column("Email")]
    [Required]
    public string Email { get; set; }
    [Column("Login")]
    [Required]
    public string Login { get; set; }
    [Column("Nickname")]
    [Required]
    public string Nickname { get; set; }
    [Column("Password")]
    [Required]
    public string Password { get; set; }
    [Column("Description")]
    public string? Description { get; set; } = "";
}