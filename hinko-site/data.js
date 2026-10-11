/* ============================================================
   ВСЕ, ЧТО НУЖНО МЕНЯТЬ НА САЙТЕ, — В ЭТОМ ФАЙЛЕ
   Цены: впишите число в price (например price: 450) — на карточке
   появится плашка «450 ₽». Пока price пустой — плашки нет.
   ============================================================ */
window.HINKO = {
  name: "ХИНКО",
  tagline: "Грузинская кухня · Уфа",
  brandLine: "Хинкали · Халяль",
  // Контакты. Пустое поле на сайте просто не показывается.
  phone: "+7 993 138-01-09",
  address: "г. Уфа, проспект Октября, 135/1, 4 этаж",
  telegram: "https://t.me/hinko_ufa",
  email: "hinkoufa@gmail.com",
  twogis: "https://2gis.ru/ufa/firm/70000001117638243", // карточка кафе в 2ГИС
  rating: "4.9",
  orderCtaLabel: "Собрать заказ",
  whatsapp: "79373231005",
  categories: [
    { id: "khinkali", name: "Хинкали" },
    { id: "bakery", name: "Хачапури" },
    { id: "soups", name: "Супы" },
    { id: "salads", name: "Салаты" },
    { id: "sauces", name: "Соусы" },
    { id: "drinks", name: "Напитки" }
  ],
  ui: {
    categoriesLabel: "Категории меню",
    allCategories: "Всё меню",
    add: "Добавить",
    added: "Добавлено в заказ",
    close: "Закрыть",
    details: "Подробнее",
    chooseFilling: "Выбери начинку",
    chooseVariant: "Выберите вариант",
    fillingPrice: "Цена",
    unavailablePrice: "Цена уточняется",
    unavailableDish: "Позиция временно недоступна для заказа",
    hit: "Хит",
    new: "Новинка",
    spicy: "Острое",
    order: "Заказ",
    emptyOrder: "В заказе пока пусто",
    decrease: "Уменьшить количество",
    increase: "Увеличить количество",
    remove: "Убрать из заказа",
    total: "Итого",
    customerName: "Имя",
    customerPhone: "Телефон",
    namePlaceholder: "Ваше имя",
    phonePlaceholder: "+7",
    phonePrefix: "+7",
    phoneInvalid: "Введите 10 цифр номера после +7.",
    sendOrder: "Оформить заказ",
    mapKicker: "Мы на карте",
    mapTitle: "Как добраться",
    mapRoute: "Построить маршрут",
    mapAccessibleLabel: "Карта проезда к кафе ХИНКО",
    mapAddressLabel: "Адрес",
    mapPhoneLabel: "Телефон",
    mapHoursLabel: "Режим работы",
    reserveAction: "Забронировать",
    callAction: "Позвонить",
    consentPersonal: "Согласен на обработку персональных данных (документ: ",
    consentTerms: "Принимаю ",
    consentPrivacy: "Политики",
    consentAgreement: "Согласия",
    consentOffer: "оферты",
    legalTemplateLabel: "Юридическая информация",
    legalTemplateNotice: "Текст документа пока не предоставлен.",
    legalBackLabel: "Вернуться на сайт",
    emptyCartError: "Добавьте в заказ хотя бы одну позицию.",
    whatsappUnavailable: "Не удалось открыть WhatsApp. Проверьте настройки браузера.",
    cartStorageError: "Корзина не сохранится после закрытия страницы: браузер ограничил доступ к хранилищу.",
    messageIntro: "Здравствуйте! Хочу оформить заказ:",
    requiredField: "Обязательное поле",
    footerNavigation: "Разделы",
    footerContacts: "Контакты",
    footerActions: "Ссылки",
    footerAddress: "Адрес",
    footerPhone: "Телефон",
    footerEmail: "Почта",
    footerTelegram: "Telegram",
    footerOrder: "Заказать в WhatsApp",
    footerMap: "Открыть в 2ГИС",
    footerRoute: "Отзывы, фото и маршрут"
  },
  reservation: { action: "Забронировать" },
  legalPages: {
    privacy: "privacy.html",
    consent: "consent.html",
    offer: "offer.html"
  },
  legalDocuments: {
    privacy: { title: "Политика обработки персональных данных", content: [] },
    consent: { title: "Согласие на обработку персональных данных", content: [] },
    offer: { title: "Оферта", content: [] }
  },

  hours: [
    { name: "Пн — Чт", open: "12:00", close: "22:00" },
    { name: "Пт — Вс", open: "Выходной", close: null, closed: true }
  ],

  // size: "s8" (широкая), "s4" (узкая/вертикальная), "s12" (на всю ширину)
  menu: [
    { name: "Хинкали", cat: "khinkali", hit: false, spicy: false, isNew: false, size: "s8", img: "img/khinkali.jpg", tag: "5 начинок", price: null,
      desc: "Сочные грузинские хинкали ручной лепки. 100% халяль.",
      items: [
        { n: "С говядиной", p: 80, img: "img/khinkali-beef.jpg", desc: "Сочные грузинские хинкали ручной лепки с начинкой из говядины, специй и зелени. Внутри горячий ароматный бульон. Халяль." },
        { n: "С бараниной", p: 90, img: "img/khinkali-lamb.jpg" },
        { n: "С кониной", p: 80, img: "img/khinkali-horse.jpg", desc: "Хинкали с сочной начинкой из конины. Необычный мясной вкус и горячий бульон внутри." },
        { n: "С курицей и копчёным сулугуни", p: 80, img: "img/khinkali-chicken.jpg", desc: "Нежная курица и копчёный сулугуни. Мягкий сливочно-сырный вкус, совсем без остроты." },
        { n: "С грибным рагу", p: 70, img: "img/khinkali-mushroom.jpg", desc: "Сочная начинка из грибного рагу. Ароматная мясная альтернатива без мяса." }
      ] },
    { name: "Хинкали с говядиной.", cat: "khinkali", hit: false, spicy: false, isNew: false, size: "s4", img: "img/khinkali-beef.jpg", price: 80,
      desc: "Сочные грузинские хинкали ручной лепки с начинкой из говядины, специй и зелени. Внутри горячий ароматный бульон. Халяль." },
    { name: "Хинкали с бараниной.", cat: "khinkali", hit: false, spicy: false, isNew: false, size: "s4", img: "img/khinkali-lamb.jpg", price: 90 },
    { name: "Хинкали с кониной.", cat: "khinkali", hit: false, spicy: false, isNew: false, size: "s4", img: "img/khinkali-horse.jpg", price: 80,
      desc: "Хинкали с сочной начинкой из конины. Необычный мясной вкус и горячий бульон внутри." },
    { name: "Хинкали с курицей и копчёным сулугунив.", cat: "khinkali", hit: false, spicy: false, isNew: false, size: "s4", img: "img/khinkali-chicken.jpg", price: 80,
      desc: "Нежная курица и копчёный сулугуни. Мягкий сливочно-сырный вкус, совсем без остроты." },
    { name: "Хинкали с грибным рагу.", cat: "khinkali", hit: false, spicy: false, isNew: false, size: "s4", img: "img/khinkali-mushroom.jpg", price: 70,
      desc: "Сочная начинка из грибного рагу. Ароматная мясная альтернатива без мяса." },
    { name: "Хачапури по-аджарски", cat: "bakery", hit: false, spicy: false, isNew: false, size: "s4", img: "img/adjarian.jpg", price: 560,
      desc: "Горячая лодочка из теста с сыром, желтком и сливочным маслом." },
    { name: "Суп Харчо", cat: "soups", hit: false, spicy: false, isNew: false, size: "s4", img: "img/kharcho.jpg", price: 320,
      desc: "Густой грузинский суп с насыщенным пряным вкусом." },
    { name: "Суп Хаш из баранины", cat: "soups", hit: false, spicy: false, isNew: false, size: "s4", img: "img/khashi.jpg", price: 300,
      desc: "Наваристый хаш из баранины с насыщенным мясным вкусом. Подаётся с чесноком." },
    { name: "Хачапури по-мегрельски", cat: "bakery", hit: false, spicy: false, isNew: false, size: "s4", img: "img/imeretian.jpg", price: 580,
      desc: "Хачапури с большим количеством сыра внутри и румяным сыром сверху." },
    { name: "Салат с хрустящим баклажаном", cat: "salads", hit: false, spicy: false, isNew: true, size: "s4", img: "img/story-baklazhan-dish.jpg", price: null, tag: "новинка",
      desc: "Сочные томаты, хрустящие баклажаны и грецкий орех на нежном йогурте." },
    { name: "Грузинский салат", cat: "salads", hit: false, spicy: false, isNew: true, size: "s4", img: "img/story-georgian-dish.jpg", price: null, tag: "новинка",
      desc: "Томаты, свежие огурчики, лук и нежная ореховая заправка." },
    { name: "Компот дня", cat: "drinks", hit: false, spicy: false, isNew: false, size: "s4", img: "img/uzvar.jpg", price: 150,
      desc: "Домашний компот, сваренный из сухофруктов. Кладезь витаминов." },
    { name: "Соусы", cat: "sauces", hit: false, spicy: false, isNew: false, size: "s12", img: "img/sauces.jpg", price: null,
      desc: "Грузинские соусы к хинкали и хачапури.",
      items: [
        { n: "Ткемали", p: 70, focus: "50% 38%" },
        { n: "Сметанный", p: 70, focus: "80% 62%" },
        { n: "Сацебели", p: 70, focus: "20% 62%" }
      ] }
  ]
};
