using Clipper.Api.Models.Enums;

namespace Clipper.Api.Models.Dto.Appointment;

/// <summary>
/// DTO para leitura de appointments. Evita ciclos circulares na serialização JSON.
/// </summary>
public class AppointmentDto
{
    /// <summary>
    /// ID único da consulta
    /// </summary>
    public int Id { get; set; }

    /// <summary>
    /// Hora de início da consulta
    /// </summary>
    public string StartTime { get; set; }

    /// <summary>
    /// Hora de fim da consulta (calculada com base na duração do serviço)
    /// </summary>
    public DateTime EndTime { get; set; }

    /// <summary>
    /// Status da consulta
    /// </summary>
    public AppointmentStatus Status { get; set; }

    /// <summary>
    /// Notas adicionais sobre a consulta
    /// </summary>
    public string? Notes { get; set; }

    #region Foreign Keys & Basic Info

    /// <summary>
    /// ID do cliente
    /// </summary>
    public int CustomerId { get; set; }

    /// <summary>
    /// Nome do cliente
    /// </summary>
    public string? CustomerName { get; set; }

    /// <summary>
    /// Email do cliente
    /// </summary>
    public string? CustomerEmail { get; set; }

    /// <summary>
    /// ID do barbeiro
    /// </summary>
    public int BarberId { get; set; }

    /// <summary>
    /// Nome do barbeiro
    /// </summary>
    public string? BarberName { get; set; }

    /// <summary>
    /// ID da barbearia
    /// </summary>
    public int BarberShopId { get; set; }

    /// <summary>
    /// Nome da barbearia
    /// </summary>
    public string? BarberShopName { get; set; }

    /// <summary>
    /// ID do serviço
    /// </summary>
    public int ServiceId { get; set; }

    /// <summary>
    /// Nome do serviço
    /// </summary>
    public string? ServiceName { get; set; }

    /// <summary>
    /// Duração do serviço em minutos
    /// </summary>
    public int ServiceDuration { get; set; }

    /// <summary>
    /// Preço do serviço
    /// </summary>
    public decimal? ServicePrice { get; set; }

    #endregion
}

