namespace API.Infrastructure.ResponseDTOs.Shared
{
    public class BaseGetResponse<E, TFilter>
    {
        public List<E> Items { get; set; }
        public PagerResponse Pager { get; set; }
        public string OrderBy { get; set; }
        public bool SortAsc { get; set; }
        public TFilter Filter { get; set; }
    }
}
