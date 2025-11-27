using System;
using Common.Security;

namespace PasswordGenerator
{
    class Program
    {
        static void Main()
        {
            var (hash, salt) = PasswordHasher.HashPassword("adminpass");
            Console.WriteLine("HASH:");
            Console.WriteLine(hash);
            Console.WriteLine("SALT:");
            Console.WriteLine(salt);
        }
    }
}