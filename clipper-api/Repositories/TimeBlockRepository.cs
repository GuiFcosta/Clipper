using Clipper.Api.Data;
using Clipper.Api.Interfaces;
using Clipper.Api.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace Clipper.Api.Repositories;

public class TimeBlockRepository(ApplicationDbContext context) : ITimeBlockRepository
{
    public async Task<IEnumerable<TimeBlock>> GetByBarberAsync(int barberId, DateTime? fromUtc = null, DateTime? toUtc = null)
    {
        var query = context.TimeBlocks
            .IgnoreQueryFilters()
            .Where(tb => tb.BarberId == barberId);

        if (fromUtc.HasValue)
            query = query.Where(tb => tb.EndDateTime >= fromUtc.Value);

        if (toUtc.HasValue)
            query = query.Where(tb => tb.StartDateTime <= toUtc.Value);

        return await query
            .OrderBy(tb => tb.StartDateTime)
            .ToListAsync();
    }

    public async Task<TimeBlock?> GetByIdAsync(int id)
    {
        return await context.TimeBlocks
            .IgnoreQueryFilters()
            .Include(tb => tb.Barber)
            .FirstOrDefaultAsync(tb => tb.Id == id);
    }

    public async Task<TimeBlock> CreateAsync(TimeBlock timeBlock)
    {
        context.TimeBlocks.Add(timeBlock);
        await context.SaveChangesAsync();
        return timeBlock;
    }

    public async Task DeleteAsync(TimeBlock timeBlock)
    {
        context.TimeBlocks.Remove(timeBlock);
        await context.SaveChangesAsync();
    }
}
