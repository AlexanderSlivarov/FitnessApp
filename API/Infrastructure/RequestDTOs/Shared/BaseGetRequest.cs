namespace API.Infrastructure.RequestDTOs.Shared
{
    public class BaseGetRequest
    {
        public PagerRequest Pager { get; set; }
        public string OrderBy { get; set; }
        public bool SortAsc { get; set; }        
    }
}
