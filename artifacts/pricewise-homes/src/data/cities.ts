/**
 * Static dataset of Indian cities with real estate and demographic data.
 * Used by the Visualization page to render dynamic house SVGs.
 */

export interface CityData {
  name: string;
  state: string;
  /** Average house price in lakhs (INR) */
  avgHousePrice: number;
  /** Population in millions */
  population: number;
  /** Annual growth rate (%) */
  growthRate: number;
  /** City area in sq km */
  areaSize: number;
}

export const CITIES: CityData[] = [
  { name: "Mumbai",       state: "Maharashtra",    avgHousePrice: 185, population: 20.7, growthRate: 5.2, areaSize: 603  },
  { name: "Delhi",        state: "Delhi",          avgHousePrice: 142, population: 32.9, growthRate: 4.8, areaSize: 1484 },
  { name: "Bengaluru",    state: "Karnataka",      avgHousePrice: 128, population: 13.2, growthRate: 8.1, areaSize: 741  },
  { name: "Hyderabad",    state: "Telangana",      avgHousePrice: 98,  population: 10.4, growthRate: 7.3, areaSize: 650  },
  { name: "Chennai",      state: "Tamil Nadu",     avgHousePrice: 92,  population: 11.2, growthRate: 4.6, areaSize: 426  },
  { name: "Kolkata",      state: "West Bengal",    avgHousePrice: 75,  population: 15.1, growthRate: 3.2, areaSize: 206  },
  { name: "Pune",         state: "Maharashtra",    avgHousePrice: 105, population: 7.4,  growthRate: 7.9, areaSize: 331  },
  { name: "Ahmedabad",    state: "Gujarat",        avgHousePrice: 72,  population: 8.1,  growthRate: 5.8, areaSize: 505  },
  { name: "Jaipur",       state: "Rajasthan",      avgHousePrice: 65,  population: 4.0,  growthRate: 5.1, areaSize: 485  },
  { name: "Lucknow",      state: "Uttar Pradesh",  avgHousePrice: 58,  population: 3.7,  growthRate: 4.3, areaSize: 310  },
  { name: "Chandigarh",   state: "Punjab",         avgHousePrice: 88,  population: 1.2,  growthRate: 3.8, areaSize: 114  },
  { name: "Bhopal",       state: "Madhya Pradesh", avgHousePrice: 52,  population: 2.4,  growthRate: 4.5, areaSize: 285  },
  { name: "Patna",        state: "Bihar",          avgHousePrice: 45,  population: 2.7,  growthRate: 3.6, areaSize: 136  },
  { name: "Indore",       state: "Madhya Pradesh", avgHousePrice: 61,  population: 3.3,  growthRate: 6.2, areaSize: 530  },
  { name: "Surat",        state: "Gujarat",        avgHousePrice: 68,  population: 7.8,  growthRate: 6.8, areaSize: 326  },
  { name: "Nagpur",       state: "Maharashtra",    avgHousePrice: 59,  population: 3.1,  growthRate: 4.1, areaSize: 227  },
  { name: "Kanpur",       state: "Uttar Pradesh",  avgHousePrice: 42,  population: 3.2,  growthRate: 2.9, areaSize: 404  },
  { name: "Varanasi",     state: "Uttar Pradesh",  avgHousePrice: 48,  population: 1.7,  growthRate: 3.3, areaSize: 112  },
  { name: "Kochi",        state: "Kerala",         avgHousePrice: 82,  population: 2.1,  growthRate: 5.5, areaSize: 95   },
  { name: "Bhubaneswar",  state: "Odisha",         avgHousePrice: 55,  population: 1.0,  growthRate: 6.0, areaSize: 135  },
  { name: "Visakhapatnam",state: "Andhra Pradesh", avgHousePrice: 63,  population: 2.3,  growthRate: 5.7, areaSize: 682  },
  { name: "Noida",        state: "Uttar Pradesh",  avgHousePrice: 110, population: 0.7,  growthRate: 9.2, areaSize: 203  },
];
