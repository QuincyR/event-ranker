export type Category = "character" | "hat" | "shirt" | "shoes" | "misc"

export type Item = {
  id: string
  name: string
  category: Category
  cost: number
  description: string
}

export const CHARACTERS: Item[] = [
  { id: "blob",    name: "Blob",    category: "character", cost: 0,   description: "The classic friendly blob" },
  { id: "cyclops", name: "Cyclops", category: "character", cost: 0,   description: "One big eye watching everything" },
  { id: "spiky",   name: "Spiky",   category: "character", cost: 0,   description: "Pointy and proud" },
  { id: "sleepy",  name: "Sleepy",  category: "character", cost: 0,   description: "Always half asleep" },
  { id: "blossom", name: "Blossom", category: "character", cost: 0,   description: "Sweet and cheerful" },
  { id: "dragon",  name: "Dragon",  category: "character", cost: 100, description: "Fire breathing and fierce" },
  { id: "aqua",    name: "Aqua",    category: "character", cost: 150, description: "Deep sea adventurer" },
  { id: "ghost",   name: "Ghost",   category: "character", cost: 200, description: "Boo! Did I scare you?" },
  { id: "robot",   name: "Robot",   category: "character", cost: 250, description: "Beep boop" },
  { id: "royal",   name: "Royal",   category: "character", cost: 400, description: "Born to rule" },
]

export const ACCESSORIES: Item[] = [
  { id: "party-hat",  name: "Party Hat",     category: "hat",   cost: 50,  description: "Let's celebrate!" },
  { id: "cowboy-hat", name: "Cowboy Hat",    category: "hat",   cost: 75,  description: "Yeehaw" },
  { id: "top-hat",    name: "Top Hat",       category: "hat",   cost: 100, description: "Very distinguished" },
  { id: "wizard-hat", name: "Wizard Hat",    category: "hat",   cost: 150, description: "Ancient arcane power" },
  { id: "crown",      name: "Crown",         category: "hat",   cost: 120, description: "For royalty only" },
  { id: "stripes",    name: "Striped Shirt", category: "shirt", cost: 50,  description: "Nautical vibes" },
  { id: "tuxedo",     name: "Tuxedo",        category: "shirt", cost: 100, description: "Black tie event" },
  { id: "cape",       name: "Cape",          category: "shirt", cost: 75,  description: "Hero mode: activated" },
  { id: "sneakers",   name: "Sneakers",      category: "shoes", cost: 50,  description: "Fresh kicks" },
  { id: "boots",      name: "Boots",         category: "shoes", cost: 75,  description: "Ready for adventure" },
  { id: "heels",      name: "Heels",         category: "shoes", cost: 60,  description: "Extra tall" },
  { id: "spectacles", name: "Spectacles",    category: "misc",  cost: 40,  description: "For the intellectual" },
  { id: "monocle",    name: "Monocle",       category: "misc",  cost: 60,  description: "How distinguished" },
  { id: "bow-tie",    name: "Bow Tie",       category: "misc",  cost: 35,  description: "Dapper as ever" },
  { id: "gold-chain", name: "Gold Chain",    category: "misc",  cost: 80,  description: "Dripping in gold" },
]

export const ALL_ITEMS: Item[] = [...CHARACTERS, ...ACCESSORIES]

export function getItem(id: string): Item | undefined {
  return ALL_ITEMS.find((i) => i.id === id)
}
