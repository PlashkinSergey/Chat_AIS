using Backend.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend.Api.Controllers
{
    public class ProjectDbContext : DbContext
    {
        public ProjectDbContext(DbContextOptions<ProjectDbContext> optinal): base(optinal) { }
        public DbSet<User> Users { get; set; }
        public DbSet<Chat> Chats { get; set; }
        public DbSet<Message> Messages { get; set; }

    }
}
