// Справочник брендов, вкусов и проверенных миксов.
// Миксы собраны вручную из классических сочетаний, поэтому вкусы в них
// гарантированно дружат. Генератор не склеивает случайные вкусы, а подбирает
// готовый рецепт и раскладывает его по брендам под нужную крепость.

// tier: 1 — лёгкий, 2 — средний, 3 — крепкий
const BRANDS = {
  starline: { name: 'Starline', tier: 1 },
  element: { name: 'Element Вода', tier: 1 },
  alfakher: { name: 'Al Fakher', tier: 1 },
  musthave: { name: 'Musthave', tier: 2 },
  sebero: { name: 'Sebero', tier: 2 },
  blackburn: { name: 'Black Burn', tier: 3 },
  darkside: { name: 'Darkside', tier: 3 },
};

// Бренды с широкими линейками, у которых есть почти любой «ходовой» вкус.
const WIDE = ['starline', 'element', 'musthave', 'sebero', 'blackburn', 'darkside'];

const CATEGORIES = {
  fruit: 'Фрукты',
  berry: 'Ягоды',
  citrus: 'Цитрусы',
  tropic: 'Тропики',
  dessert: 'Десерты',
  drink: 'Напитки',
  herbal: 'Травы и хвоя',
};

// b: бренд → название позиции. true — у бренда есть такой вкус,
// показываем его по-русски (точное название уточнить в магазине).
function flavor(label, opts = {}) {
  const b = {};
  for (const id of opts.only || WIDE) b[id] = true;
  Object.assign(b, opts.names || {});
  return { label, b };
}

const FLAVORS = {
  watermelon: flavor('арбуз', { names: { darkside: 'Torpedo' } }),
  melon: flavor('дыня'),
  grapefruit: flavor('грейпфрут', { names: { darkside: 'Kalee Grap' } }),
  raspberry: flavor('малина'),
  mango: flavor('манго'),
  passionfruit: flavor('маракуйя', { names: { darkside: 'Dark Passion' } }),
  strawberry: flavor('клубника'),
  wildstrawberry: flavor('земляника', { names: { darkside: 'Wild Forest' } }),
  banana: flavor('банан', { names: { darkside: 'Bananapapa' } }),
  cherry: flavor('вишня', { names: { darkside: 'Code Cherry' } }),
  cola: flavor('кола'),
  lemon: flavor('лимон', { names: { darkside: 'Lemonblast' } }),
  lime: flavor('лайм'),
  orange: flavor('апельсин'),
  blueberry: flavor('черника'),
  blackcurrant: flavor('чёрная смородина'),
  peach: flavor('персик'),
  apricot: flavor('абрикос'),
  apple: flavor('зелёное яблоко'),
  pear: flavor('груша'),
  kiwi: flavor('киви'),
  feijoa: flavor('фейхоа', { only: ['musthave', 'darkside', 'blackburn'], names: { darkside: 'Green Beam' } }),
  grape: flavor('виноград'),
  pomegranate: flavor('гранат'),
  pineapple: flavor('ананас'),
  coconut: flavor('кокос'),
  cream: flavor('ваниль / сливки'),
  chocolate: flavor('шоколад', { only: ['musthave', 'sebero', 'darkside', 'blackburn', 'starline'] }),
  cinnamon: flavor('корица', { only: ['musthave', 'darkside', 'starline', 'alfakher'] }),
  cheesecake: flavor('чизкейк', { only: ['musthave', 'darkside', 'blackburn'] }),
  milkyrice: flavor('молочный рис', { only: ['musthave'], names: { musthave: 'Milky Rice' } }),
  blacktea: flavor('чёрный чай', { only: ['musthave', 'darkside', 'sebero', 'element'] }),
  tarragon: flavor('тархун', { only: ['musthave', 'darkside', 'blackburn', 'starline'] }),
  basil: flavor('базилик', { only: ['darkside', 'musthave'], names: { darkside: 'Basil Blast' } }),
  needles: flavor('хвоя / ель', { only: ['darkside', 'blackburn'], names: { darkside: 'Needls' } }),
  doubleapple: flavor('двойное яблоко', { only: ['alfakher', 'starline', 'musthave', 'darkside', 'element'] }),
  mint: flavor('мята', { only: [...WIDE, 'alfakher'] }),
  ice: flavor('холодок (ice)', { only: ['darkside', 'musthave', 'blackburn', 'starline', 'element'], names: { darkside: 'Supernova' } }),
};

// sweet: 0 — кислый … 10 — сладкий
// body: 0 — свежий/лёгкий … 10 — плотный/десертный
// mint / ice: 2 — отлично сочетается, 1 — допустимо, 0 — лучше не добавлять
const RECIPES = [
  {
    name: 'Арбуз и дыня', parts: [['watermelon', 60], ['melon', 40]],
    sweet: 7, body: 3, cats: ['fruit'], mint: 2, ice: 2,
    desc: 'Летний сочный микс: арбуз даёт водянистую свежесть, дыня — медовую сладость и тело. Очень лёгкий и «питкий» вкус.',
  },
  {
    name: 'Розовый лимонад', parts: [['grapefruit', 50], ['raspberry', 50]],
    sweet: 4, body: 3, cats: ['citrus', 'berry', 'drink'], mint: 1, ice: 2,
    desc: 'Горчинка и кислинка грейпфрута смягчаются спелой малиной: выходит розовый лимонад с ягодным послевкусием.',
  },
  {
    name: 'Тропический сок', parts: [['mango', 60], ['passionfruit', 40]],
    sweet: 6, body: 4, cats: ['tropic'], mint: 1, ice: 2,
    desc: 'Густой сладкий манго и ароматная кисловатая маракуйя, как мультифруктовый нектар. Один из самых популярных тропических миксов.',
  },
  {
    name: 'Клубнично-банановый смузи', parts: [['strawberry', 60], ['banana', 40]],
    sweet: 8, body: 6, cats: ['berry', 'fruit', 'dessert'], mint: 1, ice: 1,
    desc: 'Яркая клубника на мягкой сливочной подложке из банана. Сладко, плотно, как молочный коктейль.',
  },
  {
    name: 'Вишнёвая кола', parts: [['cherry', 50], ['cola', 50]],
    sweet: 6, body: 5, cats: ['drink', 'berry'], mint: 1, ice: 2,
    desc: 'Классика газировок: пряная кола с косточковой вишней. Узнаваемо с первой затяжки.',
  },
  {
    name: 'Мохито', parts: [['lime', 50], ['mint', 30], ['lemon', 20]],
    sweet: 3, body: 1, cats: ['citrus', 'drink', 'herbal'], mint: 'built', ice: 2,
    desc: 'Лайм с лимоном и большой порцией мяты, как безалкогольный мохито. Кислый, бодрящий, освежающий.',
  },
  {
    name: 'Черника с лимоном', parts: [['blueberry', 60], ['lemon', 40]],
    sweet: 4, body: 3, cats: ['berry', 'citrus'], mint: 2, ice: 2,
    desc: 'Тёмная сладкая черника, которую лимон делает ярче и не даёт уйти в приторность.',
  },
  {
    name: 'Персиковый холодный чай', parts: [['peach', 50], ['blacktea', 30], ['lemon', 20]],
    sweet: 5, body: 4, cats: ['drink', 'fruit'], mint: 1, ice: 2,
    desc: 'Айс-ти: терпкий чёрный чай, сочный персик и долька лимона. Сбалансированный и долгий.',
  },
  {
    name: 'Яблочный пирог', parts: [['apple', 50], ['cream', 30], ['cinnamon', 20]],
    sweet: 8, body: 8, cats: ['dessert', 'fruit'], mint: 0, ice: 0,
    desc: 'Печёное яблоко, ванильный крем и корица, как штрудель. Тёплый осенний десерт.',
    tip: 'Корица быстро забивает остальное, поэтому больше 20% не кладите. Жар держите мягким.',
  },
  {
    name: 'Киви и яблоко', parts: [['kiwi', 50], ['apple', 50]],
    sweet: 3, body: 2, cats: ['fruit'], mint: 2, ice: 2,
    desc: 'Зелёный кисло-сладкий микс: хрустящее яблоко и сочный киви. Очень свежо.',
  },
  {
    name: 'Малиновый лимонад', parts: [['raspberry', 60], ['lemon', 40]],
    sweet: 5, body: 3, cats: ['berry', 'citrus', 'drink'], mint: 2, ice: 2,
    desc: 'Сладкая малина и лимонная кислинка, как домашний лимонад. Беспроигрышный вариант для компании.',
  },
  {
    name: 'Пина колада', parts: [['pineapple', 50], ['coconut', 40], ['cream', 10]],
    sweet: 8, body: 6, cats: ['tropic', 'dessert', 'drink'], mint: 0, ice: 1,
    desc: 'Сочный ананас, кокосовая стружка и капля сливок. Сладкий пляжный коктейль.',
  },
  {
    name: 'Баунти', parts: [['coconut', 60], ['chocolate', 40]],
    sweet: 9, body: 9, cats: ['dessert'], mint: 1, ice: 0,
    desc: 'Кокос в молочном шоколаде. Плотный десертный вкус для любителей сладкого.',
    tip: 'Десерты легко пригорают, так что жар нужен поменьше и прогрев подольше.',
  },
  {
    name: 'Манго с рисом', parts: [['milkyrice', 50], ['mango', 50]],
    sweet: 8, body: 7, cats: ['dessert', 'tropic'], mint: 0, ice: 0,
    desc: 'Тайский десерт mango sticky rice: молочный рисовый пудинг и спелый манго.',
  },
  {
    name: 'Клубника со сливками', parts: [['strawberry', 60], ['cream', 40]],
    sweet: 9, body: 7, cats: ['berry', 'dessert'], mint: 0, ice: 1,
    desc: 'Спелая клубника под сливочно-ванильным кремом. Мягко и очень сладко.',
  },
  {
    name: 'Земляника с лимоном', parts: [['wildstrawberry', 60], ['lemon', 40]],
    sweet: 5, body: 3, cats: ['berry', 'citrus'], mint: 1, ice: 2,
    desc: 'Душистая лесная земляника с лимонной свежестью. Ароматнее клубничных миксов.',
  },
  {
    name: 'Тёмные ягоды', parts: [['grape', 60], ['blueberry', 40]],
    sweet: 6, body: 5, cats: ['berry', 'fruit'], mint: 2, ice: 2,
    desc: 'Тёмный виноград и черника, глубокий сладкий ягодный вкус. С мятой получается классика кальянных.',
  },
  {
    name: 'Хвойный лес', parts: [['needles', 30], ['blueberry', 40], ['blackcurrant', 30]],
    sweet: 4, body: 4, cats: ['herbal', 'berry'], mint: 1, ice: 2,
    desc: 'Свежая еловая хвоя с лесными ягодами, как прогулка по зимнему лесу. Необычно, но очень гармонично.',
    tip: 'Хвоя очень яркая: больше 30% не кладите, иначе будет «освежитель воздуха».',
  },
  {
    name: 'Арбуз с лаймом', parts: [['watermelon', 70], ['lime', 30]],
    sweet: 5, body: 2, cats: ['fruit', 'citrus'], mint: 2, ice: 2,
    desc: 'Сочный арбуз с кислинкой лайма, как арбузная агуа фреска. Освежает в жару.',
  },
  {
    name: 'Гранат и грейпфрут', parts: [['pomegranate', 50], ['grapefruit', 50]],
    sweet: 3, body: 3, cats: ['fruit', 'citrus'], mint: 1, ice: 2,
    desc: 'Терпкий гранат и горьковатый грейпфрут: кислый взрослый микс без лишней сладости.',
  },
  {
    name: 'Чай с лимоном', parts: [['blacktea', 70], ['lemon', 30]],
    sweet: 3, body: 4, cats: ['drink'], mint: 2, ice: 1,
    desc: 'Крепкий чёрный чай с лимоном. Простой, уютный, не надоедает.',
  },
  {
    name: 'Цитрусовая маракуйя', parts: [['passionfruit', 40], ['orange', 40], ['lemon', 20]],
    sweet: 4, body: 3, cats: ['tropic', 'citrus'], mint: 1, ice: 2,
    desc: 'Апельсиновый фреш с маракуйей и лимоном. Кисло-сладкий и очень яркий.',
  },
  {
    name: 'Персик и маракуйя', parts: [['peach', 60], ['passionfruit', 40]],
    sweet: 6, body: 4, cats: ['fruit', 'tropic'], mint: 1, ice: 2,
    desc: 'Бархатный персик с экзотичной кислинкой маракуйи. Сочно и сбалансированно.',
  },
  {
    name: 'Шварцвальд', parts: [['cherry', 60], ['chocolate', 40]],
    sweet: 8, body: 8, cats: ['dessert', 'berry'], mint: 0, ice: 0,
    desc: 'Вишня в шоколаде, как торт «Чёрный лес». Плотный, сладкий, с кислинкой.',
  },
  {
    name: 'Малиновый чизкейк', parts: [['cheesecake', 60], ['raspberry', 40]],
    sweet: 8, body: 8, cats: ['dessert', 'berry'], mint: 0, ice: 0,
    desc: 'Сливочный творожный чизкейк с малиновым соусом. Малина не даёт десерту стать приторным.',
  },
  {
    name: 'Дыня и манго', parts: [['melon', 50], ['mango', 50]],
    sweet: 7, body: 4, cats: ['fruit', 'tropic'], mint: 1, ice: 2,
    desc: 'Два «медовых» фрукта вместе: сладкий, сочный, мягкий микс.',
  },
  {
    name: 'Ананас и лайм', parts: [['pineapple', 60], ['lime', 40]],
    sweet: 4, body: 3, cats: ['tropic', 'citrus'], mint: 2, ice: 2,
    desc: 'Кисло-сладкий ананас с лаймом. Тропическая свежесть без приторности.',
  },
  {
    name: 'Тархун', parts: [['tarragon', 70], ['lemon', 30]],
    sweet: 5, body: 3, cats: ['drink', 'herbal'], mint: 1, ice: 2,
    desc: 'Тот самый зелёный лимонад из детства: эстрагон с лимоном.',
  },
  {
    name: 'Клубника с базиликом', parts: [['strawberry', 60], ['basil', 20], ['lemon', 20]],
    sweet: 5, body: 3, cats: ['berry', 'herbal'], mint: 0, ice: 1,
    desc: 'Барный приём: клубника, свежий базилик и лимон. Зелень подчёркивает ягоду.',
    tip: 'Базилик сам по себе травяной, мята здесь будет лишней.',
  },
  {
    name: 'Киви и клубника', parts: [['kiwi', 50], ['strawberry', 50]],
    sweet: 6, body: 3, cats: ['fruit', 'berry'], mint: 1, ice: 2,
    desc: 'Классика соков: сладкая клубника и кисловатый киви.',
  },
  {
    name: 'Абрикос и персик', parts: [['apricot', 50], ['peach', 50]],
    sweet: 7, body: 5, cats: ['fruit'], mint: 1, ice: 1,
    desc: 'Две «косточковые» сладости, как абрикосовый джем. Мягкий и тёплый вкус.',
  },
  {
    name: 'Ягодный морс', parts: [['blackcurrant', 40], ['raspberry', 30], ['blueberry', 30]],
    sweet: 5, body: 4, cats: ['berry', 'drink'], mint: 2, ice: 2,
    desc: 'Смородина, малина и черника, как бабушкин морс. Кисло-сладкий с лёгкой терпкостью.',
  },
  {
    name: 'Двойное яблоко', parts: [['doubleapple', 100]],
    sweet: 5, body: 6, cats: ['fruit'], mint: 2, ice: 1,
    desc: 'Кальянная классика: красное и зелёное яблоко с нотой аниса. Вкус «старой школы».',
  },
  {
    name: 'Зелёный микс', parts: [['feijoa', 50], ['kiwi', 30], ['lime', 20]],
    sweet: 4, body: 3, cats: ['fruit', 'citrus'], mint: 2, ice: 2,
    desc: 'Фейхоа, киви и лайм. Зелёная кисло-сладкая свежесть с цветочной ноткой фейхоа.',
  },
  {
    name: 'Дюшес', parts: [['pear', 70], ['lemon', 30]],
    sweet: 6, body: 3, cats: ['fruit', 'drink'], mint: 1, ice: 2,
    desc: 'Грушевый лимонад из детства: сочная груша с лимонной газировкой.',
  },
  {
    name: 'Апельсин в шоколаде', parts: [['orange', 50], ['chocolate', 50]],
    sweet: 7, body: 8, cats: ['dessert', 'citrus'], mint: 1, ice: 0,
    desc: 'Тёмный шоколад с апельсиновой цедрой. Новогоднее настроение в любое время.',
  },
  {
    name: 'Куба либре', parts: [['cola', 70], ['lime', 30]],
    sweet: 5, body: 4, cats: ['drink', 'citrus'], mint: 1, ice: 2,
    desc: 'Кола с лаймом, как безалкогольная «Куба либре». Освежающая газировка с кислинкой.',
  },
  {
    name: 'Грушевый десерт', parts: [['pear', 60], ['cream', 40]],
    sweet: 7, body: 6, cats: ['fruit', 'dessert'], mint: 0, ice: 0,
    desc: 'Груша в ванильном креме, как десерт «Belle Hélène» без шоколада. Нежный и мягкий.',
  },
];
