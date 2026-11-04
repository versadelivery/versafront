import { Apple, Beef, CakeSlice, Carrot, Coffee, CookingPot, Croissant, Drumstick, Fish, Flame, GlassWater, Ham, IceCream, Leaf, Pizza, Sandwich, ShoppingBasket, Store, Wine, type LucideIcon } from "lucide-react";

// Ordem importa: primeira palavra-chave encontrada vence. Texto normalizado (minusculo, sem acento).
const RULES: Array<[string[], LucideIcon]> = [
  [["bovin", "carne bov", "boi", "churrasco"], Beef],
  [["suin", "porco", "presunto"], Ham],
  [["ave", "aves", "frango", "galinha"], Drumstick],
  [["peixe", "fruto", "mar", "frutos do mar", "pescado"], Fish],
  [["linguica", "salsicha"], Flame],
  [["embutido", "pratico", "lanche", "burger", "hamburguer", "sanduiche"], Sandwich],
  [["mercearia", "conveniencia", "mercado"], ShoppingBasket],
  [["tempero", "condimento", "molho", "prato", "marmita"], CookingPot],
  [["verdura", "legume", "hortifruti"], Carrot],
  [["erva", "cheiro verde", "salada"], Leaf],
  [["fruta"], Apple],
  [["vinho"], Wine],
  [["bebida", "drink", "suco", "refrigerante", "agua", "cerveja"], GlassWater],
  [["cafe", "cappuccino"], Coffee],
  [["pizza"], Pizza],
  [["sorvete", "gelado", "acai"], IceCream],
  [["doce", "sobremesa", "bolo", "torta"], CakeSlice],
  [["pao", "padaria", "salgado"], Croissant],
];

const normalize = (text: string) => text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

export function categoryIcon(name: string): LucideIcon {
  const text = normalize(name);
  const words = text.split(/[^a-z0-9]+/);
  const hit = RULES.find(([keys]) => keys.some((key) => (key.includes(" ") ? text.includes(key) : words.some((w) => w === key || (key.length > 3 && w.startsWith(key))))));
  return hit?.[1] ?? Store;
}
