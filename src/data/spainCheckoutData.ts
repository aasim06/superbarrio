export interface SpainDeliverySlot {
  id: string;
  dayType: "today" | "tomorrow";
  dayLabel: string;
  timeRange: string;
  periodLabel: string;
  disabled: boolean;
}

export const SPAIN_PROVINCES = [
  "Madrid",
  "Barcelona",
  "Valencia",
  "Sevilla",
  "Málaga",
  "Alicante",
  "Zaragoza",
  "Murcia",
  "Vizcaya",
  "Islas Baleares",
  "Las Palmas",
  "Santa Cruz de Tenerife",
  "A Coruña",
  "Cádiz",
  "Granada",
  "Pontevedra",
  "Asturias",
  "Córdoba",
  "Guipúzcoa",
  "Toledo",
  "Badajoz",
  "Navarra",
  "Jaén",
  "Cantabria",
  "Castellón",
  "Huelva",
  "Valladolid",
  "Ciudad Real",
  "Tarragona",
  "Girona",
  "Almería",
  "Lleida",
  "Burgos",
  "Salamanca",
  "Albacete",
  "Cáceres",
  "La Rioja",
  "Lugo",
  "Ourense",
  "Álava",
  "Guadalajara",
  "Huesca",
  "Cuenca",
  "Zamora",
  "Palencia",
  "Ávila",
  "Segovia",
  "Teruel",
  "Soria",
];

export const TOP_SPAIN_CITIES = [
  "Madrid",
  "Barcelona",
  "Valencia",
  "Sevilla",
  "Zaragoza",
  "Málaga",
  "Bilbao",
  "Alicante",
];

export function getSpainDeliverySlots(locale: string = "es"): SpainDeliverySlot[] {
  const isEs = locale === "es";
  const now = new Date();
  const currentHour = now.getHours();

  // Format today & tomorrow with real dates
  const todayDateStr = now.toLocaleDateString(isEs ? "es-ES" : "en-US", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });

  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const tomorrowDateStr = tomorrow.toLocaleDateString(isEs ? "es-ES" : "en-US", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });

  const todayLabel = isEs ? `Hoy (${todayDateStr})` : `Today (${todayDateStr})`;
  const tomorrowLabel = isEs
    ? `Mañana (${tomorrowDateStr})`
    : `Tomorrow (${tomorrowDateStr})`;

  return [
    // Today Slots
    {
      id: "today-morning",
      dayType: "today",
      dayLabel: todayLabel,
      timeRange: "09:00 - 12:00",
      periodLabel: isEs ? "Mañana" : "Morning",
      disabled: currentHour >= 11, // disabled if past 11:00
    },
    {
      id: "today-midday",
      dayType: "today",
      dayLabel: todayLabel,
      timeRange: "12:00 - 15:00",
      periodLabel: isEs ? "Mediodía" : "Midday",
      disabled: currentHour >= 14, // disabled if past 14:00
    },
    {
      id: "today-afternoon",
      dayType: "today",
      dayLabel: todayLabel,
      timeRange: "17:00 - 20:00",
      periodLabel: isEs ? "Tarde" : "Afternoon",
      disabled: currentHour >= 19, // disabled if past 19:00
    },
    {
      id: "today-night",
      dayType: "today",
      dayLabel: todayLabel,
      timeRange: "20:00 - 22:00",
      periodLabel: isEs ? "Noche" : "Evening",
      disabled: currentHour >= 21, // disabled if past 21:00
    },

    // Tomorrow Slots (always available)
    {
      id: "tomorrow-morning",
      dayType: "tomorrow",
      dayLabel: tomorrowLabel,
      timeRange: "09:00 - 12:00",
      periodLabel: isEs ? "Mañana" : "Morning",
      disabled: false,
    },
    {
      id: "tomorrow-midday",
      dayType: "tomorrow",
      dayLabel: tomorrowLabel,
      timeRange: "12:00 - 15:00",
      periodLabel: isEs ? "Mediodía" : "Midday",
      disabled: false,
    },
    {
      id: "tomorrow-afternoon",
      dayType: "tomorrow",
      dayLabel: tomorrowLabel,
      timeRange: "17:00 - 20:00",
      periodLabel: isEs ? "Tarde" : "Afternoon",
      disabled: false,
    },
    {
      id: "tomorrow-night",
      dayType: "tomorrow",
      dayLabel: tomorrowLabel,
      timeRange: "20:00 - 22:00",
      periodLabel: isEs ? "Noche" : "Evening",
      disabled: false,
    },
  ];
}
