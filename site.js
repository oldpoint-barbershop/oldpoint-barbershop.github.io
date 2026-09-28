/* Прейскурант «Олд Поинт»: переключатель барбера и подсчёт визита.
   Цены — с карточки барбершопа на Яндекс Картах (раздел «Товары и услуги»). */
(function () {
  'use strict';

  var MASTERS = {
    ilya: { label: 'Илья, топ-барбер', p: { cut: 55, beard: 45, combo: 80, tint: 35, shave: 40, wash: 10, wax: 5, color: 70 } },
    alexey: { label: 'Алексей, барбер', p: { cut: 40, beard: 30, combo: 65, tint: 25, shave: 30, wash: 10, wax: 5 } }
  };
  var SERVICES = [
    { id: 'cut', name: 'Мужская или детская стрижка' },
    { id: 'beard', name: 'Оформление бороды', hint: 'стрижка и окантовка вручную' },
    { id: 'tint', name: 'Тонировка бороды', hint: 'меняет цвет без стойкой краски' },
    { id: 'shave', name: 'Бритьё наголо' },
    { id: 'wash', name: 'Мытьё и укладка' },
    { id: 'wax', name: 'Воск: уши, нос, брови' },
    { id: 'color', name: 'Мужское окрашивание' }
  ];

  // Стрижка и борода вместе считаются по цене комплекса — так в прейскуранте.
  function total(master, picked) {
    var p = MASTERS[master].p;
    var sum = 0;
    var combo = picked.indexOf('cut') > -1 && picked.indexOf('beard') > -1 && p.combo;
    picked.forEach(function (id) {
      if (combo && (id === 'cut' || id === 'beard')) return;
      if (p[id] != null) sum += p[id];
    });
    if (combo) sum += p.combo;
    return { sum: sum, combo: !!combo, saved: combo ? p.cut + p.beard - p.combo : 0 };
  }

  if (typeof module !== 'undefined' && module.exports) { module.exports = { total: total }; return; }

  var form = document.getElementById('visit');
  var list = document.getElementById('board-list');
  if (!form || !list) return;

  list.innerHTML = SERVICES.map(function (s) {
    return '<li class="svc" data-id="' + s.id + '"><label>' +
      '<input type="checkbox" value="' + s.id + '">' +
      '<span class="svc__name">' + s.name + (s.hint ? ' <small>' + s.hint + '</small>' : '') + '</span>' +
      '<span class="svc__dots" aria-hidden="true"></span>' +
      '<span class="svc__price"><b></b><span class="svc__cur"> BYN</span></span>' +
      '</label></li>';
  }).join('') +
    '<li class="svc svc--combo" data-id="combo"><span class="svc__name">Стрижка и борода вместе</span>' +
    '<span class="svc__dots" aria-hidden="true"></span><span class="svc__price"><b></b><span class="svc__cur"> BYN</span></span></li>';

  function master() { return form.querySelector('input[name=master]:checked').value; }
  function picked() {
    return [].map.call(list.querySelectorAll('input:checked:not(:disabled)'), function (i) { return i.value; });
  }

  function renderPrices(animate) {
    var p = MASTERS[master()].p;
    [].forEach.call(list.children, function (li) {
      var id = li.getAttribute('data-id');
      var b = li.querySelector('.svc__price b');
      var input = li.querySelector('input');
      var has = p[id] != null;
      b.textContent = has ? p[id] : '—';
      li.classList.toggle('svc--off', !has);
      if (input) {
        input.disabled = !has;
        if (!has) input.checked = false;
      }
      li.querySelector('.svc__cur').hidden = !has;
      if (animate) { li.classList.remove('flip'); void li.offsetWidth; li.classList.add('flip'); }
    });
    var off = list.querySelector('[data-id=color]');
    off.querySelector('.svc__name').lastChild.textContent = p.color ? 'Мужское окрашивание' : 'Мужское окрашивание — только у Ильи';
  }

  function update() {
    var m = master();
    var ids = picked();
    var t = total(m, ids);
    document.getElementById('visit-sum').textContent = t.sum;
    list.querySelector('.svc--combo').classList.toggle('svc--on', t.combo);
    var note = document.getElementById('visit-note');
    if (!ids.length) note.textContent = 'Отметьте услуги — цена появится здесь.';
    else if (t.combo) note.textContent = 'Стрижка с бородой считается комплексом: выгоднее на ' + t.saved + ' BYN.';
    else note.textContent = 'Ориентировочно, по прейскуранту.';

    var names = ids.filter(function (id) { return !(t.combo && (id === 'cut' || id === 'beard')); })
      .map(function (id) { return SERVICES.filter(function (s) { return s.id === id; })[0].name; });
    if (t.combo) names.unshift('Стрижка и оформление бороды (комплекс)');
    document.getElementById('f-master').value = MASTERS[m].label;
    document.getElementById('f-services').value = names.join(', ');
    document.getElementById('f-sum').value = ids.length ? t.sum + ' BYN' : '';
  }

  form.addEventListener('change', function (e) {
    if (e.target.name === 'master') renderPrices(true);
    update();
  });

  renderPrices(false);
  update();
})();
