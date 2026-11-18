using Clipper.Api.Models.Entities;

namespace Clipper.Api.Interfaces;

public interface ITimeBlockRepository
{
    Task<IEnumerable<TimeBlock>> GetByBarberAsync(int barberId, DateTime? fromUtc = null, DateTime? toUtc = null);
    Task<TimeBlock?> GetByIdAsync(int id);
    Task<TimeBlock> CreateAsync(TimeBlock timeBlock);
    Task DeleteAsync(TimeBlock timeBlock);
}
