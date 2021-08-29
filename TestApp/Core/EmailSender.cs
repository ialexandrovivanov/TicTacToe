using Microsoft.AspNetCore.Identity.UI.Services;
using Microsoft.Extensions.Configuration;
using System.Net;
using System.Net.Mail;
using System.Threading.Tasks;

namespace TestApp.Core
{
    public class EmailSender : IEmailSender
    {
        private IConfiguration configuration;
        public EmailSender(IConfiguration configuration)
        {
            this.configuration = configuration;
        }

        public Task SendEmailAsync(string email, string subject, string htmlMessage)
        {
            using (var message = new MailMessage())
            {
                message.To.Add(new MailAddress(email, "Dear player"));
                message.From = new MailAddress("ialexandrovivanov@gmail.com", "Tic tac toe support team");
                message.Subject = subject;
                message.Body = htmlMessage;
                message.IsBodyHtml = true;

                var key = this.configuration["SendGridApiKey:Key"];

                using (var client = new SmtpClient("smtp.sendgrid.net"))
                {
                    client.Port = 587;
                    client.EnableSsl = false;
                    client.Credentials = new NetworkCredential("apikey", key);
                    client.Send(message);
                }
            }

            return Task.CompletedTask;
        }
    }
}
