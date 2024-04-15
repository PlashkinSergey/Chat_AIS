using System.Security.Cryptography;
using System.Text;

namespace Backend.Api.Hash
{
    public class Hasher
    {
        public static string HashPassword(string password)
        {
            MD5 md5 = MD5.Create();
            byte[] bytes = Encoding.ASCII.GetBytes(password);
            byte[] hashs = md5.ComputeHash(bytes);
            StringBuilder sb = new StringBuilder();
            foreach (byte hash in hashs) 
            {
                sb.Append(hash.ToString("X2"));
            }
            return sb.ToString();
        }
    }
}
