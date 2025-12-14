using API.Infrastructure.RequestDTOs.Shared;
using API.Infrastructure.ResponseDTOs.Shared;
using Common;
using Common.Entities;
using Common.Services.Interfaces;
using FluentValidation.AspNetCore;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Linq.Expressions;

namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BaseCrudController<E, IEService, ERequest, EGetRequest, EResponse, EGetResponse> : ControllerBase
        where E : BaseEntity, new()
        where IEService : IBaseService<E>
        where ERequest : class, new()
        where EGetRequest : BaseGetRequest, new()
        where EResponse : class, new()
        where EGetResponse : BaseGetResponse<EResponse>, new()
    {
        protected readonly IEService _entityService;

        public BaseCrudController(IEService entityService)
        {
            _entityService = entityService;
        }
        protected virtual void PopulateEntity(E entity, ERequest model, out string error) => error = null;
        protected virtual Expression<Func<E, bool>> GetFilter(EGetRequest model) => null;
        protected virtual void PopulageGetResponse(EGetRequest request, EGetResponse response)
        { }
        protected virtual EResponse ToResponse(E entity) => new EResponse();

        [HttpGet]
        public async Task<IActionResult> Get([FromQuery] EGetRequest model)
        {
            model.Pager = model.Pager ?? new PagerRequest();
            model.Pager.Page = model.Pager.Page <= 0
                                    ? 1
                                    : model.Pager.Page;
            model.Pager.PageSize = model.Pager.Page <= 0
                                        ? 10
                                        : model.Pager.PageSize;

            model.OrderBy ??= nameof(BaseEntity.Id);
            model.OrderBy = typeof(E).GetProperty(model.OrderBy) != null
                                ? model.OrderBy
                                : nameof(BaseEntity.Id);

            Expression<Func<E, bool>> filter = GetFilter(model);

            EGetResponse response = new EGetResponse();

            response.Pager = new PagerResponse();
            response.Pager.Page = model.Pager.Page;
            response.Pager.PageSize = model.Pager.PageSize;

            response.OrderBy = model.OrderBy;
            response.SortAsc = model.SortAsc;

            PopulageGetResponse(model, response);

            response.Pager.Count = _entityService.Count(filter);

            List<E> entities = await _entityService.GetAllAsync(
                                                       filter,
                                                       model.OrderBy,
                                                       model.SortAsc,
                                                       model.Pager.Page,
                                                       model.Pager.PageSize);

            if (entities is null || !entities.Any())
            {
                return NotFound($"No {typeof(E).Name} records found.");
            }

            List<EResponse> responseItems = entities
                .Select(e => ToResponse(e))
                .Where(dto => dto is not null)
                .ToList();

            if (!responseItems.Any())
            {
                return NotFound($"No {typeof(E).Name} records found.");
            }

            response.Items = responseItems;

            return Ok(ServiceResult<EGetResponse>.Success(response));
        }

        [HttpGet]
        [Route("{id}")]
        public async Task<IActionResult> Get([FromRoute] int id) 
        {
            E entity = await _entityService.GetByIdAsync(id);

            if (entity is null)
            {
                return NotFound($"{typeof(E).Name} not found.");
            }

            return Ok(ServiceResult<EResponse>.Success(ToResponse(entity)));

        }

        [HttpPost]
        public async Task<IActionResult> Post([FromBody] ERequest model)
        {
            E newEntity = new E();
            PopulateEntity(newEntity, model, out string error);

            if (!string.IsNullOrEmpty(error))
            {
                return BadRequest(ServiceResult<ERequest>.Failure(model,
                    new List<Error>
                    {
                        new Error()
                        {
                            Key = "Global",
                            Messages = new List<string>() { error }
                        }
                    }));
            }

            await _entityService.SaveAsync(newEntity);

            return Ok(ServiceResult<EResponse>.Success(ToResponse(newEntity)));
        }

        [HttpPut]
        [Route("{id}")]
        public async Task<IActionResult> Put([FromRoute] int id, [FromBody] ERequest model)
        {
            E entityForUpdate = await _entityService.GetByIdAsync(id);

            if (entityForUpdate is null)
            {
                return NotFound($"{typeof(E).Name} not found.");
            }

            PopulateEntity(entityForUpdate, model, out string error);

            if (!string.IsNullOrEmpty(error))
            {
                return BadRequest(ServiceResult<ERequest>.Failure(model,
                    new List<Error>
                    {
                        new Error()
                        {
                            Key = "Global",
                            Messages = new List<string>() { error }
                        }
                    }));
            }

            await _entityService.SaveAsync(entityForUpdate);

            return Ok(ServiceResult<EResponse>.Success(ToResponse(entityForUpdate)));
        }

        [HttpDelete]
        [Route("{id}")]
        public async Task<IActionResult> Delete([FromRoute] int id)
        {
            E entityForDelete = await _entityService.GetByIdAsync(id);

            if (entityForDelete is null)
            {
                return NotFound($"{typeof(E).Name}s not found.");
            }

            await _entityService.DeleteAsync(entityForDelete);

            return Ok(ServiceResult<EResponse>.Success(ToResponse(entityForDelete)));
        }
    }
}
