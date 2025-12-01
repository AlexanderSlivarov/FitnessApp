using API.Infrastructure.ResponseDTOs.Studios;
using Common.Entities;

namespace API.Infrastructure.Mappers
{
    public static class StudioMapper
    {
        public static StudioResponse ToResponse(Studio s)
        {
            if (s == null) return null;

            return new StudioResponse
            {
                Id = s.Id,
                Name = s.Name,
                Location = s.Location,
                Capacity = s.Capacity
            };
        }

        public static List<StudioResponse> ToResponseList(List<Studio> list)
        {
            return list.Select(ToResponse).ToList();
        }
    }
}
