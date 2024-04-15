using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Api.Models;
using Backend.Api.Hash;
using System.Data;
using Backend.Api.Hubs;
using Microsoft.AspNetCore.SignalR;

namespace Backend.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : Controller
    {
        private readonly ProjectDbContext _context;
        private readonly IHubContext<ChatHub, IHub> _hubContext;

        public UsersController(ProjectDbContext context, IHubContext<ChatHub, IHub> hubContext)
        {
            _context = context;
            _hubContext = hubContext;
        }
        [HttpGet]
        public async Task<List<User>> GetAll()
        {
            return _context.Users != null ?
                await _context.Users.ToListAsync() : new List<User>();
        }
        [HttpGet("{id:int}")]
        public async Task<User?> GetUserById(int id)
        {
            if (id == 0 || _context.Users == null)
            {
                return null;
            }
            User? user = await _context.Users.FindAsync(id);
            return user == null ? null : user;
        }
        
        [HttpGet("{email}")]
        public async Task<User?> GetUserByEmail(string email)
        {
            User? user = await _context.Users.FirstOrDefaultAsync(x => x.Email == email);
            return user == null ? null : user; ;
        }
        [HttpGet("{email}/{password}")]
        public async Task<User?> GetUserByEmail(string email, string password)
        {
            string hashPassword = Hasher.HashPassword(password);
            User? user = await _context.Users.FirstOrDefaultAsync((x) => x.Email == email && x.Password == hashPassword);
            return user;
        }
        [HttpPost]
        [Route("Register")]
        public async Task<User?> CreateUser(User user)
        {
            if (ModelState.IsValid)
            {
                var lastUser = await _context.Users
                    .OrderByDescending((x) => x.Id)
                    .FirstOrDefaultAsync();
                user.Id = lastUser != null ? lastUser.Id + 1 : 1;
                user.Password = Hasher.HashPassword(user.Password);
                _context.Users.Add(user);
                await _context.SaveChangesAsync();
                await _hubContext.Clients.All.BroadcastMessage();
                return user;
            }
            return null;
        }
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateUser(int id, [Bind("Id,Email,Login,Nickname,Password,Description")] User user)
        {
            if (id != user.Id)
            {
                return BadRequest();
            }
            if (ModelState.IsValid)
            {
                try
                {
                    user.Password = Hasher.HashPassword(user.Password);
                    _context.Users.Update(user);
                    await _context.SaveChangesAsync();
                    await _hubContext.Clients.All.BroadcastMessage();
                }
                catch (DBConcurrencyException)
                {
                    if (!UserExists(user.Id))
                    {
                        return NotFound();
                    }
                    else { throw; }
                }
                return Ok(user);
            }
            return Ok(user);
        }
        private bool UserExists(int id)
        {
            return (_context.Users?.Any(e => e.Id == id)).GetValueOrDefault();
        }
    }
}
