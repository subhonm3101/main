(function(){
  var D = window.HINKO || {};
  var $ = function(id){ return document.getElementById(id); };
  var legalPageKey = document.body.dataset.legalPage;
  if (legalPageKey) {
    var legalDocument = D.legalDocuments && D.legalDocuments[legalPageKey];
    if (!legalDocument) {
      console.error('Не найдены данные юридической страницы: ' + legalPageKey);
      return;
    }
    $('legalKicker').textContent = D.ui.legalTemplateLabel;
    $('legalTitle').textContent = legalDocument.title;
    var legalNotice = $('legalNotice');
    var legalContent = Array.isArray(legalDocument.content) ? legalDocument.content : [];
    if (legalContent.length) {
      legalContent.forEach(function(text){
        var paragraph = document.createElement('p');
        paragraph.textContent = text;
        legalNotice.appendChild(paragraph);
      });
    } else {
      legalNotice.textContent = D.ui.legalTemplateNotice;
    }
    $('legalBack').textContent = D.ui.legalBackLabel;
    document.title = legalDocument.title + ' — ХИНКО';
    return;
  }

  /* ---- меню, варианты и фильтрация ---- */
  var menuItems = D.menu || [];
  var categories = D.categories || [];
  var ui = D.ui || {};
  var grid = $('menuGrid');
  var categoryTabs = $('categoryTabs');
  var currentCategory = 'all';
  var dishDialog = $('dishDialog');
  var dishDialogContent = $('dishDialogContent');
  var orderDialog = $('orderDialog');
  var orderDialogContent = $('orderDialogContent');
  var orderFab = $('orderFab');
  var activeDishIndex = -1;
  var activeVariantIndex = -1;
  var storageAvailable = true;
  var cart = loadCart();
  var money = new Intl.NumberFormat('ru-RU');

  function formatPrice(value){
    return money.format(value) + ' ₽';
  }
  function getVariant(dish, variantIndex){
    return dish.items && variantIndex >= 0 ? dish.items[variantIndex] : null;
  }
  function getPrice(dish, variantIndex){
    var variant = getVariant(dish, variantIndex);
    return variant ? variant.p : dish.price;
  }
  function canOrder(dish, variantIndex){
    var price = getPrice(dish, variantIndex);
    return typeof price === 'number' && isFinite(price) && price > 0;
  }
  function cartEntryName(entry){
    var dish = menuItems[entry.dishIndex];
    var variant = getVariant(dish, entry.variantIndex);
    return dish.name + (variant ? ' — ' + variant.n : '');
  }
  function cartLineTotal(entry){
    return getPrice(menuItems[entry.dishIndex], entry.variantIndex) * entry.qty;
  }
  function cartQuantity(){
    return cart.reduce(function(total, entry){ return total + entry.qty; }, 0);
  }
  function cartTotal(){
    return cart.reduce(function(total, entry){ return total + cartLineTotal(entry); }, 0);
  }
  function cartKey(dishIndex, variantIndex){
    return dishIndex + ':' + variantIndex;
  }
  function loadCart(){
    try {
      var stored = window.localStorage.getItem('hinko-order');
      var parsed = stored ? JSON.parse(stored) : [];
      if (!Array.isArray(parsed)) throw new Error('Cart storage must contain an array.');
      return parsed.filter(function(entry){
        var dish = menuItems[entry.dishIndex];
        return dish && Number.isInteger(entry.variantIndex) && Number.isInteger(entry.qty) &&
          entry.variantIndex >= -1 && entry.id === cartKey(entry.dishIndex, entry.variantIndex) &&
          entry.qty > 0 && canOrder(dish, entry.variantIndex) &&
          (entry.variantIndex < 0 || (dish.items && dish.items[entry.variantIndex]));
      });
    } catch (error) {
      storageAvailable = false;
      console.warn('Не удалось прочитать сохранённую корзину.', error);
      return [];
    }
  }
  function saveCart(){
    try {
      window.localStorage.setItem('hinko-order', JSON.stringify(cart));
      storageAvailable = true;
    } catch (error) {
      storageAvailable = false;
      console.warn('Не удалось сохранить корзину.', error);
    }
  }
  function createButton(label, className, onClick, ariaLabel){
    var button = document.createElement('button');
    button.type = 'button';
    button.className = className || '';
    button.textContent = label;
    if (ariaLabel) button.setAttribute('aria-label', ariaLabel);
    button.addEventListener('click', onClick);
    return button;
  }
  function createFlag(item, index, className){
    var button = document.createElement('button');
    button.type = 'button';
    button.className = className;
    button.setAttribute('aria-label', item.n);
    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 32 32');
    var line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', '5');
    line.setAttribute('y1', '2');
    line.setAttribute('x2', '5');
    line.setAttribute('y2', '30');
    var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', 'M6 3h23l-7 7 7 7H6z');
    path.setAttribute('fill', ['#842719','#D9A441','#2A1710','#5E6B3A','#FBF3E4'][index % 5]);
    svg.appendChild(line);
    svg.appendChild(path);
    var name = document.createElement('span');
    name.textContent = item.n;
    button.appendChild(svg);
    button.appendChild(name);
    return button;
  }
  function renderCategories(){
    categoryTabs.textContent = '';
    categoryTabs.setAttribute('role', 'group');
    categoryTabs.setAttribute('aria-label', ui.categoriesLabel || '');
    var allCategories = [{ id: 'all', name: ui.allCategories }].concat(categories);
    allCategories.forEach(function(category){
      var tab = createButton(category.name, 'category-tab', function(){
        currentCategory = category.id;
        categoryTabs.querySelectorAll('.category-tab').forEach(function(button, index){
          button.setAttribute('aria-pressed', allCategories[index].id === currentCategory ? 'true' : 'false');
        });
        menuItems.forEach(function(dish, index){
          var card = grid.querySelector('[data-dish-index="' + index + '"]');
          card.hidden = category.id !== 'all' && dish.cat !== category.id;
        });
      });
      tab.setAttribute('aria-pressed', currentCategory === category.id ? 'true' : 'false');
      categoryTabs.appendChild(tab);
    });
  }
  function renderDishes(){
    menuItems.forEach(function(dish, dishIndex){
      var card = document.createElement('article');
      card.className = 'dish ' + (dish.size || 's4');
      card.dataset.dishIndex = dishIndex;
      var openButton = document.createElement('button');
      openButton.type = 'button';
      openButton.className = 'dish-open';
      openButton.setAttribute('aria-label', ui.details + ': ' + dish.name);
      var imageWrap = document.createElement('span');
      imageWrap.className = 'dish-img';
      var image = document.createElement('img');
      if (dish.img) {
        image.src = dish.img;
        image.alt = dish.name;
        image.loading = 'lazy';
        imageWrap.appendChild(image);
      }
      var markers = document.createElement('span');
      markers.className = 'dish-markers';
      if (dish.hit) markers.appendChild(makeBadge(ui.hit, 'hit'));
      if (dish.isNew) markers.appendChild(makeBadge(ui.new, 'new'));
      if (dish.spicy) markers.appendChild(makeBadge(ui.spicy, 'spicy'));
      if (dish.tag && !dish.isNew) markers.appendChild(makeBadge(dish.tag, ''));
      if (dish.price) {
        var price = document.createElement('span');
        price.className = 'price';
        price.textContent = formatPrice(dish.price);
        imageWrap.appendChild(price);
      }
      if (markers.childNodes.length) imageWrap.appendChild(markers);
      openButton.appendChild(imageWrap);
      var body = document.createElement('span');
      body.className = 'dish-body';
      var title = document.createElement('span');
      title.className = 'dish-title';
      title.textContent = dish.name;
      body.appendChild(title);
      if (dish.desc) {
        var description = document.createElement('span');
        description.className = 'dish-description';
        description.textContent = dish.desc;
        body.appendChild(description);
      }
      if (dish.items) {
        var options = document.createElement('span');
        options.className = 'items';
        dish.items.forEach(function(item){
          var option = document.createElement('span');
          option.className = 'item-preview';
          var name = document.createElement('span');
          name.textContent = item.n;
          option.appendChild(name);
          if (typeof item.p === 'number') {
            var itemPrice = document.createElement('b');
            itemPrice.textContent = formatPrice(item.p);
            option.appendChild(itemPrice);
          }
          options.appendChild(option);
        });
        body.appendChild(options);
      }
      openButton.appendChild(body);
      openButton.addEventListener('click', function(){ openDish(dishIndex); });
      card.appendChild(openButton);
      var action = document.createElement('div');
      action.className = 'dish-actions';
      action.appendChild(createButton(ui.details, 'dish-more', function(){ openDish(dishIndex); }));
      if (canOrder(dish, -1)) {
        action.appendChild(createButton(ui.add, 'btn btn-terra dish-add', function(){ addToCart(dishIndex, -1); }));
      } else if (!dish.items) {
        var unavailable = document.createElement('span');
        unavailable.className = 'dish-unavailable';
        unavailable.textContent = ui.unavailablePrice;
        action.appendChild(unavailable);
      } else {
        action.appendChild(createButton(ui.chooseVariant, 'btn btn-terra dish-add', function(){ openDish(dishIndex); }));
      }
      card.appendChild(action);
      grid.appendChild(card);
    });
  }
  function makeBadge(label, type){
    var badge = document.createElement('span');
    badge.className = 'badge' + (type ? ' badge-' + type : '');
    badge.textContent = label;
    return badge;
  }
  function renderFillingPicker(){
    var picker = $('fillingPicker');
    var fillingDishIndex = menuItems.findIndex(function(dish){ return dish.cat === 'khinkali' && dish.items; });
    if (fillingDishIndex < 0) return;
    var dish = menuItems[fillingDishIndex];
    var title = document.createElement('h3');
    title.textContent = ui.chooseFilling;
    var image = document.createElement('img');
    image.src = dish.img;
    image.alt = dish.name;
    image.loading = 'lazy';
    var flags = document.createElement('div');
    flags.className = 'filling-flags';
    flags.setAttribute('role', 'group');
    flags.setAttribute('aria-label', ui.chooseFilling);
    var selected = document.createElement('div');
    selected.className = 'filling-selected';
    function selectFilling(index){
      var item = dish.items[index];
      image.src = item.img || dish.img;
      image.alt = dish.name + ' — ' + item.n;
      flags.querySelectorAll('button').forEach(function(button, buttonIndex){
        button.setAttribute('aria-pressed', buttonIndex === index ? 'true' : 'false');
      });
      selected.textContent = '';
      var name = document.createElement('strong');
      name.textContent = item.n;
      selected.appendChild(name);
      if (typeof item.p === 'number') {
        var price = document.createElement('span');
        price.textContent = formatPrice(item.p);
        selected.appendChild(price);
      }
      if (item.desc || dish.desc) {
        var description = document.createElement('p');
        description.textContent = item.desc || dish.desc;
        selected.appendChild(description);
      }
      var add = createButton(ui.add, 'btn btn-terra', function(){ addToCart(fillingDishIndex, index); });
      add.disabled = !canOrder(dish, index);
      if (add.disabled) add.title = ui.unavailablePrice;
      selected.appendChild(add);
    }
    dish.items.forEach(function(item, index){
      var flag = createFlag(item, index, 'filling-flag');
      flag.setAttribute('aria-pressed', index === 0 ? 'true' : 'false');
      flag.addEventListener('click', function(){ selectFilling(index); });
      flags.appendChild(flag);
    });
    picker.appendChild(image);
    var content = document.createElement('div');
    content.className = 'filling-content';
    content.appendChild(title);
    content.appendChild(flags);
    content.appendChild(selected);
    picker.appendChild(content);
    selectFilling(0);
  }
  function openDish(dishIndex){
    activeDishIndex = dishIndex;
    activeVariantIndex = -1;
    renderDishDialog();
    dishDialog.showModal();
  }
  function renderDishDialog(){
    var dish = menuItems[activeDishIndex];
    dishDialogContent.textContent = '';
    var layout = document.createElement('div');
    layout.className = 'dish-dialog-layout';
    var close = createButton('×', 'dialog-close', function(){ dishDialog.close(); }, ui.close);
    var image = document.createElement('img');
    if (dish.img) image.src = new URL(dish.img, document.baseURI).href;
    else image.hidden = true;
    image.alt = dish.name;
    image.className = 'dish-dialog-image';
    image.addEventListener('error', function(){
      console.error('Не удалось загрузить фото блюда: ' + image.src);
    });
    var content = document.createElement('div');
    content.className = 'dish-dialog-copy';
    var title = document.createElement('h2');
    title.id = 'dishDialogTitle';
    title.textContent = dish.name;
    content.appendChild(title);
    if (dish.desc && !dish.items) {
      var description = document.createElement('p');
      description.textContent = dish.desc;
      content.appendChild(description);
    }
      var variantDescription = document.createElement('p');
      variantDescription.className = 'variant-description';
      if (dish.items && dish.items.length) content.appendChild(variantDescription);
    var price = document.createElement('p');
    price.className = 'dialog-price';
    var variantActions = document.createElement('div');
    variantActions.className = 'dialog-variants';
    var add = createButton(ui.add, 'btn btn-terra dialog-add', function(){
      addToCart(activeDishIndex, activeVariantIndex);
      dishDialog.close();
    });
    function updatePrice(){
      var variant = getVariant(dish, activeVariantIndex);
      var amount = getPrice(dish, activeVariantIndex);
      price.textContent = typeof amount === 'number' ? formatPrice(amount) : ui.unavailablePrice;
      add.disabled = !canOrder(dish, activeVariantIndex);
      if (variant) {
        image.src = new URL(variant.img || dish.img, document.baseURI).href;
        image.alt = dish.name + ' — ' + variant.n;
        variantDescription.textContent = variant.desc || dish.desc || '';
        variantDescription.hidden = !variantDescription.textContent;
        image.style.objectPosition = variant.focus || 'center';
      } else if (dish.img) {
        image.src = new URL(dish.img, document.baseURI).href;
        image.alt = dish.name;
        variantDescription.hidden = true;
      }
    }
    if (dish.items && dish.items.length) {
      var optionsTitle = document.createElement('h3');
      optionsTitle.textContent = ui.chooseVariant;
      content.appendChild(optionsTitle);
      var group = document.createElement('div');
      group.className = 'variant-options';
      group.setAttribute('role', 'group');
      group.setAttribute('aria-label', ui.chooseVariant);
      dish.items.forEach(function(item, index){
        var option = createButton(item.n + (typeof item.p === 'number' ? ' · ' + formatPrice(item.p) : ''), 'variant-option', function(){
          activeVariantIndex = index;
          group.querySelectorAll('button').forEach(function(button, buttonIndex){
            button.setAttribute('aria-pressed', buttonIndex === index ? 'true' : 'false');
          });
          updatePrice();
        });
        option.setAttribute('aria-pressed', index === 0 ? 'true' : 'false');
        option.disabled = !canOrder(dish, index);
        group.appendChild(option);
      });
      activeVariantIndex = 0;
      variantActions.appendChild(group);
      content.appendChild(variantActions);
    }
    content.appendChild(price);
    content.appendChild(add);
    layout.appendChild(close);
    layout.appendChild(image);
    layout.appendChild(content);
    dishDialogContent.appendChild(layout);
    updatePrice();
  }
  function addToCart(dishIndex, variantIndex){
    var dish = menuItems[dishIndex];
    if (!dish || !canOrder(dish, variantIndex)) return;
    var key = cartKey(dishIndex, variantIndex);
    var existing = cart.filter(function(entry){ return entry.id === key; })[0];
    if (existing) existing.qty += 1;
    else cart.push({ id: key, dishIndex: dishIndex, variantIndex: variantIndex, qty: 1 });
    saveCart();
    renderOrderButton();
  }
  function updateCartEntry(id, change){
    var entry = cart.filter(function(item){ return item.id === id; })[0];
    if (!entry) return;
    entry.qty += change;
    if (entry.qty <= 0) cart = cart.filter(function(item){ return item.id !== id; });
    saveCart();
    renderOrderButton();
    renderOrderDialog();
  }
  function removeCartEntry(id){
    cart = cart.filter(function(item){ return item.id !== id; });
    saveCart();
    renderOrderButton();
    renderOrderDialog();
  }
  function renderOrderButton(){
    orderFab.hidden = cart.length === 0;
    orderFab.textContent = ui.order + ' (' + cartQuantity() + ') · ' + formatPrice(cartTotal());
    orderFab.setAttribute('aria-label', orderFab.textContent);
  }
  function renderOrderDialog(){
    orderDialogContent.textContent = '';
    var head = document.createElement('div');
    head.className = 'order-dialog-head';
    var title = document.createElement('h2');
    title.id = 'orderDialogTitle';
    title.textContent = ui.order;
    head.appendChild(title);
    head.appendChild(createButton('×', 'dialog-close', function(){ orderDialog.close(); }, ui.close));
    orderDialogContent.appendChild(head);
    if (cart.length) {
      var list = document.createElement('ul');
      list.className = 'cart-list';
      cart.forEach(function(entry){
        var row = document.createElement('li');
        row.className = 'cart-item';
        var details = document.createElement('div');
        details.className = 'cart-item-details';
        var name = document.createElement('strong');
        name.textContent = cartEntryName(entry);
        var subtotal = document.createElement('span');
        subtotal.textContent = formatPrice(cartLineTotal(entry));
        details.appendChild(name);
        details.appendChild(subtotal);
        var controls = document.createElement('div');
        controls.className = 'quantity-controls';
        controls.appendChild(createButton('−', 'quantity-button', function(){ updateCartEntry(entry.id, -1); }, ui.decrease));
        var quantity = document.createElement('span');
        quantity.textContent = entry.qty;
        controls.appendChild(quantity);
        controls.appendChild(createButton('+', 'quantity-button', function(){ updateCartEntry(entry.id, 1); }, ui.increase));
        controls.appendChild(createButton('×', 'quantity-remove', function(){ removeCartEntry(entry.id); }, ui.remove));
        row.appendChild(details);
        row.appendChild(controls);
        list.appendChild(row);
      });
      orderDialogContent.appendChild(list);
    } else {
      var empty = document.createElement('p');
      empty.className = 'empty-cart';
      empty.textContent = ui.emptyOrder;
      orderDialogContent.appendChild(empty);
    }
    var total = document.createElement('p');
    total.className = 'cart-total';
    var totalLabel = document.createElement('strong');
    totalLabel.textContent = ui.total;
    var totalValue = document.createElement('strong');
    totalValue.textContent = formatPrice(cartTotal());
    total.appendChild(totalLabel);
    total.appendChild(totalValue);
    orderDialogContent.appendChild(total);
    var form = document.createElement('form');
    form.className = 'order-form';
    form.addEventListener('submit', submitOrder);
    var status = document.createElement('p');
    status.className = 'order-status';
    status.setAttribute('role', 'status');
    if (!storageAvailable) status.textContent = ui.cartStorageError;
    form.appendChild(status);
    var submit = document.createElement('button');
    submit.type = 'submit';
    submit.className = 'btn btn-terra order-submit';
    submit.textContent = ui.orderSubmit || ui.sendOrder;
    submit.disabled = cart.length === 0;
    form.appendChild(submit);
    orderDialogContent.appendChild(form);
  }
  function submitOrder(event){
    event.preventDefault();
    var status = orderDialogContent.querySelector('.order-status');
    if (!cart.length) {
      status.textContent = ui.emptyCartError;
      return;
    }
    var number = String(D.telegramPhone || '').replace(/\D/g, '');
    if (!/^\d{10,15}$/.test(number)) {
      status.textContent = ui.telegramUnavailable;
      return;
    }
    var lines = cart.map(function(entry){
      return '• ' + cartEntryName(entry) + ' × ' + entry.qty + ' — ' + formatPrice(cartLineTotal(entry));
    });
    var message = [
      ui.messageIntro,
      '',
      lines.join('\n'),
      '',
      ui.total + ': ' + formatPrice(cartTotal())
    ].join('\n');
    var url = 'https://t.me/+' + number + '?text=' + encodeURIComponent(message);
    var popup = window.open(url, '_blank');
    if (!popup) {
      status.textContent = ui.telegramUnavailable;
      return;
    }
    popup.opener = null;
  }
  renderCategories();
  renderDishes();
  renderFillingPicker();
  renderOrderButton();
  function openOrderDialog(){
    renderOrderDialog();
    orderDialog.showModal();
  }
  orderFab.addEventListener('click', openOrderDialog);
  [dishDialog, orderDialog].forEach(function(dialog){
    dialog.addEventListener('click', function(event){
      if (event.target === dialog) dialog.close();
    });
  });
  window.addEventListener('keydown', function(event){
    if (event.key !== 'Escape') return;
    if (dishDialog.open) dishDialog.close();
    else if (orderDialog.open) orderDialog.close();
  });

  var contest = D.contest;
  if (contest && contest.title) {
    $('contestScript').textContent = contest.script || '';
    $('contestTitle').textContent = contest.title;
    $('contestLead').textContent = contest.lead || '';
    (contest.steps || []).forEach(function(step){
      var li = document.createElement('li');
      li.textContent = step;
      $('contestSteps').appendChild(li);
    });
    $('contestNote').textContent = contest.note || '';
    $('contestDateLabel').textContent = contest.dateLabel || '';
    $('contestDate').textContent = contest.date || '';
    if (D.instagram) {
      $('contestLink').href = D.instagram;
      $('contestLink').textContent = contest.linkLabel || '';
    } else {
      $('contestLink').hidden = true;
    }
    $('contest').hidden = false;
  }
  /* ---- ссылки 2ГИС / рейтинг ---- */  $('mapKicker').textContent = ui.mapKicker || '';
  $('mapTitle').textContent = ui.mapTitle || '';
  $('mapAddressLabel').textContent = ui.mapAddressLabel || '';
  $('mapPhoneLabel').textContent = ui.mapPhoneLabel || '';
  $('mapHoursLabel').textContent = ui.mapHoursLabel || '';
  $('yandexMap').title = ui.mapAccessibleLabel || '';
  $('mapAddress').textContent = D.address || '';
  if (D.phone) {
    var mapPhone = $('mapPhone');
    mapPhone.href = 'tel:' + D.phone.replace(/[^+\d]/g, '');
    mapPhone.textContent = D.phone;
    mapPhone.hidden = false;
  }
  var findUs = D.findUs;
  if (findUs && findUs.steps && findUs.steps.length) {
    $('findUsTitle').textContent = findUs.title || '';
    $('findUsAddress').textContent = findUs.address || '';
    findUs.steps.forEach(function(step){
      var li = document.createElement('li');
      li.textContent = step;
      $('findUsSteps').appendChild(li);
    });
    $('findUs').hidden = false;
  }
  if (D.address) {
    var encodedAddress = encodeURIComponent(D.address);
    $('yandexMap').src = 'https://yandex.ru/map-widget/v1/?text=' + encodedAddress + '&z=16';
    $('yandexRoute').href = 'https://yandex.ru/maps/?text=' + encodedAddress;
    $('yandexRoute').textContent = ui.mapRoute || '';
    $('yandexRoute').hidden = false;
  } else {
    $('yandexMap').hidden = true;
  }
  $('footerName').textContent = D.name || '';
  $('footerCopyrightName').textContent = D.name || '';
  $('footerDescription').textContent = D.tagline || '';
  $('footerBrandLine').textContent = D.brandLine || '';
  $('footerNavTitle').textContent = ui.footerNavigation || '';
  $('footerContactsTitle').textContent = ui.footerContacts || '';
    var footerNav = $('footerNav');
    Array.prototype.forEach.call(document.querySelectorAll('#nav a'), function(link){
      footerNav.appendChild(link.cloneNode(true));
    });
    if (D.address) $('footerAddress').textContent = D.address;
    var footerContacts = $('footerContacts');
    function appendFooterContact(label, value, href, external){
      if (!value) return;
      var item = document.createElement('li');
      var name = document.createElement('span');
      name.textContent = label;
      var content = href ? document.createElement('a') : document.createElement('span');
      content.textContent = value;
      if (href) {
        content.href = href;
        if (external) {
          content.target = '_blank';
          content.rel = 'noopener noreferrer';
        }
      }
      item.appendChild(name);
      item.appendChild(content);
      footerContacts.appendChild(item);
    }
    var phoneHref = D.phone ? 'tel:' + D.phone.replace(/[^+\d]/g, '') : '';
    appendFooterContact(ui.footerPhone, D.phone, phoneHref, false);
    appendFooterContact(ui.footerEmail, D.email, D.email ? 'mailto:' + D.email : '', false);
    appendFooterContact(ui.footerTwogis, D.twogis ? ui.footerMap : '', D.twogis, true);
    var footerHours = $('mapHours');
    (D.hours || []).forEach(function(hours){
      var item = document.createElement('li');
      var day = document.createElement('span');
      day.textContent = hours.name + ':';
      item.appendChild(day);
      var time = document.createElement('span');
      time.textContent = hours.closed ? hours.open : hours.open + '–' + hours.close;
      item.appendChild(time);
      footerHours.appendChild(item);
    });
    if (D.phone) {
      var reserveHero = $('reserveHero');
      reserveHero.href = phoneHref;
      reserveHero.textContent = ui.reserveAction || '';
      reserveHero.hidden = false;
      var headerCall = $('headerCall');
      headerCall.href = phoneHref;
      headerCall.textContent = ui.callAction || '';
      headerCall.hidden = false;
    }
    var socialIcons = {
      instagram: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="17.3" cy="6.7" r="1.2" fill="currentColor"/></svg>',
      whatsapp: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3a9 9 0 0 0-7.8 13.5L3 21l4.6-1.2A9 9 0 1 0 12 3z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M9 8c-.5 1-.3 2.3 1 3.8s2.8 2.3 4 2.3c.8 0 1.4-.6 1.5-1.2l-1.8-.9-.8.8c-.8-.3-2-1.4-2.3-2.3l.8-.8L10 8z" fill="currentColor"/></svg>',
      telegram: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 4 3 11l5 2 2 6 3-4 5 4z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="m8 13 9-6" fill="none" stroke="currentColor" stroke-width="2"/></svg>'
    };
    var socials = $('footerSocials');
    $('footerSocialsTitle').textContent = ui.footerSocials || '';
    [
      { key: 'instagram', label: 'Instagram', href: D.instagram },
      { key: 'telegram', label: 'Telegram', href: D.telegram }
    ].forEach(function(social){
      if (!social.href) return;
      var item = document.createElement('li');
      var link = document.createElement('a');
      link.href = social.href;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.className = 'social-link';
      link.innerHTML = socialIcons[social.key];
      var text = document.createElement('span');
      text.textContent = social.label;
      link.appendChild(text);
      item.appendChild(link);
      socials.appendChild(item);
    });
  /* ---- флажки начинок из данных меню ---- */
  var flags = $('menuFlags');
  var fillings = (D.menu || []).filter(function(m){ return m.name === 'Хинкали'; })[0];
  if (flags && fillings && fillings.items) {
    var flagColors = ['#842719','#D9A441','#2A1710','#5E6B3A','#FBF3E4'];
    fillings.items.slice(0, 5).forEach(function(item, index){
      var flag = document.createElement('span');
      flag.className = 'menu-flag';
      var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('viewBox', '0 0 32 32');
      svg.innerHTML = '<line x1="5" y1="2" x2="5" y2="30"></line><path d="M6 3h23l-7 7 7 7H6z" fill="' + flagColors[index % flagColors.length] + '"></path>';
      var label = document.createElement('span');
      label.textContent = item.n;
      flag.appendChild(svg);
      flag.appendChild(label);
      flags.appendChild(flag);
    });
  }

  /* ---- видео: играем только то, что на экране ---- */
  var vids = document.querySelectorAll('video[data-lazy]');
  var motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  var videoObserver;
  var lenisInstance = null;
  var lenisFrame = 0;
  function enableLenis(){
    if (!window.Lenis || motionQuery.matches || lenisInstance) return;
    lenisInstance = new window.Lenis({ smoothWheel: true });
    function raf(time){
      if (!lenisInstance) return;
      lenisInstance.raf(time);
      lenisFrame = window.requestAnimationFrame(raf);
    }
    lenisFrame = window.requestAnimationFrame(raf);
  }
  function disableLenis(){
    if (!lenisInstance) return;
    lenisInstance.destroy();
    lenisInstance = null;
    window.cancelAnimationFrame(lenisFrame);
  }
  enableLenis();
  if ('IntersectionObserver' in window) {
    videoObserver = new IntersectionObserver(function(es){
      es.forEach(function(e){
        var v = e.target;
        if (e.isIntersecting && !motionQuery.matches) {
          v.autoplay = true;
          if (v.preload === 'none') v.preload = 'auto';
          var pr = v.play();
          if (pr && pr.catch) pr.catch(function(error){ console.warn('Не удалось запустить видео: ' + v.currentSrc, error); });
        } else {
          v.pause();
          v.autoplay = false;
        }
      });
    }, { threshold: .25 });
    vids.forEach(function(v){ videoObserver.observe(v); });
  } else {
    vids.forEach(function(v){
      if (motionQuery.matches) v.pause();
      else {
        v.preload = 'auto';
        v.play().catch(function(error){ console.warn('Не удалось запустить видео: ' + v.currentSrc, error); });
      }
    });
  }
  if (motionQuery.addEventListener) {
    motionQuery.addEventListener('change', function(e){
      if (e.matches) {
        disableLenis();
        vids.forEach(function(v){ v.pause(); v.autoplay = false; });
        Array.prototype.forEach.call(strips, function(strip){ strip.style.setProperty('--parallax-y', '0px'); });
        if (ribbon) ribbon.style.setProperty('--ribbon-duration', '32s');
      } else {
        enableLenis();
        if (videoObserver) vids.forEach(function(v){ videoObserver.unobserve(v); videoObserver.observe(v); });
      }
    });
  }

  /* ---- лёгкое появление, параллакс и реакция на скорость прокрутки ---- */
  var revealNodes = document.querySelectorAll('.menu-grid .dish, .stories .story, .kitchen-copy, .kitchen .reel, .atmo-text');
  if (!motionQuery.matches) {
    if ('IntersectionObserver' in window) {
      var revealObserver = new IntersectionObserver(function(es){
        es.forEach(function(e){
          if (e.isIntersecting) {
            e.target.classList.add('is-visible');
            revealObserver.unobserve(e.target);
          }
        });
      }, { threshold: .08, rootMargin: '0px 0px -30px 0px' });
      Array.prototype.forEach.call(revealNodes, function(el, index){
        el.classList.add('reveal');
        el.style.setProperty('--reveal-delay', Math.min(index % 5, 4) * 75 + 'ms');
        revealObserver.observe(el);
      });
    } else {
      Array.prototype.forEach.call(revealNodes, function(el){ el.classList.add('is-visible'); });
    }
  } else {
    Array.prototype.forEach.call(revealNodes, function(el){ el.classList.add('is-visible'); });
  }

  var strips = document.querySelectorAll('.hero-strip');
  var stories = document.querySelectorAll('.story');
  var ribbon = document.querySelector('.ribbon-track');
  var lastScrollY = window.scrollY;
  var lastScrollTime = Date.now();
  var scrollFrame = false;
  var scrollReset;
  function updateScrollMotion(){
    scrollFrame = false;
    if (motionQuery.matches) return;
    var nowY = window.scrollY;
    var nowTime = Date.now();
    var speed = Math.abs(nowY - lastScrollY) / Math.max(1, nowTime - lastScrollTime);
    Array.prototype.forEach.call(strips, function(strip, index){
      strip.dataset.target = Math.min(nowY, 900) * (index + 1) * .012;
    });
    Array.prototype.forEach.call(stories, function(story, index){
      if (window.innerWidth <= 980) {
        story.style.removeProperty('--fan-angle');
        story.style.removeProperty('--fan-y');
        return;
      }
      var rect = story.getBoundingClientRect();
      var progress = Math.max(0, Math.min(1, (window.innerHeight - rect.top) / Math.min(window.innerHeight * .9, 700)));
      story.style.setProperty('--fan-angle', ((index - 1) * 5 * progress).toFixed(2) + 'deg');
      story.style.setProperty('--fan-y', ((index - 1) * 22 * progress).toFixed(1) + 'px');
    });
    lastScrollY = nowY;
    lastScrollTime = nowTime;
  }
  var parallaxCurrent = [];
  function easeParallax(){
    if (!motionQuery.matches) {
      Array.prototype.forEach.call(strips, function(strip, index){
        var target = parseFloat(strip.dataset.target || '0');
        var current = parallaxCurrent[index] || 0;
        current += (target - current) * .06;
        parallaxCurrent[index] = current;
        strip.style.setProperty('--parallax-y', current.toFixed(2) + 'px');
      });
    }
    window.requestAnimationFrame(easeParallax);
  }
  easeParallax();
  window.addEventListener('scroll', function(){
    if (!scrollFrame && !motionQuery.matches) {
      scrollFrame = true;
      window.requestAnimationFrame(updateScrollMotion);
    }
  }, { passive: true });

  if (window.matchMedia('(pointer:fine)').matches && !motionQuery.matches) {
    document.querySelectorAll('.btn').forEach(function(button){
      button.addEventListener('pointermove', function(e){
        var r = button.getBoundingClientRect();
        button.style.setProperty('--mag-x', ((e.clientX - r.left - r.width / 2) * .08).toFixed(1) + 'px');
        button.style.setProperty('--mag-y', ((e.clientY - r.top - r.height / 2) * .08).toFixed(1) + 'px');
      });
      button.addEventListener('pointerleave', function(){
        button.style.setProperty('--mag-x', '0px');
        button.style.setProperty('--mag-y', '0px');
      });
    });
  }

  /* ---- мобильное меню ---- */
  var burger = $('burger'), nav = $('nav');
  burger.addEventListener('click', function(){
    var o = nav.classList.toggle('open'); burger.setAttribute('aria-expanded', o);
  });
  nav.addEventListener('click', function(e){ if (e.target.tagName === 'A') { nav.classList.remove('open'); burger.setAttribute('aria-expanded', false); } });

  $('year').textContent = new Date().getFullYear();
})();
