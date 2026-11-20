export interface RadarPriceItem {
  label: string;
  price: string;
  duration: string;
  highlight?: boolean;
}

export interface RadarSlot {
  time: string;
  barberTag?: string;
  variant: 'primary' | 'live' | 'last' | 'default';
}

export interface RadarBarbershop {
  id: string;
  hubCode: string;
  name: string;
  neighborhood: string;
  distanceKm: number;
  distanceLabel: string;
  address: string;
  description: string;
  rating: number;
  reviewsCount: string;
  availableBenches: number;
  totalBenches: number;
  isLastSpot?: boolean;
  estimatedCheckinMin: number;
  openLate: boolean;
  acceptsPix1Click: boolean;
  prices: RadarPriceItem[];
  slotsTitle: string;
  slots: RadarSlot[];
  extraSlotsLabel?: string;
  barberInitials?: string[];
  footerNote: string;
  mapCoords: { x: number; y: number };
  pinLabel: string;
  featuredBarber: string;
  featuredSpecialty: string;
}

export const RADAR_BARBERSHOPS: RadarBarbershop[] = [
  {
    id: 'grid-lab-01',
    hubCode: 'HUB #01-PIN',
    name: 'GRID // BARBER LAB 01',
    neighborhood: 'Pinheiros',
    distanceKm: 0.4,
    distanceLabel: '400m de você',
    address:
      'Rua dos Pinheiros, 412 • Bancadas tech climatizadas com toalha quente japonesa, cerveja artesanal em torneira e visagismo milimétrico estruturado.',
    description: 'Bancadas tech climatizadas com toalha quente japonesa.',
    rating: 4.96,
    reviewsCount: '520',
    availableBenches: 3,
    totalBenches: 4,
    estimatedCheckinMin: 4,
    openLate: true,
    acceptsPix1Click: true,
    prices: [
      { label: 'CORTE FADE', price: 'R$ 85', duration: '[30m]' },
      { label: 'CORTE + BARBA', price: 'R$ 135', duration: '[45m]', highlight: true },
      { label: 'BARBATERAPIA', price: 'R$ 65', duration: '[25m]' },
    ],
    slotsTitle: 'SLOTS IMEDIATOS DE BANCADA',
    slots: [
      { time: '15:15', barberTag: '⚡ MESTRE DIEGO', variant: 'primary' },
      { time: '15:45', variant: 'default' },
      { time: '16:00', variant: 'default' },
      { time: '16:30', variant: 'default' },
    ],
    extraSlotsLabel: '+6 horários hoje',
    barberInitials: ['DR', 'LP', 'AS'],
    footerNote: '3 barbeiros em atendimento',
    mapCoords: { x: 425, y: 415 },
    pinLabel: 'LAB 01 • 15:15 ⚡',
    featuredBarber: 'Mestre Diego R.',
    featuredSpecialty: 'Visagismo & Degradê',
  },
  {
    id: 'vertice-studio',
    hubCode: 'HUB #02-ITA',
    name: 'VÉRTICE STUDIO TECH',
    neighborhood: 'Itaim Bibi',
    distanceKm: 1.2,
    distanceLabel: '1.2km de você',
    address:
      'Rua Joaquim Floriano, 871 • Espaço moderno focado em cortes milimétricos com lâmina de precisão e escaneamento capilar 3D.',
    description: 'Espaço moderno focado em cortes milimétricos.',
    rating: 4.98,
    reviewsCount: '840',
    availableBenches: 2,
    totalBenches: 3,
    estimatedCheckinMin: 9,
    openLate: false,
    acceptsPix1Click: true,
    prices: [
      { label: 'CORTE PRECISION', price: 'R$ 95', duration: '[35m]' },
      { label: 'CORTE + BARBA', price: 'R$ 150', duration: '[45m]', highlight: true },
      { label: 'VISAGISMO 3D', price: 'INCLUSO', duration: '[10m]' },
    ],
    slotsTitle: 'SLOTS LIVRES CONFIRMADOS',
    slots: [
      { time: '15:30', variant: 'default' },
      { time: '16:00', variant: 'default' },
      { time: '16:45', variant: 'default' },
      { time: '17:15', variant: 'default' },
    ],
    extraSlotsLabel: '+9 slots',
    footerNote: 'Mestres Renan & Thiago disponíveis',
    mapCoords: { x: 420, y: 690 },
    pinLabel: 'VÉRTICE • 15:30',
    featuredBarber: 'Mestre Renan',
    featuredSpecialty: 'Precision & Tesoura',
  },
  {
    id: 'kinetic-cuts',
    hubCode: 'HUB #03-VMD',
    name: 'KINETIC CUTS HUB',
    neighborhood: 'Vila Madalena',
    distanceKm: 1.8,
    distanceLabel: '1.8km de você',
    address:
      'Rua Aspicuelta, 220 • Clássicos e street fades com café expresso de torra especial e lounge musical com acústica tratada.',
    description: 'Clássicos e street fades com lounge musical.',
    rating: 4.92,
    reviewsCount: '310',
    availableBenches: 4,
    totalBenches: 5,
    estimatedCheckinMin: 14,
    openLate: true,
    acceptsPix1Click: true,
    prices: [
      { label: 'CORTE URBANO', price: 'R$ 80', duration: '[35m]' },
      { label: 'CORTE + BARBA TERAPIA', price: 'R$ 130', duration: '[50m]', highlight: true },
    ],
    slotsTitle: 'SLOTS DISPONÍVEIS AGORA',
    slots: [
      { time: '15:00', barberTag: '⚡', variant: 'live' },
      { time: '15:45', variant: 'default' },
      { time: '16:15', variant: 'default' },
      { time: '17:00', variant: 'default' },
    ],
    extraSlotsLabel: '+12 slots',
    footerNote: '4 bancadas operando em tempo real',
    mapCoords: { x: 290, y: 230 },
    pinLabel: 'KINETIC • 15:00',
    featuredBarber: 'Lucas Prado',
    featuredSpecialty: 'Street Fade & Mullet',
  },
  {
    id: 'mono-grooming',
    hubCode: 'HUB #04-JAR',
    name: 'MONO GROOMING CO.',
    neighborhood: 'Jardins',
    distanceKm: 2.4,
    distanceLabel: '2.4km de você',
    address:
      'Alameda Lorena, 1640 • Ateliê minimalista com atendimento premium individualizado, cabines privativas e barbearia clássica inglesa.',
    description: 'Ateliê minimalista com cabines privativas.',
    rating: 4.99,
    reviewsCount: '1.120',
    availableBenches: 1,
    totalBenches: 4,
    isLastSpot: true,
    estimatedCheckinMin: 18,
    openLate: true,
    acceptsPix1Click: false,
    prices: [
      { label: 'CORTE EXCLUSIVO', price: 'R$ 110', duration: '[40m]' },
      { label: 'RITUAL COMPLETO', price: 'R$ 175', duration: '[55m]', highlight: true },
    ],
    slotsTitle: 'ÚLTIMO HORÁRIO DISPONÍVEL NESTE TURNO',
    slots: [
      { time: '15:45', barberTag: '[ÚLTIMO]', variant: 'last' },
      { time: '17:15', variant: 'default' },
    ],
    footerNote: 'Mestre Henrique em atendimento',
    mapCoords: { x: 580, y: 290 },
    pinLabel: 'MONO • 15:45 [1 VAGA]',
    featuredBarber: 'Mestre Henrique',
    featuredSpecialty: 'Ritual Clássico Inglês',
  },
];
