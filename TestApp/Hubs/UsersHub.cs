using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;

namespace TestApp.Hubs
{
    public class UsersHub : Hub
    {
        public async Task SendMessage()
        {
            await Clients.All.SendAsync("ReceiveMessage", ConnectionList.Connected);
        }
    }
}
