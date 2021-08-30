using Microsoft.AspNetCore.Hosting;

[assembly: HostingStartup(typeof(TestApp.Areas.Identity.IdentityHostingStartup))]
namespace TestApp.Areas.Identity
{
    public class IdentityHostingStartup : IHostingStartup
    {
        public void Configure(IWebHostBuilder builder)
        {
            builder.ConfigureServices((context, services) => {
            });
        }
    }
}