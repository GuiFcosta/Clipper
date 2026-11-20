export interface BarbershopService {
  id: string;
  name: string;
  description: string;
  durationMin: number;
  price: number;
  badge?: string;
  defaultSelected?: boolean;
  includesServiceIds?: string[];
}

export interface BarbershopBarber {
  id: string;
  bench: string;
  name: string;
  initials: string;
  rating?: string;
  cutsCount?: number;
  tags: string[];
  nextAvailable: string;
  isFastestMatch?: boolean;
  description?: string;
}

export interface TimeSlotOption {
  time: string;
  status: 'available' | 'occupied' | 'last';
  label?: string;
}

export interface BarbershopDetail {
  id: string;
  hubCode: string;
  cityLabel: string;
  name: string;
  address: string;
  distanceLabel: string;
  availableBenches: number;
  totalBenches: number;
  rating: string;
  reviewsCount: string;
  estimatedCheckin: string;
  openUntil: string;
  description: string;
  amenities: string[];
  heroImageUrl: string;
  heroImageAlt: string;
  services: BarbershopService[];
  barbers: BarbershopBarber[];
  dates: { id: string; label: string }[];
  slotsByBarber: Record<string, TimeSlotOption[]>;
}

const DEFAULT_SERVICES: BarbershopService[] = [
  {
    id: 'corte-fade',
    name: 'Corte Clássico / Fade de Precisão',
    description:
      'Fade milimétrico, lavagem com shampoo refrescante e finalização com pomada matte italiana.',
    durationMin: 30,
    price: 85,
    badge: 'MAIS PEDIDO',
    defaultSelected: true,
  },
  {
    id: 'barboterapia',
    name: 'Barboterapia & Toalha Quente',
    description:
      'Vapor de ozônio, toalha quente japonesa, massagem facial e navalhete descartável estéril.',
    durationMin: 20,
    price: 55,
    defaultSelected: true,
  },
  {
    id: 'acabamento',
    name: 'Acabamento / Pezinho & Sobrancelha',
    description:
      'Alinhamento milimétrico de contorno de nuca a navalha e limpeza de sobrancelha na pinça.',
    durationMin: 15,
    price: 35,
  },
  {
    id: 'combo-executivo',
    name: 'Combo Executivo Completo',
    description:
      'Corte + Barba + Lavagem profunda com massagem craniana + Visagismo estrutural 3D.',
    durationMin: 60,
    price: 150,
    badge: 'PACOTE COMPLETO',
    includesServiceIds: ['corte-fade', 'barboterapia', 'acabamento'],
  },
];

const DEFAULT_DATES = [
  { id: '2026-11-19', label: 'HOJE • QUI 19 NOV' },
  { id: '2026-11-20', label: 'AMANHÃ • SEX 20 NOV' },
  { id: '2026-11-21', label: 'SÁB 21 NOV' },
  { id: '2026-11-22', label: 'DOM 22 NOV' },
  { id: '2026-11-23', label: 'SEG 23 NOV' },
];

const DEFAULT_BARBERS: BarbershopBarber[] = [
  {
    id: 'diego-r',
    bench: 'BANCADA #01',
    name: 'Mestre Diego R.',
    initials: 'DR',
    rating: '4.99',
    cutsCount: 240,
    tags: ['Skin Fade', 'Visagismo 3D'],
    nextAvailable: 'LIVRE ÀS 15:15',
  },
  {
    id: 'lucas-prado',
    bench: 'BANCADA #02',
    name: 'Lucas "Navalha" Prado',
    initials: 'LP',
    rating: '4.95',
    cutsCount: 180,
    tags: ['Fade & Freestyle', 'Mullet'],
    nextAvailable: 'LIVRE ÀS 15:45',
  },
  {
    id: 'alex-silva',
    bench: 'BANCADA #03',
    name: 'Alex Silva',
    initials: 'AS',
    rating: '4.97',
    cutsCount: 310,
    tags: ['Barboterapia', 'Corte Tesoura'],
    nextAvailable: 'LIVRE ÀS 15:00',
  },
  {
    id: 'any-barber',
    bench: 'QUALQUER BANCADA',
    name: 'Primeiro Barbeiro Disponível',
    initials: '⚡',
    tags: ['MENOR ESPERA GARANTIDA'],
    nextAvailable: 'DISPONÍVEL EM 0 MIN (IMEDIATO)',
    isFastestMatch: true,
    description:
      'O algoritmo atribui a cadeira que liberar primeiro dentro do horário selecionado.',
  },
];

const DEFAULT_SLOTS_BY_BARBER: Record<string, TimeSlotOption[]> = {
  'diego-r': [
    { time: '15:15', status: 'available', label: 'SLOT PRINCIPAL' },
    { time: '16:15', status: 'available' },
    { time: '17:15', status: 'available' },
    { time: '18:15', status: 'occupied' },
    { time: '19:15', status: 'available' },
    { time: '20:15', status: 'last' },
  ],
  'lucas-prado': [
    { time: '15:45', status: 'available', label: 'SLOT PRINCIPAL' },
    { time: '16:45', status: 'occupied' },
    { time: '17:30', status: 'available' },
    { time: '18:30', status: 'available' },
    { time: '19:30', status: 'occupied' },
    { time: '20:30', status: 'last' },
  ],
  'alex-silva': [
    { time: '15:00', status: 'available', label: 'SLOT PRINCIPAL' },
    { time: '16:00', status: 'available' },
    { time: '17:00', status: 'occupied' },
    { time: '18:00', status: 'available' },
    { time: '19:00', status: 'available' },
    { time: '20:00', status: 'last' },
  ],
  'any-barber': [
    { time: '15:00', status: 'available', label: 'MATCH IMEDIATO' },
    { time: '15:15', status: 'available' },
    { time: '15:45', status: 'available' },
    { time: '16:15', status: 'available' },
    { time: '17:15', status: 'available' },
    { time: '19:15', status: 'last' },
  ],
};

export const BARBERSHOP_DETAILS: Record<string, BarbershopDetail> = {
  'grid-lab-01': {
    id: 'grid-lab-01',
    hubCode: 'HUB #01-PIN',
    cityLabel: 'SÃO PAULO (PINHEIROS)',
    name: 'GRID // BARBER LAB 01',
    address: 'RUA DOS PINHEIROS, 842 — PINHEIROS, SÃO PAULO',
    distanceLabel: '400M DE VOCÊ (GPS ATIVO)',
    availableBenches: 3,
    totalBenches: 4,
    rating: '4.96',
    reviewsCount: '520',
    estimatedCheckin: '4 MIN',
    openUntil: '22:00',
    description:
      'Bancadas tech climatizadas com toalha quente japonesa, cerveja artesanal em torneira e visagismo milimétrico estruturado com suporte a telemetria ao vivo.',
    amenities: [
      '[WI-FI 500MB]',
      '[CAFÉ ESPECIAL CORTESIA]',
      '[PIX & CARTÃO]',
      '[ESTACIONAMENTO NO LOCAL]',
      '[SOM VINIL & LOUNGE]',
    ],
    heroImageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDtZvkM4PbeRlyxwJWdXTY8nga17_RKgC353s41WoUKpMAi2gQAU8KMneOoTinq9mZRDmzrv4ysRMFD-TRKhtJHM924HFV99E0DoUMlGOxHPqxfcaipHjVe92YaY7gBYSPoBpGYOO90BBg72VLWG2ZzpXwmUI05g4w5A5fiUcb3qafvHfWi92KAkMU5joVxyiL_kiKS4fdxYhnIurjx_-mcwFSXk3wy9fQXIXNbCVuqZGH4uPQDDXlbWy-UGUiJ50eMTVYBoHFpXyeq',
    heroImageAlt: 'Interior industrial minimalista da GRID Barber Lab 01 em Pinheiros',
    services: DEFAULT_SERVICES,
    barbers: DEFAULT_BARBERS,
    dates: DEFAULT_DATES,
    slotsByBarber: DEFAULT_SLOTS_BY_BARBER,
  },
  'vertice-studio': {
    id: 'vertice-studio',
    hubCode: 'HUB #02-ITA',
    cityLabel: 'SÃO PAULO (ITAIM BIBI)',
    name: 'VÉRTICE STUDIO TECH',
    address: 'RUA JOAQUIM FLORIANO, 871 — ITAIM BIBI, SÃO PAULO',
    distanceLabel: '1.2KM DE VOCÊ (GPS ATIVO)',
    availableBenches: 2,
    totalBenches: 3,
    rating: '4.98',
    reviewsCount: '840',
    estimatedCheckin: '7 MIN',
    openUntil: '21:00',
    description:
      'Estúdio de alta precisão no coração do Itaim com divisórias em aço preto, iluminação linear e foco em visagismo executivo sem espera.',
    amenities: ['[WI-FI 1GB]', '[ESPRESSO CORTESIA]', '[PIX & APPLE PAY]', '[VALET]'],
    heroImageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuA_ivKZkFndw7z-mRC4oHSAbw9syoKqcyIwH7cG4y1r9f13RgGQ7eYGbcAZ60Z_TAjYRARDN63zRQUZmHXQpRhlddgLNauSBdBTiwh4OdQPWb0eDWGKt4mTg87zGv_wC4mCQGWXGYJBC6oeVj93YLc0cnevyyXGv00cRbEUTko5gbTOw7B6arrHQPQh4uFlmGQSmTxCvxp66P80t4YkxtAK5ATj28C4EKllZ_I5jSC_36CuIIQtRuTYcBc3EO0RolLMjhyfc_lzWnxB',
    heroImageAlt: 'Interior da Vértice Studio Tech no Itaim Bibi',
    services: DEFAULT_SERVICES,
    barbers: DEFAULT_BARBERS,
    dates: DEFAULT_DATES,
    slotsByBarber: DEFAULT_SLOTS_BY_BARBER,
  },
  'kinetic-cuts': {
    id: 'kinetic-cuts',
    hubCode: 'HUB #03-VMD',
    cityLabel: 'SÃO PAULO (VILA MADALENA)',
    name: 'KINETIC CUTS HUB',
    address: 'RUA ASPICUELTA, 220 — VILA MADALENA, SÃO PAULO',
    distanceLabel: '2.1KM DE VOCÊ (GPS ATIVO)',
    availableBenches: 4,
    totalBenches: 5,
    rating: '4.92',
    reviewsCount: '310',
    estimatedCheckin: '10 MIN',
    openUntil: '22:00',
    description:
      'Arquitetura industrial com fachada de tijolos, bancadas metálicas modulares e curadoria musical em vinil para fades urbanos e cortes clássicos.',
    amenities: ['[WI-FI 500MB]', '[CHOPP ARTESANAL]', '[PIX 1-CLICK]', '[LOUNGE VINIL]'],
    heroImageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBgw3i6CElEe3Dv0g0ALT3wNNiV1L2MCXuk5-eapVLugujufae1LEbRQzNr-7uOcQ6yd8KIm8vUaWd_21LS6P6OAeXwOXdQkBcR9Swv5VNHKO73W0Nus-IxpmL4O1-OHHzJINBlEw0QIhmKQVosPP5A6M6K8ipeuXDMcxOPLW4Y-DZxQqCZJQ1YleuBosx3yK9spLmqBRaFdZYSjQb7n0OTDxz5CNUrkm-EDq0qhwzshQhaw6veAfMmhr9JcrNJR6D-oOVnYzoE1Yuq',
    heroImageAlt: 'Interior da Kinetic Cuts Hub na Vila Madalena',
    services: DEFAULT_SERVICES,
    barbers: DEFAULT_BARBERS,
    dates: DEFAULT_DATES,
    slotsByBarber: DEFAULT_SLOTS_BY_BARBER,
  },
  'mono-grooming': {
    id: 'mono-grooming',
    hubCode: 'HUB #04-JAR',
    cityLabel: 'SÃO PAULO (JARDINS)',
    name: 'MONO GROOMING CO.',
    address: 'ALAMEDA LORENA, 1640 — JARDINS, SÃO PAULO',
    distanceLabel: '2.8KM DE VOCÊ (GPS ATIVO)',
    availableBenches: 1,
    totalBenches: 4,
    rating: '4.99',
    reviewsCount: '1.120',
    estimatedCheckin: '14 MIN',
    openUntil: '22:00',
    description:
      'Ateliê monocromático nos Jardins com poltronas em couro preto sob medida, luz natural ampla e atendimento individualizado de alta precisão.',
    amenities: ['[WI-FI DEDICADO]', '[SINGLE MALT & CAFÉ]', '[PIX & CARTÃO]', '[VALET]'],
    heroImageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDHzHlMIfaKrBujOwVRB1Bj3T-KNRj-T1rOX_cr9BJ1QUK4JHF0wRgn8iCEa8oP-NgfAAtedKQuaQe0sTPuD1iuU0cz-1_ljLjGb9Oa_ZBKc8ltDJBgnR97eHS1W9OLcQtRXk8WKw6zgAVN8cSg7zl58hjrp0xiB4iXq1DtMv7qUQsOa9kNl_Uc_jdA-7PiQEIQiucNfDJlJ5jLwNpp-QT4e2lvqCh24orZ8QCgiAiw28Rr268q8-oWjZT0p6Fbt2k6OoScq96rxZRN',
    heroImageAlt: 'Interior da Mono Grooming Co nos Jardins',
    services: DEFAULT_SERVICES,
    barbers: DEFAULT_BARBERS,
    dates: DEFAULT_DATES,
    slotsByBarber: DEFAULT_SLOTS_BY_BARBER,
  },
};

export function getBarbershopById(id: string | undefined): BarbershopDetail {
  if (id && BARBERSHOP_DETAILS[id]) {
    return BARBERSHOP_DETAILS[id];
  }
  return BARBERSHOP_DETAILS['grid-lab-01'];
}
