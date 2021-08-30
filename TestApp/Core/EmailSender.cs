using Microsoft.AspNetCore.Identity.UI.Services;
using Microsoft.Extensions.Configuration;
using SendGrid.Helpers.Mail;
using System;
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

        public async Task SendEmailAsync(string email, string subject, string htmlMessage)
        {
            var apiKey = this.configuration["SendGridApiKey"];
            var client = new SendGrid.SendGridClient(apiKey);
            var from = new EmailAddress("ialexandrovivanov@gmail.com", "Tic tac toe support team");
            var to = new EmailAddress(email, "Dear user");
            var msg = MailHelper.CreateSingleEmail(from, to, subject, "", htmlMessage);
            var response = await client.SendEmailAsync(msg);
            Console.WriteLine("email sent successfully -> " + response.IsSuccessStatusCode);
        }
    }
}
