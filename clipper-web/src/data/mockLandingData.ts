export interface BenchSlot {
  time: string;
  label: string;
  status: 'available' | 'occupied' | 'highlight';
}

export interface LiveBarberBench {
  id: string;
  initials: string;
  name: string;
  specialty: string;
  benchLabel: string;
  benchHighlight?: boolean;
  slots: BenchSlot[];
}

export interface BarbershopSlot {
  time: string;
  variant: 'primary' | 'live' | 'default';
  badge?: string;
}

export interface PartnerBarbershop {
  id: string;
  hubCode: string;
  name: string;
  address: string;
  neighborhood: string;
  distanceLabel: string;
  isUrgentDistance?: boolean;
  availableBenches: number;
  totalBenches: number;
  isLastSpot?: boolean;
  priceLabel: string;
  rating: string;
  reviewsCount: string;
  imageUrl: string;
  imageAlt: string;
  slots: BarbershopSlot[];
  categories: string[];
}

export interface EngineModule {
  code: string;
  title: string;
  description: string;
  detailsTitle: string;
  details: string[];
  icon: 'sync' | 'hourglass' | 'bell';
}

export interface CityCoverage {
  city: string;
  slots: number;
}

export const HERO_METRICS = [
  {
    label: 'Latência Check-in',
    value: '15 seg',
    sublabel: '● 1-CLICK DISPATCH',
    subColor: 'text-live',
    valueColor: 'text-on-surface',
  },
  {
    label: 'Espera em Cadeiras',
    value: '0 min',
    sublabel: 'SLOT GARANTIDO',
    subColor: 'text-slate-500',
    valueColor: 'text-primary',
  },
  {
    label: 'Bancadas Tech',
    value: '84 un.',
    sublabel: 'SP METRÓPOLE',
    subColor: 'text-live',
    valueColor: 'text-on-surface',
  },
  {
    label: 'Slots Hoje',
    value: '6.840',
    sublabel: '92% OCUPAÇÃO',
    subColor: 'text-slate-500',
    valueColor: 'text-on-surface',
  },
];

export const LIVE_BENCH_MATRIX: LiveBarberBench[] = [
  {
    id: 'diego-ramos',
    initials: 'DR',
    name: 'Diego Ramos',
    specialty: 'Visagismo',
    benchLabel: 'BANCADA #01',
    benchHighlight: true,
    slots: [
      { time: '15:00', label: '15:00 [1-CLICK]', status: 'available' },
      { time: '15:30', label: '15:30 [OCUP]', status: 'occupied' },
      { time: '16:00', label: '16:00 [LIVRE]', status: 'available' },
    ],
  },
  {
    id: 'lucas-prado',
    initials: 'LP',
    name: 'Lucas "Navalha" Prado',
    specialty: 'Fade & Freestyle',
    benchLabel: 'BANCADA #03',
    slots: [
      { time: '15:15', label: '15:15 [OCUP]', status: 'occupied' },
      { time: '15:45', label: '15:45 [RESERVAR]', status: 'highlight' },
      { time: '16:15', label: '16:15 [LIVRE]', status: 'available' },
    ],
  },
  {
    id: 'alex-silva',
    initials: 'AS',
    name: 'Alex Silva',
    specialty: 'Barboterapia',
    benchLabel: 'BANCADA #04',
    slots: [
      { time: '15:00', label: '15:00 [LIVRE]', status: 'available' },
      { time: '15:45', label: '15:45 [OCUP]', status: 'occupied' },
      { time: '16:30', label: '16:30 [LIVRE]', status: 'available' },
    ],
  },
];

export const FILTER_CHIPS = [
  { id: 'all', label: 'Todos os Spots (84)' },
  { id: 'walk', label: '< 10 min a pé' },
  { id: 'combo', label: 'Corte + Barba' },
  { id: 'late', label: 'Aberto até 22h' },
] as const;

export const PARTNER_BARBERSHOPS: PartnerBarbershop[] = [
  {
    id: 'grid-lab-01',
    hubCode: 'HUB ID: #01-PIN',
    name: 'GRID // BARBER LAB 01',
    address: 'Rua dos Pinheiros, 412',
    neighborhood: 'PINHEIROS // SP',
    distanceLabel: '400m de você',
    availableBenches: 3,
    totalBenches: 4,
    priceLabel: 'R$ 85,00 • 30min',
    rating: '4.96',
    reviewsCount: '520',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAsLM_yVI-LoAY-3qWvLIS_o-s2v-87AtLjlRuP1zfCbQvjW_f6wdrns1p8micCHH5rItw6mofQA3g22P63fuBQKdEIpuxpZ513ToU37v5V4kbTojjlVMtXwao0U2dmVcEC5-DxacBFwg0nJNQ7ocVBmAz_yujmawos473aHWlDg3HdZ_2mwZ5tUqwYioLJbZxoylQrNgQGHjpKbNPsVhc8MjMIYzPio6GTuUc03vvQpp_ye6_0fv5_qgh-Qf5SPk-mC-xdVpMLcoWQ',
    imageAlt: 'GRID Barber Lab 01 em Pinheiros',
    slots: [
      { time: '15:15', variant: 'primary' },
      { time: '15:45', variant: 'default' },
      { time: '16:30', variant: 'default' },
    ],
    categories: ['all', 'walk', 'combo', 'late'],
  },
  {
    id: 'vertice-studio',
    hubCode: 'HUB ID: #02-ITA',
    name: 'VÉRTICE STUDIO TECH',
    address: 'Rua Joaquim Floriano, 871',
    neighborhood: 'ITAIM BIBI // SP',
    distanceLabel: '1.2km de você',
    availableBenches: 2,
    totalBenches: 3,
    priceLabel: 'R$ 95,00 • 45min',
    rating: '4.98',
    reviewsCount: '840',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuA_ivKZkFndw7z-mRC4oHSAbw9syoKqcyIwH7cG4y1r9f13RgGQ7eYGbcAZ60Z_TAjYRARDN63zRQUZmHXQpRhlddgLNauSBdBTiwh4OdQPWb0eDWGKt4mTg87zGv_wC4mCQGWXGYJBC6oeVj93YLc0cnevyyXGv00cRbEUTko5gbTOw7B6arrHQPQh4uFlmGQSmTxCvxp66P80t4YkxtAK5ATj28C4EKllZ_I5jSC_36CuIIQtRuTYcBc3EO0RolLMjhyfc_lzWnxB',
    imageAlt: 'Vértice Studio Tech no Itaim Bibi',
    slots: [
      { time: '15:30', variant: 'primary' },
      { time: '16:00', variant: 'default' },
      { time: '16:45', variant: 'default' },
    ],
    categories: ['all', 'combo'],
  },
  {
    id: 'kinetic-cuts',
    hubCode: 'HUB ID: #03-VMD',
    name: 'KINETIC CUTS HUB',
    address: 'Rua Aspicuelta, 220',
    neighborhood: 'VILA MADALENA // SP',
    distanceLabel: '2.1km de você',
    availableBenches: 4,
    totalBenches: 5,
    priceLabel: 'R$ 80,00 • 35min',
    rating: '4.92',
    reviewsCount: '310',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBgw3i6CElEe3Dv0g0ALT3wNNiV1L2MCXuk5-eapVLugujufae1LEbRQzNr-7uOcQ6yd8KIm8vUaWd_21LS6P6OAeXwOXdQkBcR9Swv5VNHKO73W0Nus-IxpmL4O1-OHHzJINBlEw0QIhmKQVosPP5A6M6K8ipeuXDMcxOPLW4Y-DZxQqCZJQ1YleuBosx3yK9spLmqBRaFdZYSjQb7n0OTDxz5CNUrkm-EDq0qhwzshQhaw6veAfMmhr9JcrNJR6D-oOVnYzoE1Yuq',
    imageAlt: 'Kinetic Cuts Hub na Vila Madalena',
    slots: [
      { time: '15:00 ⚡', variant: 'live' },
      { time: '15:45', variant: 'default' },
      { time: '16:15', variant: 'default' },
    ],
    categories: ['all', 'late'],
  },
  {
    id: 'mono-grooming',
    hubCode: 'HUB ID: #04-JAR',
    name: 'MONO GROOMING CO.',
    address: 'Alameda Lorena, 1640',
    neighborhood: 'JARDINS // SP',
    distanceLabel: '2.8km de você',
    isUrgentDistance: true,
    availableBenches: 1,
    totalBenches: 4,
    isLastSpot: true,
    priceLabel: 'R$ 110,00 • 45min',
    rating: '4.99',
    reviewsCount: '1.120',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDHzHlMIfaKrBujOwVRB1Bj3T-KNRj-T1rOX_cr9BJ1QUK4JHF0wRgn8iCEa8oP-NgfAAtedKQuaQe0sTPuD1iuU0cz-1_ljLjGb9Oa_ZBKc8ltDJBgnR97eHS1W9OLcQtRXk8WKw6zgAVN8cSg7zl58hjrp0xiB4iXq1DtMv7qUQsOa9kNl_Uc_jdA-7PiQEIQiucNfDJlJ5jLwNpp-QT4e2lvqCh24orZ8QCgiAiw28Rr268q8-oWjZT0p6Fbt2k6OoScq96rxZRN',
    imageAlt: 'Mono Grooming Co nos Jardins',
    slots: [
      { time: '15:45 [ÚLTIMO]', variant: 'primary' },
      { time: '17:15', variant: 'default' },
    ],
    categories: ['all', 'combo', 'late'],
  },
];

export const ENGINE_MODULES: EngineModule[] = [
  {
    code: 'MÓDULO // 01',
    title: '01 // Mapeamento Multi-Barbearia',
    description:
      'Conexão em tempo real aos softwares e terminais de cada barbearia. Unifica catálogo de serviços, tempo de cadeira e especialidades dos profissionais em um só feed unificado de latência submétrica.',
    detailsTitle: '// DADOS MAPEADOS',
    details: [
      '• Ritmo médio por profissional',
      '• Bloqueios manuais de intervalo',
      '• Sincronia Google / Apple / ERPs',
    ],
    icon: 'sync',
  },
  {
    code: 'MÓDULO // 02',
    title: '02 // Motor Dinâmico de Slots & Buffer',
    description:
      'Algoritmo preditivo que calcula a duração exata do procedimento + 5 minutos automáticos de higienização de navalhas e esterilização de bancada. Fila zero e pontualidade cirúrgica.',
    detailsTitle: '// LÓGICA DE BUFFER',
    details: [
      '• Corte Degradê: 30 min + 5 min buffer',
      '• Barboterapia: 25 min + 5 min buffer',
      '• Check-in de tolerância: ±3 min',
    ],
    icon: 'hourglass',
  },
  {
    code: 'MÓDULO // 03',
    title: '03 // Check-in em 15s & Notificação Push',
    description:
      'Reserva concluída em 1 clique sem preenchimento exaustivo de formulários. O barbeiro recebe o alerta no tablet da bancada com sua foto, referências visuais e preferências de acabamento.',
    detailsTitle: '// DISPATCH IMEDIATO',
    details: [
      '• Push imediato no tablet do barbeiro',
      '• Lembrete WhatsApp a 15min',
      '• Pagamento 100% digital integrado',
    ],
    icon: 'bell',
  },
];

export const CITIES_COVERAGE: CityCoverage[] = [
  { city: 'São Paulo // SP', slots: 612 },
  { city: 'Rio de Janeiro // RJ', slots: 341 },
  { city: 'Belo Horizonte // MG', slots: 184 },
  { city: 'Curitiba // PR', slots: 147 },
  { city: 'Porto Alegre // RS', slots: 144 },
];
