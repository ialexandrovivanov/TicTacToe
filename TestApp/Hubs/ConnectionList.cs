using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using TestApp.Hubs;

public static class ConnectionList
{
    private static readonly ConcurrentDictionary<string, User> connected = new ConcurrentDictionary<string, User>();

    public static string Connected
    {
        get => connected.Count() > 0 ? GetUserState() : null;
    }

    private static string GetUserState() {

        var result = new List<string>();
        connected.Values.ToList().ForEach(u => result.Add(u.Username + $"/{u.State}"));
        return String.Join("\n", result);
    }
    public static void Disconect(string username)
    {
        connected.TryRemove(username, out _);
    }

    public static async Task<bool> UpdateUser(string data)
    {

        Task task = new Task(() => {

            var username = data.Split("/")[0];
            var state = data.Split("/")[1];

            if (!connected.Keys.Contains(username))
            {
                connected.TryAdd(username, new User(username, state, DateTime.Now));
            }

            if (connected.Keys.Contains(username))
            {
                connected[username].Time = DateTime.Now;
                connected[username].State = state;
            }

            foreach (var key in connected.Keys)
                if (connected[key].Time < DateTime.Now.AddSeconds(-2)) connected.TryRemove(key, out _);
        });

        task.Start(); task.Wait(); await Task.Delay(0);

        return true;
    }
}