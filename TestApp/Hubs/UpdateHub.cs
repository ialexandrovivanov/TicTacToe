using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;

namespace TestApp.Hubs
{
    public class UpdateHub : Hub
    {
        public async Task SendMessage(string username)
        {
            await ConnectionList.UpdateUser(username);
        }
    }
}
