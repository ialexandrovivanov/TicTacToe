using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;

namespace TestApp.Hubs
{
    public class PlayHub : Hub
    {
        public async Task SendMessage(string message)
        {
            await Clients.All.SendAsync("ReceiveMessage", message);
        }
    }
}
