namespace API.Infrastructure.ResponseDTOs.Shared
{
    public class BaseGetResponse<EResponse>
    {        
        public PagerResponse Pager { get; set; }
        public string OrderBy { get; set; }
        public bool SortAsc { get; set; }
        public List<EResponse> Items { get; set; } = new();
    }
}
