using Common;
using Microsoft.AspNetCore.Mvc.ModelBinding;

namespace API.Services
{
    public class ServiceResultExtentions<T> where T: class, new()
    {
        public static ServiceResult<T> Failure(T data, ModelStateDictionary errors)
        {
            List<Error> errorsList = new List<Error>();
            foreach (var kvp in errors )
            {
                if (kvp.Value.Errors.Count > 0)
                {
                    errorsList.Add(new Error
                    {
                        Key = kvp.Key,
                        Messages = kvp.Value.Errors
                                    .Select(e => e.ErrorMessage)
                                    .ToList()
                    });
                }
            }

            return new ServiceResult<T>
            {
                isSuccess = false,
                Data = data,
                Errors = errorsList
            };
        }
    }
}
