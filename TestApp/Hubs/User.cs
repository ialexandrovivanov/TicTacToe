using System;

namespace TestApp.Hubs
{
    public class User
    {
        public User(string username, string state, DateTime time)
        {
            this.Username = username;
            this.State = state;
            this.Time = time;
        }
        public string Username { get; set; }
        public string State { get; set; } 
        public DateTime Time { get; set; } 
    }
}
