const cropRules = {
  Rice: { seasons: ["Kharif"], temp: [20, 35], soil: ["Clay", "Alluvial"] },
  Wheat: { seasons: ["Rabi"], temp: [10, 25], soil: ["Loamy", "Clay"] },
  Maize: { seasons: ["Kharif", "Rabi"], temp: [18, 30], soil: ["Loamy"] },
  Barley: { seasons: ["Rabi"], temp: [12, 25], soil: ["Loamy"] },
  "Jowar (Sorghum)": { seasons: ["Kharif"], temp: [25, 32], soil: ["Loamy"] },
  "Bajra (Pearl Millet)": { seasons: ["Kharif"], temp: [25, 35], soil: ["Sandy"] },
  "Ragi (Finger Millet)": { seasons: ["Kharif"], temp: [20, 30], soil: ["Loamy"] },

  "Gram (Chana)": { seasons: ["Rabi"], temp: [20, 25], soil: ["Loamy"] },
  "Tur (Arhar)": { seasons: ["Kharif"], temp: [20, 35], soil: ["Loamy"] },
  Moong: { seasons: ["Zaid", "Kharif"], temp: [25, 35], soil: ["Loamy"] },
  Urad: { seasons: ["Kharif"], temp: [25, 35], soil: ["Clay"] },
  Masoor: { seasons: ["Rabi"], temp: [18, 25], soil: ["Loamy"] },

  Sugarcane: { seasons: ["Kharif"], temp: [20, 35], soil: ["Loamy"] },
  Cotton: { seasons: ["Kharif"], temp: [20, 35], soil: ["Black"] },
  Jute: { seasons: ["Kharif"], temp: [25, 35], soil: ["Alluvial"] },

  Groundnut: { seasons: ["Kharif"], temp: [25, 35], soil: ["Sandy"] },
  Mustard: { seasons: ["Rabi"], temp: [10, 25], soil: ["Loamy"] },
  Soybean: { seasons: ["Kharif"], temp: [20, 30], soil: ["Loamy"] },
  Sunflower: { seasons: ["Kharif", "Rabi"], temp: [20, 30], soil: ["Loamy"] },
  "Sesame (Til)": { seasons: ["Kharif"], temp: [25, 35], soil: ["Sandy"] },

  Tea: { seasons: ["Kharif"], temp: [20, 30], soil: ["Acidic"] },
  Coffee: { seasons: ["Kharif"], temp: [18, 28], soil: ["Loamy"] },
  Rubber: { seasons: ["Kharif"], temp: [25, 35], soil: ["Clay"] },

  Potato: { seasons: ["Rabi"], temp: [15, 25], soil: ["Loamy"] },
  Onion: { seasons: ["Rabi"], temp: [13, 25], soil: ["Loamy"] },
  Tomato: { seasons: ["Rabi", "Zaid"], temp: [20, 30], soil: ["Loamy"] },
  Brinjal: { seasons: ["Kharif"], temp: [25, 35], soil: ["Loamy"] },
  Cabbage: { seasons: ["Rabi"], temp: [15, 25], soil: ["Loamy"] },
  Cauliflower: { seasons: ["Rabi"], temp: [15, 25], soil: ["Loamy"] },

  Mango: { seasons: ["Kharif"], temp: [24, 35], soil: ["Loamy"] },
  Banana: { seasons: ["Kharif"], temp: [25, 35], soil: ["Loamy"] },
  Apple: { seasons: ["Rabi"], temp: [10, 20], soil: ["Loamy"] },
  Orange: { seasons: ["Rabi"], temp: [15, 30], soil: ["Loamy"] },
  Grapes: { seasons: ["Rabi"], temp: [15, 30], soil: ["Sandy"] },
  Pineapple: { seasons: ["Kharif"], temp: [22, 32], soil: ["Sandy"] },
  Guava: { seasons: ["Kharif"], temp: [20, 30], soil: ["Loamy"] }
};

module.exports = cropRules;