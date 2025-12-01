using API.Infrastructure.ResponseDTOs.Activity;
using Common.Entities;

namespace API.Infrastructure.Mappers
{
    public static class ActivityMapper
    {
        public static ActivityResponse ToResponse(Activity a)
        {
            if (a == null) return null;

            return new ActivityResponse
            {
                Id = a.Id,
                Name = a.Name,
                Description = a.Description
            };
        }

        public static List<ActivityResponse> ToResponseList(List<Activity> list)
        {
            return list.Select(ToResponse).ToList();
        }
    }
}
