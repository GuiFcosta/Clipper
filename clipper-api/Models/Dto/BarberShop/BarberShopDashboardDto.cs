namespace Clipper.Api.Models.Dto.BarberShopDto;

public class BarberShopDashboardDto
{
    public int BarberShopId { get; set; }
    public DateOnly? FromDate { get; set; }
    public DateOnly? ToDate { get; set; }
    public int TotalAppointments { get; set; }
    public int CompletedAppointments { get; set; }
    public int ConfirmedAppointments { get; set; }
    public int PendingAppointments { get; set; }
    public int CancelledAppointments { get; set; }
    public double CancellationRatePercentage { get; set; }
    public decimal TotalRevenue { get; set; }
    public decimal EstimatedRevenue { get; set; }
    public double AverageRating { get; set; }
    public int TotalReviews { get; set; }
    public IReadOnlyList<BarberPerformanceDto> BarberPerformance { get; set; } = [];
    public IReadOnlyList<TopServiceDto> TopServices { get; set; } = [];
}

public class BarberPerformanceDto
{
    public int BarberId { get; set; }
    public string BarberName { get; set; } = string.Empty;
    public int CompletedAppointments { get; set; }
    public decimal Revenue { get; set; }
    public double AverageRating { get; set; }
}

public class TopServiceDto
{
    public int ServiceId { get; set; }
    public string ServiceName { get; set; } = string.Empty;
    public int BookingsCount { get; set; }
    public decimal Revenue { get; set; }
}
