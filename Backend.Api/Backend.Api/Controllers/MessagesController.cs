using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Api.Models;
using Microsoft.AspNetCore.SignalR;
using Backend.Api.Hubs;

namespace Backend.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MessagesController : Controller
    {
        private readonly ProjectDbContext _context;
        private readonly IHubContext<ChatHub, IHub> _hubContext;

        public MessagesController(ProjectDbContext context, IHubContext<ChatHub, IHub> hubContext)
        {
            _context = context;
            _hubContext = hubContext;
        }

        [HttpGet("{chatId:int}")]
        public async Task<List<Message>> GetMessangesChat(int? chatId)
        {
            if (chatId == null || _context.Messages == null)
            {
                return new List<Message>();
            }
            return await _context.Messages
                .Where((x) => x.ChatId == chatId)
                .OrderBy((x) => x.SendDate)
                .ToListAsync();
        }


        [HttpPost]
        [Route("AddMessange")]
        public async Task<Message?> AddMessangeOfChat(Message messange)
        {
            if (_context.Messages == null || messange == null)
            {
                return null;
            }
            if (ModelState.IsValid)
            {
                var lastMessange = await _context.Messages
                    .OrderByDescending((x) => x.Id)
                    .FirstOrDefaultAsync();
                messange.Id = lastMessange == null ? 1 : lastMessange.Id + 1;
                messange.SendDate = DateTime.Now.ToUniversalTime();
                _context.Messages.Add(messange);
                await _context.SaveChangesAsync();
                await _hubContext.Clients.All.BroadcastMessage();
                return messange;
            }
            return null;
        }


        private bool MessageExists(int id)
        {
            return (_context.Messages?.Any(e => e.Id == id)).GetValueOrDefault();
        }
    }
}
