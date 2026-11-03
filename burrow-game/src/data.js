// Game data. Palette matches tools/recolor.py.
export const PALETTE = {
  darkGreen:'#0A3323', midnight:'#105666', moss:'#839959', brook:'#AABAAE', pomelo:'#9F9679',
  beige:'#F7F4D5', chalk:'#E3D6BF', rosyBrown:'#D3968C', pink:'#B5728A', amaranth:'#933B5B',
};
// interval = ms per product at full happiness baseline; cap = max stored uncollected
export const ANIMALS = {
  chicken:{ product:'egg',  interval:30000, cap:5, x:70,  y:110, unlockCost:0 },
  sheep:  { product:'wool', interval:60000, cap:5, x:160, y:115, unlockCost:0 },
  cow:    { product:'milk', interval:90000, cap:5, x:250, y:110, unlockCost:0 },
};
export const RECIPES = [
  { id:'omelette',   name:'Moss Omelette',   needs:{egg:2},          price:12 },
  { id:'custard',    name:'Rose Custard',    needs:{egg:1,milk:1},   price:14 },
  { id:'latte',      name:'Warm Milk',       needs:{milk:2},         price:16 },
  { id:'scarf',      name:'Cozy Scarf',      needs:{wool:2},         price:22 },
  { id:'pudding',    name:'Burrow Pudding',  needs:{egg:2,milk:2,wool:0}, price:34 },
];
export const MAX_OFFLINE_MS = 12*3600*1000;
