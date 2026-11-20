export interface CheckoutServiceItem {
  id: string;
  name: string;
  durationMin: number;
  price: number;
}

export interface CheckoutBookingState {
  shopId: string;
  shopName: string;
  shopAddress: string;
  barberName: string;
  barberInitials: string;
  barberBench: string;
  barberRating?: string;
  barberCutsCount?: number;
  dateLabel: string;
  startTime: string;
  endTime: string;
  totalDuration: number;
  totalPrice: number;
  services: CheckoutServiceItem[];
}
