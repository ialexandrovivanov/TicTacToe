using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;

namespace TestApp.Hubs
{
    public class MooveHub : Hub
    {
        public async Task SendMessage(string message)
        {
            await Clients.All.SendAsync("ReceiveMessage", message);
        }
    }
}
