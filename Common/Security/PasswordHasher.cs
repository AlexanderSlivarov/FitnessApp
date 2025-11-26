using System.Security.Cryptography;

namespace Common.Security
{
    public static class PasswordHasher
    {
        private const int SaltSize = 16;     
        private const int KeySize = 32;       
        private const int Iterations = 100000;
        public static (string Hash, string Salt) HashPassword(string password)
        {
            if (string.IsNullOrWhiteSpace(password))
            {
                throw new ArgumentException("Password cannot be empty.", nameof(password));
            }               
            
            byte[] saltBytes = new byte[SaltSize];
            RandomNumberGenerator.Fill(saltBytes);
           
            var pbkdf2 = new Rfc2898DeriveBytes(
                password,
                saltBytes,
                Iterations,
                HashAlgorithmName.SHA512);

            byte[] keyBytes = pbkdf2.GetBytes(KeySize);

            string hash = Convert.ToBase64String(keyBytes);
            string salt = Convert.ToBase64String(saltBytes);

            return (hash, salt);
        }
        public static bool VerifyPassword(string password, string storedHash, string storedSalt)
        {
            if (string.IsNullOrWhiteSpace(password))
            {
                return false;
            }                
            if (string.IsNullOrWhiteSpace(storedHash) || string.IsNullOrWhiteSpace(storedSalt))
            {
                return false;
            }

            byte[] saltBytes = Convert.FromBase64String(storedSalt);

            var pbkdf2 = new Rfc2898DeriveBytes(
                password,
                saltBytes,
                Iterations,
                HashAlgorithmName.SHA512);

            byte[] keyBytes = pbkdf2.GetBytes(KeySize);
            string computedHash = Convert.ToBase64String(keyBytes);
        
            return computedHash == storedHash;
        }
    }
}
