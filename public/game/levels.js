// Campaign beats for the overworld demo. Each level has its own map,
// loadout, and win condition so play is not just "put five diamonds in a chest".

export const COOKED_MEAT = ["cooked-porkchop", "steak", "cooked-chicken", "cooked-mutton"];

export const LEVELS = [
  {
    id: "farm",
    title: "开垦",
    subtitle: "第一关",
    brief: "锄地、种麦、合成面包。把 3 个面包放进箱子。",
    how: "对着草地按「用」锄地，种小麦种子，麦穗变金后收割。到工作台点「面包」：3 个小麦合成 1 个面包，再放进箱子。",
    goal: "箱子里有 3 个面包",
    quest: { type: "chest", item: "bread", count: 3, label: "面包入箱" },
    clock: 8,
    spawn: [3.5, 10],
    items: [
      { id: "wooden-hoe", count: 1 },
      { id: "wooden-shovel", count: 1 },
      { id: "wheat-seeds", count: 12 },
      { id: "oak-log", count: 8 },
      { id: "coal", count: 6 },
      { id: "bone-meal", count: 6 },
      { id: "apple", count: 4 },
    ],
  },
  {
    id: "hunt",
    title: "牧场",
    subtitle: "第二关",
    brief: "打猎或屠宰，营火或熔炉把肉烤熟，放 4 份熟肉进箱子。",
    how: "杀掉猪牛羊鸡拿到生肉。站到屋子里的熔炉上按「用」烤熟（背包要有煤炭）；也可以把生肉拿到屋外营火上烤。把 4 份熟肉放进箱子。",
    goal: "箱子里有 4 份熟肉",
    quest: { type: "chest", any: COOKED_MEAT, count: 4, label: "熟肉入箱" },
    clock: 9,
    spawn: [3.5, 10],
    items: [
      { id: "wooden-sword", count: 1 },
      { id: "wooden-axe", count: 1 },
      { id: "coal", count: 8 },
      { id: "wheat", count: 4 },
      { id: "carrot", count: 4 },
      { id: "apple", count: 3 },
    ],
  },
  {
    id: "fish",
    title: "渔村",
    subtitle: "第三关",
    brief: "对着水塘甩竿，钓上 3 条东西。鱼、骨头或睡莲都算。",
    goal: "钓鱼 3 次",
    quest: { type: "fish", count: 3, label: "钓鱼次数" },
    clock: 10,
    spawn: [3.5, 10],
    items: [
      { id: "fishing-rod", count: 1 },
      { id: "bread", count: 4 },
      { id: "apple", count: 2 },
      { id: "oak-log", count: 4 },
    ],
  },
  {
    id: "mine",
    title: "矿洞",
    subtitle: "第四关",
    brief: "下矿挖铁矿和煤，熔炼后把 8 个铁锭放进箱子。木镐挖不了铁矿。",
    goal: "箱子里有 8 个铁锭",
    quest: { type: "chest", item: "iron-ingot", count: 8, label: "铁锭入箱" },
    clock: 10,
    spawn: [3.5, 10],
    items: [
      { id: "stone-pickaxe", count: 1 },
      { id: "stone-sword", count: 1 },
      { id: "torch", count: 16 },
      { id: "oak-log", count: 8 },
      { id: "coal", count: 8 },
      { id: "bread", count: 4 },
    ],
  },
  {
    id: "night",
    title: "守夜",
    subtitle: "第五关",
    brief: "天黑了。用弓或剑消灭 6 只敌对生物。",
    goal: "击杀 6 只敌对生物",
    quest: { type: "kills", count: 6, label: "击杀敌对生物" },
    clock: 19.2,
    spawn: [4, 10],
    items: [
      { id: "bow", count: 1 },
      { id: "arrow", count: 24 },
      { id: "stone-sword", count: 1 },
      { id: "bread", count: 6 },
      { id: "torch", count: 8 },
      { id: "iron-chestplate", count: 1 },
    ],
  },
  {
    id: "overworld",
    title: "主世界",
    subtitle: "第六关",
    brief: "向东穿过农场、矿洞、雪原和下界。把 5 颗钻石放进任意箱子。",
    goal: "箱子里有 5 颗钻石",
    quest: { type: "chest", item: "diamond", count: 5, label: "钻石入箱" },
    clock: 8,
    spawn: [3.5, 10],
    items: [
      { id: "diamond-sword", count: 1 },
      { id: "diamond-pickaxe", count: 1 },
      { id: "wooden-hoe", count: 1 },
      { id: "torch", count: 8 },
      { id: "wheat-seeds", count: 8 },
      { id: "carrot", count: 4 },
      { id: "wheat", count: 4 },
      { id: "bread", count: 2 },
      { id: "oak-log", count: 8 },
    ],
  },
  {
    id: "nether",
    title: "下界",
    subtitle: "第七关",
    brief: "挖 4 个下界石英放进箱子，用打火石点亮传送门并走过去。",
    goal: "石英入箱并穿过传送门",
    quest: {
      type: "and",
      label: "石英与传送门",
      parts: [
        { type: "chest", item: "quartz", count: 4, label: "石英入箱" },
        { type: "portal", label: "穿过传送门" },
      ],
    },
    clock: 12,
    spawn: [3.5, 10],
    items: [
      { id: "iron-pickaxe", count: 1 },
      { id: "diamond-sword", count: 1 },
      { id: "flint-and-steel", count: 1 },
      { id: "torch", count: 8 },
      { id: "bread", count: 4 },
      { id: "potion-heal", count: 1 },
    ],
  },
];

export function levelById(id) {
  const level = LEVELS.find((it) => it.id === id);
  if (!level) throw new Error(`unknown level ${id}`);
  return level;
}

export function overlayGoal(level) {
  const detail = level.how ?? level.brief;
  return `${level.subtitle}「${level.title}」：${detail}`;
}
