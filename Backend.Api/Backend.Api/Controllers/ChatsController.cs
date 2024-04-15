using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Api.Models;
using Backend.Api.Hubs;
using Microsoft.AspNetCore.SignalR;
using System.Collections.Generic;

namespace Backend.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ChatsController : Controller
    {
        private readonly ProjectDbContext _context;
        private readonly IHubContext<ChatHub, IHub> _hubContext;

        public ChatsController(ProjectDbContext context, IHubContext<ChatHub, IHub> hubContext)
        {
            _context = context;
            _hubContext = hubContext;
        }

        [HttpGet]
        public async Task<List<Chat>> GetChats()
        {
            return _context.Chats != null ? await _context.Chats.ToListAsync() : new List<Chat>();
        }

        [HttpGet("{userId:int}")]
        public async Task<List<Chat>> GetChatByUserId(int? userId)
        {
            if (userId == 0 || _context.Chats == null)
            {
                return new List<Chat>();
            }
            List<Chat> chats = await _context.Chats
                .Where((x) => x.SendUserId == userId || (x.SendUserId != userId && x.RecUserId == userId))
                .ToListAsync();
            return chats;
        }
        [HttpPost]
        public async Task<int> CreateChat(Chat chat)
        {
            if (chat == null || _context.Chats == null)
            {
                return 0;
            }
            if (ModelState.IsValid)
            {
                var lastChat = await _context.Chats
                    .OrderByDescending((x) => x.Id)
                    .FirstOrDefaultAsync();
                chat.Id = lastChat == null ? 1 : lastChat.Id + 1;
                _context.Chats.Add(chat);
                await _context.SaveChangesAsync();
                await _hubContext.Clients.All.BroadcastMessage();
                return chat.Id;
            }
            return 0;
        }
        [HttpDelete("{chatId:int}")]
        public async Task<IActionResult> DeleteChat(int chatId)
        {
            if (_context.Chats == null)
            {
                return NotFound(0); 
            }
            if (ModelState.IsValid)
            {
                await _context.Messages.Where((mes) => chatId == mes.ChatId).ExecuteDeleteAsync();
                await _context.Chats.Where((chat) => chatId == chat.Id).ExecuteDeleteAsync();
                await _context.SaveChangesAsync();
                await _hubContext.Clients.All.BroadcastMessage();
                return Ok(1);
            }
            return BadRequest(0);
        }
        private bool ChatExists(int id)
        {
          return (_context.Chats?.Any(e => e.Id == id)).GetValueOrDefault();
        }
    }
}
