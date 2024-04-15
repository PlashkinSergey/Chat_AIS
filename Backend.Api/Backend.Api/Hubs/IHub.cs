namespace Backend.Api.Hubs
{
    public interface IHub
    {
        Task BroadcastMessage();
    }
}
