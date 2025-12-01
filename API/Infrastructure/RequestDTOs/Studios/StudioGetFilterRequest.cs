namespace API.Infrastructure.RequestDTOs.Studios
{
    public class StudioGetFilterRequest
    {
        public string? Name { get; set; }
        public string? Location { get; set; }
        public int? Capacity { get; set; }
    }
}
