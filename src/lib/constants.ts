export const CATEGORIES = [
  "On Campus",
  "Fall Tour",
  "Mini Tours",
  "Winter Tour",
  "Spring Tour",
  "World Tour",
] as const

export const CATEGORY_SEASON_ORDER: Record<string, number> = {
  "On Campus": 0,
  "Fall Tour": 1,
  "Mini Tours": 2,
  "Winter Tour": 3,
  "Spring Tour": 4,
  "World Tour": 5,
}

export const NAMES = [
  "Emily", "Eunice", "Peighton", "Yixiao", "Tabatha",
  "Ben", "Noah", "Elijah", "Charlie", "Lucas",
  "Quincy", "Joseph", "Brandon", "Gui",
] as const
