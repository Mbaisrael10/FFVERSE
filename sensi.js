/* FFVERSE – Free Fire AI Sensitivity Generator
   Vanilla JS, no dependencies, no backend. Presets live in localStorage. */
(function () {
  'use strict';

  var root = document.getElementById('ffv-gen');
  if (!root) return;

  /* =====================================================================
     PHONE DATABASE
     Each group: [brand prefix, extra search words, entries].
     Entry: "Name|screen inches|refresh Hz|tier|model codes".
     Tier: 0 entry, 1 mid, 2 high, 3 flagship. Specs are approximate.
     ===================================================================== */
  var RAW = [
    ['Samsung Galaxy', 'samsung', [
      'A03|6.5|60|0|sma035', 'A03 Core|6.5|60|0|sma032', 'A04|6.5|60|0|sma045', 'A04e|6.5|60|0|sma042',
      'A04s|6.5|90|0|sma047', 'A05|6.7|60|0|sma055', 'A05s|6.7|90|1|sma057', 'A06|6.7|60|0|sma065',
      'A12|6.5|60|0|sma125', 'A13|6.6|60|0|sma135', 'A14|6.6|90|1|sma145', 'A15|6.5|90|1|sma155',
      'A16|6.7|90|1|sma165', 'A21s|6.5|60|0|sma217', 'A22|6.4|90|1|sma225', 'A23|6.6|90|1|sma235',
      'A24|6.5|90|1|sma245', 'A25 5G|6.5|120|1|sma256', 'A32|6.4|90|1|sma325', 'A33 5G|6.4|90|1|sma336',
      'A34 5G|6.6|120|1|sma346', 'A35 5G|6.6|120|2|sma356', 'A51|6.5|60|1|sma515', 'A52|6.5|90|1|sma525 sma526',
      'A53 5G|6.5|120|1|sma536', 'A54 5G|6.4|120|2|sma546', 'A55 5G|6.6|120|2|sma556', 'A71|6.7|60|1|sma715',
      'A72|6.7|90|1|sma725', 'A73 5G|6.7|120|2|sma736', 'M14 5G|6.6|90|1|smm146', 'M34 5G|6.5|120|1|smm346',
      'S10|6.1|60|2|smg973', 'S20|6.2|120|3|smg980 smg981', 'S20 FE|6.5|120|3|smg780 smg781',
      'S21|6.2|120|3|smg991', 'S21 FE|6.4|120|3|smg990', 'S22|6.1|120|3|sms901', 'S23|6.1|120|3|sms911',
      'S23 Ultra|6.8|120|3|sms918', 'S24|6.2|120|3|sms921', 'S24 Ultra|6.8|120|3|sms928',
      'S25 Ultra|6.9|120|3|sms938', 'Note 20 Ultra|6.9|120|3|smn985 smn986'
    ]],
    ['iPhone', 'apple ios', [
      '6s|4.7|60|1', '7|4.7|60|1', '8|4.7|60|1', '8 Plus|5.5|60|1', 'SE (2020)|4.7|60|2', 'SE (2022)|4.7|60|2',
      'X|5.8|60|2', 'XR|6.1|60|2', 'XS|5.8|60|2', 'XS Max|6.5|60|2', '11|6.1|60|2', '11 Pro|5.8|60|2',
      '11 Pro Max|6.5|60|2', '12 mini|5.4|60|3', '12|6.1|60|3', '12 Pro|6.1|60|3', '12 Pro Max|6.7|60|3',
      '13 mini|5.4|60|3', '13|6.1|60|3', '13 Pro|6.1|120|3', '13 Pro Max|6.7|120|3', '14|6.1|60|3',
      '14 Plus|6.7|60|3', '14 Pro|6.1|120|3', '14 Pro Max|6.7|120|3', '15|6.1|60|3', '15 Plus|6.7|60|3',
      '15 Pro|6.1|120|3', '15 Pro Max|6.7|120|3', '16|6.1|60|3', '16 Plus|6.7|60|3', '16 Pro|6.3|120|3',
      '16 Pro Max|6.9|120|3', '17|6.3|120|3', '17 Pro|6.3|120|3', '17 Pro Max|6.9|120|3', 'Air|6.5|120|3'
    ]],
    ['Redmi', 'xiaomi', [
      '9|6.53|60|0', '9A|6.53|60|0', '9C|6.53|60|0', '9T|6.53|60|0', '10|6.5|90|1', '10C|6.71|60|0',
      '12|6.79|90|1', '12C|6.71|60|0', '13|6.79|90|1', '13C|6.74|90|0', 'A1|6.52|60|0', 'A3|6.71|90|0',
      'Note 8|6.3|60|1', 'Note 9|6.53|60|1', 'Note 10|6.43|60|1', 'Note 10S|6.43|60|1', 'Note 10 Pro|6.67|120|1',
      'Note 11|6.43|90|1', 'Note 11 Pro|6.67|120|1', 'Note 12|6.67|120|1', 'Note 12 Pro|6.67|120|2',
      'Note 13|6.67|120|1', 'Note 13 Pro|6.67|120|2', 'Note 14|6.67|120|1', 'Note 14 Pro|6.67|120|2'
    ]],
    ['POCO', 'xiaomi', [
      'C40|6.71|60|0', 'C65|6.74|90|0', 'M3|6.53|60|1', 'M4 Pro|6.43|90|1', 'M5|6.58|90|1', 'M6 Pro|6.79|90|1',
      'X3 NFC|6.67|120|2', 'X3 Pro|6.67|120|2', 'X4 Pro|6.67|120|1', 'X5 Pro|6.67|120|2', 'X6|6.67|120|2',
      'X6 Pro|6.67|120|3', 'F3|6.67|120|3', 'F4|6.67|120|3', 'F5|6.67|120|3', 'F6|6.67|120|3'
    ]],
    ['Xiaomi', 'mi', ['Mi 11 Lite|6.55|90|2', '13T|6.67|144|3', '14|6.36|120|3']],
    ['Tecno', '', [
      'Pop 5|6.52|60|0', 'Pop 7|6.56|60|0', 'Pop 8|6.56|60|0', 'Spark Go|6.5|60|0', 'Spark 6 Go|6.52|60|0',
      'Spark 7|6.52|90|0', 'Spark 8|6.56|90|0', 'Spark 8C|6.6|90|0', 'Spark 8P|6.6|90|0', 'Spark 9 Pro|6.6|90|1',
      'Spark 10|6.6|90|0', 'Spark 10 Pro|6.8|90|1', 'Spark 20|6.56|90|0', 'Spark 20 Pro|6.78|120|1',
      'Camon 17|6.6|90|1', 'Camon 20 Pro|6.67|120|1', 'Camon 30|6.78|120|1', 'Pova 3|6.9|90|1',
      'Pova 4|6.82|90|1', 'Pova 5|6.78|120|1', 'Pova 6 Pro|6.78|120|2', 'Phantom X2|6.8|120|3'
    ]],
    ['Infinix', '', [
      'Smart 5|6.82|60|0', 'Smart 6|6.6|60|0', 'Smart 7|6.6|60|0', 'Smart 8|6.6|90|0', 'Hot 10|6.78|90|0',
      'Hot 10 Play|6.82|60|0', 'Hot 11|6.82|90|0', 'Hot 11S|6.78|90|1', 'Hot 12|6.82|90|0',
      'Hot 12 Play|6.82|60|0', 'Hot 20|6.82|90|0', 'Hot 30|6.78|90|1', 'Hot 30i|6.6|60|0', 'Hot 40|6.78|120|1',
      'Hot 40i|6.56|90|0', 'Note 10|6.95|60|1', 'Note 11|6.7|60|1', 'Note 12|6.7|120|1', 'Note 30|6.78|120|1',
      'Note 40|6.78|120|1', 'Zero 30|6.78|144|2'
    ]],
    ['itel', '', [
      'A48|6.1|60|0', 'A49|6.6|60|0', 'A58|6.6|60|0', 'A60|6.6|60|0', 'A70|6.6|90|0', 'P38|6.6|60|0',
      'P40|6.6|90|0', 'S23|6.6|90|0', 'Vision 2|6.5|60|0', 'Vision 3|6.6|60|0'
    ]],
    ['Realme', '', [
      'C11|6.5|60|0', 'C15|6.5|60|0', 'C21Y|6.5|60|0', 'C25|6.5|60|0', 'C30|6.5|60|0', 'C33|6.5|60|0',
      'C35|6.6|60|1', 'C53|6.74|90|1', 'C55|6.72|90|1', 'C67|6.72|90|1', '6|6.5|90|1', '7|6.5|90|1',
      '8|6.4|60|1', '8 Pro|6.4|60|1', '9i|6.6|90|1', '9 Pro+|6.4|90|2', '10|6.4|90|1', '11 Pro|6.7|120|2',
      'GT 6T|6.78|120|3', 'Narzo 50|6.6|120|1', 'Narzo 60|6.43|90|1', 'Note 50|6.74|90|0'
    ]],
    ['Oppo', '', [
      'A15|6.52|60|0', 'A16|6.52|60|0', 'A17|6.56|60|0', 'A54|6.51|60|1', 'A57|6.56|90|0', 'A58|6.72|90|1',
      'A74|6.43|90|1', 'A78|6.43|90|1', 'A96|6.59|90|1', 'Reno 5|6.43|90|2', 'Reno 6|6.43|90|2',
      'Reno 8|6.4|90|2', 'Reno 10|6.7|120|2', 'Reno 11|6.7|120|2', 'Find X5 Pro|6.7|120|3'
    ]],
    ['Vivo', '', [
      'Y01|6.51|60|0', 'Y12|6.35|60|0', 'Y15|6.35|60|0', 'Y16|6.51|60|0', 'Y20|6.51|60|0', 'Y21|6.51|60|0',
      'Y22|6.55|90|0', 'Y33s|6.58|90|1', 'Y35|6.58|90|1', 'Y36|6.64|90|1', 'V21|6.44|90|2', 'V23|6.44|90|2',
      'V25|6.44|90|2', 'V27|6.78|120|2', 'V29|6.78|120|2', 'X80|6.78|120|3'
    ]],
    ['OnePlus', '', [
      '7T|6.55|90|3', '8|6.55|90|3', '9|6.55|120|3', '9R|6.55|120|3', '10 Pro|6.7|120|3', '11|6.7|120|3',
      '12|6.82|120|3', 'Nord 2|6.43|90|2', 'Nord CE 2|6.43|90|1', 'Nord CE 3 Lite|6.72|120|1',
      'Nord N10|6.49|90|1', 'Nord N20|6.43|60|1'
    ]],
    ['Google Pixel', 'google', [
      '4a|5.81|60|2', '5|6.0|90|2', '6|6.4|90|3', '6a|6.1|60|2', '7|6.3|90|3', '7a|6.1|90|3', '8|6.2|120|3',
      '8 Pro|6.7|120|3', '9|6.3|120|3', '9 Pro XL|6.8|120|3'
    ]],
    ['Huawei', '', ['Y9 Prime 2019|6.59|60|1', 'P30 Lite|6.15|60|1', 'Nova 9|6.57|120|2']],
    ['Honor', '', ['X6|6.5|60|0', 'X7|6.74|90|0', 'X8|6.7|90|1', '90|6.7|120|2']],
    ['Moto', 'motorola', ['E13|6.5|60|0', 'G14|6.5|60|0', 'G23|6.5|90|1', 'G32|6.5|90|1', 'G54|6.5|120|1', 'G84|6.5|120|1']],
    ['Nokia', '', ['C21|6.52|60|0', 'G21|6.5|90|0']],
    ['ASUS ROG Phone', 'gaming', ['6|6.78|165|3', '7|6.78|165|3']],
    ['RedMagic', 'nubia gaming', ['8 Pro|6.8|120|3', '9 Pro|6.8|120|3']],
    ['Black Shark', 'gaming', ['5 Pro|6.67|144|3']],
    ['', 'any generic', [
      'Any Android phone: Entry-level|6.5|60|0', 'Any Android phone: Mid-range|6.6|90|1',
      'Any Android phone: High-end|6.7|120|2', 'Any Android phone: Flagship|6.8|120|3',
      'Any older iPhone (8 or earlier)|4.7|60|1', 'Any newer iPhone (X or later)|6.1|60|2',
      'Any iPad or tablet|10.2|60|2', 'Any Android tablet|10.4|60|1'
    ]]
  ];

  var POPULAR = ['Tecno Spark 10', 'Infinix Hot 30', 'Samsung Galaxy A15', 'Samsung Galaxy A14', 'iPhone 13',
                 'iPhone 11', 'Redmi Note 12', 'itel A60', 'Tecno Camon 20 Pro'];

  // Starting points per play style (0–100 scale used by Free Fire).
  var BASE = {
    rusher:   { general: 96, redDot: 92, scope2x: 88, scope4x: 80, sniper: 60, freeLook: 94 },
    balanced: { general: 90, redDot: 86, scope2x: 80, scope4x: 72, sniper: 52, freeLook: 88 },
    headshot: { general: 92, redDot: 94, scope2x: 88, scope4x: 82, sniper: 60, freeLook: 90 },
    sniper:   { general: 82, redDot: 78, scope2x: 74, scope4x: 70, sniper: 48, freeLook: 80 }
  };

  // How strongly the device/player adjustment applies to each slider.
  var WEIGHT = { general: 1, redDot: 0.9, scope2x: 0.8, scope4x: 0.7, sniper: 0.6, freeLook: 1 };

  var LABELS = [
    ['general', 'General'],
    ['redDot', 'Red Dot'],
    ['scope2x', '2x Scope'],
    ['scope4x', '4x Scope'],
    ['sniper', 'Sniper Scope'],
    ['freeLook', 'Free Look']
  ];

  var STYLE_NAMES = { rusher: 'Rusher', balanced: 'Balanced', headshot: 'Headshot', sniper: 'Sniper' };
  var STYLE_HINTS = {
    rusher: 'Fast close-range fights and aggressive pushes.',
    balanced: 'A mix of close and mid-range. Best for most players.',
    headshot: 'Quick drag-up aim for one-tap headshots.',
    sniper: 'Slow, careful aim for long-range and AWM fights.'
  };
  var TIER_NAMES = ['Entry-level', 'Mid-range', 'High-end', 'Flagship'];
  var HZ_OPTIONS = [60, 90, 120, 144, 165];

  var KEY_PRESETS = 'ffverse_presets_v2';
  var KEY_PROFILE = 'ffverse_profile_v2';
  var KEY_TWEAK = 'ffverse_tweak_v1';
  var MAX_PRESETS = 12;
  var TWEAK_STEP = 3;
  var TWEAK_LIMIT = 15;

  /* =====================================================================
     HELPERS
     ===================================================================== */
  function $(id) { return document.getElementById(id); }
  function clamp(n, lo, hi) { return Math.min(hi, Math.max(lo, n)); }
  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined) e.textContent = text;
    return e;
  }
  function norm(s) { return String(s).toLowerCase().replace(/[^a-z0-9]+/g, ' ').replace(/^ +| +$/g, ''); }

  var reduceMotion = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  function loadJSON(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) { return fallback; }
  }
  function saveJSON(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); return true; }
    catch (e) { return false; }
  }

  var toastTimer = null;
  function toast(msg) {
    var t = $('ffv-toast');
    t.textContent = msg;
    t.classList.add('ffv-show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove('ffv-show'); }, 2300);
  }

  function radioValue(name) {
    var r = root.querySelector('input[name="' + name + '"]:checked');
    return r ? r.value : '';
  }
  function setRadio(name, value) {
    var list = root.querySelectorAll('input[name="' + name + '"]');
    for (var i = 0; i < list.length; i++) list[i].checked = (list[i].value === String(value));
  }
  function snapHz(v) {
    var best = HZ_OPTIONS[0], diff = 1e9;
    HZ_OPTIONS.forEach(function (o) {
      var d = Math.abs(o - v);
      if (d < diff) { diff = d; best = o; }
    });
    return best;
  }

  /* =====================================================================
     BUILD DATABASE
     ===================================================================== */
  var DB = [];
  RAW.forEach(function (g) {
    g[2].forEach(function (line) {
      var f = line.split('|');
      var d = {
        name: g[0] ? g[0] + ' ' + f[0] : f[0],
        size: parseFloat(f[1]),
        hz: parseInt(f[2], 10),
        tier: parseInt(f[3], 10),
        codes: (f[4] || '').split(' ').filter(Boolean),
        generic: !g[0]
      };
      if (isNaN(d.size) || isNaN(d.hz) || isNaN(d.tier)) return;
      d.nkey = norm(d.name);
      d.key = norm(d.name + ' ' + g[1] + ' ' + (f[4] || ''));
      d.ckey = d.key.replace(/ /g, '');
      DB.push(d);
    });
  });

  function wordPrefix(key, token) { return (' ' + key).indexOf(' ' + token) !== -1; }

  function search(query, limit) {
    var nq = norm(query);
    if (!nq) return [];
    var tokens = nq.split(' ');
    var cq = nq.replace(/ /g, '');
    var out = [];
    DB.forEach(function (d) {
      var strict = tokens.every(function (t) { return wordPrefix(d.key, t); });
      var codeHit = d.codes.some(function (c) { return cq.indexOf(c) === 0; });
      if (!strict && !codeHit && d.ckey.indexOf(cq) === -1) return;
      var score = strict ? 10 : 0;
      if (codeHit) score += 60;
      if (d.nkey === nq) score += 100;
      else if (d.nkey.indexOf(nq) === 0) score += 30;
      if (d.generic) score -= 5;
      score -= d.nkey.length * 0.1;
      out.push({ d: d, score: score, strict: strict });
    });
    out.sort(function (a, b) { return b.score - a.score; });
    return out.slice(0, limit || 8);
  }

  // Match a model string coming from the browser (e.g. "SM-A155F" or "Redmi Note 11").
  function matchModel(model) {
    var c = String(model).toLowerCase().replace(/[^a-z0-9]/g, '');
    var best = null, bestLen = 0;
    DB.forEach(function (d) {
      d.codes.forEach(function (code) {
        if (c.indexOf(code) === 0 && code.length > bestLen) { best = d; bestLen = code.length; }
      });
    });
    if (best) return best;
    var res = search(model, 1);
    if (res.length && res[0].strict && !res[0].d.generic) return res[0].d;
    return null;
  }

  /* =====================================================================
     STATE
     ===================================================================== */
  var tweak = clamp(+loadJSON(KEY_TWEAK, 0) || 0, -TWEAK_LIMIT, TWEAK_LIMIT);
  var device = null;      // { name, known, measured }
  var hasDevice = false;
  var current = null;     // { profile, result }

  /* =====================================================================
     THE ENGINE
     ===================================================================== */
  function touchAdjust(hz) {
    if (hz >= 480) return -2;
    if (hz >= 360) return -1;
    if (hz >= 240) return 0;
    if (hz >= 180) return 1;
    if (hz >= 120) return 2;
    return 0; // unknown
  }

  function calcShift(p, extra) {
    var s = 0;
    s += clamp((6.5 - p.size) * 4, -6, 8);                                  // smaller screen -> a bit higher
    s += ({ 60: 3, 90: 0, 120: -2, 144: -4, 165: -5 })[p.hz] || 0;           // smoother display -> a bit lower
    s += [4, 1, -1, -2][p.tier] || 0;                                        // weaker phone -> a bit higher
    s += ({ 2: 6, 3: 0, 4: -3, 5: -4 })[p.fingers] || 0;                     // fewer fingers -> higher
    s += ({ beginner: -8, intermediate: 0, pro: 4 })[p.exp] || 0;            // beginners need control
    s += touchAdjust(p.touch);
    s += extra;                                                              // user fine-tuning
    return s;
  }

  function generate(p, extra) {
    var base = BASE[p.style] || BASE.balanced;
    var shift = calcShift(p, extra);
    var values = {};
    LABELS.forEach(function (pair) {
      var k = pair[0];
      values[k] = Math.round(clamp(base[k] + shift * WEIGHT[k], 1, 100));
    });

    var match = 66;
    if (p.known) match += 12;
    if (p.touch) match += 8;
    if (p.measured) match += 6;
    match += Math.min(Math.round(Math.abs(extra) / TWEAK_STEP), 3) * 3;

    return { values: values, shift: shift, match: Math.min(match, 96) };
  }

  function buildTips(p) {
    var tips = [];
    var fire = p.size < 6 ? '60–70%' : (p.size <= 6.7 ? '50–60%' : '45–55%');
    tips.push('Try a fire button size around ' + fire + ' on a ' + p.size + '" screen, then adjust to what feels natural.');
    if (p.fingers === 2) {
      tips.push('A 3-finger layout lets you aim and shoot at the same time, which gives much better control.');
    }
    if (p.hz === 60 || p.tier === 0) {
      tips.push('Use Smooth graphics and the highest FPS your phone allows. Stable frames matter more than sharp visuals.');
    }
    if (p.exp === 'beginner') {
      tips.push('Values are kept a little lower so you stay in control. Raise them with "Too slow" as your aim improves.');
    }
    tips.push('Test in Training Ground: spray at a wall, then flick between targets. Change values by 2–3 points at a time.');
    return tips.slice(0, 4);
  }

  /* =====================================================================
     PROFILE <-> FORM
     ===================================================================== */
  function readProfile() {
    return {
      name: device ? device.name : '',
      known: !!(device && device.known),
      measured: !!(device && device.measured),
      game: radioValue('game'),
      style: radioValue('style'),
      fingers: +radioValue('fingers'),
      exp: radioValue('exp'),
      size: parseFloat($('ffv-size').value),
      hz: +$('ffv-hz').value,
      tier: +$('ffv-tier').value,
      touch: +$('ffv-touch').value
    };
  }

  function specsLine(p) {
    return p.size + '" screen · ' + p.hz + ' Hz · ' + TIER_NAMES[p.tier];
  }

  function renderDevice(p) {
    var box = $('ffv-device');
    if (!hasDevice) { box.hidden = true; return; }
    $('ffv-device-name').textContent = p.name;
    $('ffv-device-specs').textContent = specsLine(p);
    box.hidden = false;
  }

  function fillFields(size, hz, tier) {
    $('ffv-size').value = size;
    $('ffv-hz').value = String(snapHz(hz));
    $('ffv-tier').value = String(clamp(tier, 0, 3));
    $('ffv-size-err').hidden = true;
  }

  // dev: { name, size, hz, tier, known, measured }
  function setDevice(dev, scroll) {
    device = { name: dev.name, known: !!dev.known, measured: !!dev.measured };
    hasDevice = true;
    fillFields(dev.size, dev.hz, dev.tier);
    $('ffv-search').value = dev.name;
    hideSuggest();
    update(scroll);
  }

  function markCustom() {
    if (!hasDevice) {
      device = { name: 'Custom phone', known: false, measured: false };
      hasDevice = true;
    } else if (device.name !== 'Custom phone') {
      device = { name: 'Custom phone', known: false, measured: false };
      $('ffv-search').value = 'Custom phone';
    }
    update(false);
  }

  /* =====================================================================
     RENDER
     ===================================================================== */
  function showEmpty() {
    $('ffv-result').hidden = true;
    $('ffv-empty').hidden = false;
    current = null;
  }

  function render(p, res) {
    var rows = $('ffv-rows');
    rows.textContent = '';

    LABELS.forEach(function (pair) {
      var value = res.values[pair[0]];
      var row = el('div', 'ffv-row');
      var top = el('div', 'ffv-row-top');
      top.appendChild(el('span', 'ffv-row-label', pair[1]));
      top.appendChild(el('strong', 'ffv-row-value', String(value)));
      var bar = el('div', 'ffv-bar');
      bar.setAttribute('aria-hidden', 'true');
      var fill = el('div', 'ffv-fill');
      fill.style.width = value + '%';
      bar.appendChild(fill);
      row.appendChild(top);
      row.appendChild(bar);
      rows.appendChild(row);
    });

    $('ffv-match').textContent = 'Match ' + res.match + '%';
    $('ffv-summary').textContent =
      p.game + ' · ' + p.name + ' · ' + specsLine(p);
    $('ffv-style-quick').value = p.style;

    var note = $('ffv-tune-note');
    if (tweak === 0) note.textContent = 'Play a few matches, then tell us if it feels too fast or too slow.';
    else note.textContent = 'Fine-tune applied: ' + (tweak > 0 ? '+' : '') + tweak + ' points on every slider.';

    var tipsEl = $('ffv-tips');
    tipsEl.textContent = '';
    buildTips(p).forEach(function (t) { tipsEl.appendChild(el('li', '', t)); });

    $('ffv-empty').hidden = true;
    $('ffv-result').hidden = false;
    current = { profile: p, result: res };
  }

  function update(scroll) {
    $('ffv-style-hint').textContent = STYLE_HINTS[radioValue('style')] || '';
    if (!hasDevice) { showEmpty(); return; }
    var p = readProfile();
    var okSize = !isNaN(p.size) && p.size >= 4 && p.size <= 13;
    $('ffv-size-err').hidden = okSize;
    if (!okSize) { showEmpty(); return; }
    renderDevice(p);
    saveJSON(KEY_PROFILE, p);
    render(p, generate(p, tweak));
    if (scroll) {
      $('ffv-result').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    }
  }

  /* =====================================================================
     SEARCH SUGGESTIONS
     ===================================================================== */
  var sList = [];
  var sIdx = -1;

  function hideSuggest() {
    var ul = $('ffv-suggest');
    ul.hidden = true;
    ul.textContent = '';
    $('ffv-search').setAttribute('aria-expanded', 'false');
    sList = [];
    sIdx = -1;
  }

  function pick(d) {
    setDevice({ name: d.name, size: d.size, hz: d.hz, tier: d.tier, known: !d.generic, measured: false }, true);
  }

  function setActive(i) {
    var items = $('ffv-suggest').querySelectorAll('.ffv-suggest-item');
    for (var k = 0; k < items.length; k++) items[k].classList.toggle('ffv-active', k === i);
    sIdx = i;
    if (items[i] && items[i].scrollIntoView) items[i].scrollIntoView({ block: 'nearest' });
  }

  function showSuggest(list, heading) {
    var ul = $('ffv-suggest');
    ul.textContent = '';
    sList = list;
    sIdx = -1;
    if (heading) {
      var h = el('li', 'ffv-suggest-head', heading);
      h.setAttribute('role', 'presentation');
      ul.appendChild(h);
    }
    list.forEach(function (d) {
      var li = el('li', 'ffv-suggest-item');
      li.setAttribute('role', 'option');
      li.appendChild(el('span', 'ffv-suggest-name', d.name));
      li.appendChild(el('span', 'ffv-suggest-meta', d.size + '" · ' + d.hz + ' Hz · ' + TIER_NAMES[d.tier]));
      li.addEventListener('click', function () { pick(d); });
      ul.appendChild(li);
    });
    ul.hidden = list.length === 0;
    $('ffv-search').setAttribute('aria-expanded', list.length ? 'true' : 'false');
  }

  function onSearchInput() {
    var q = $('ffv-search').value;
    if (!norm(q)) { showPopular(); return; }
    var res = search(q, 8);
    if (res.length) {
      showSuggest(res.map(function (r) { return r.d; }), '');
    } else {
      var generics = DB.filter(function (d) { return d.generic; });
      showSuggest(generics, 'Not found. Pick a generic profile');
    }
  }

  function showPopular() {
    var list = [];
    POPULAR.forEach(function (n) {
      for (var i = 0; i < DB.length; i++) if (DB[i].name === n) { list.push(DB[i]); break; }
    });
    showSuggest(list, 'Popular phones');
  }

  function onSearchKey(e) {
    var ul = $('ffv-suggest');
    if (ul.hidden) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive(Math.min(sIdx + 1, sList.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(Math.max(sIdx - 1, 0)); }
    else if (e.key === 'Enter') {
      e.preventDefault();
      pick(sList[sIdx >= 0 ? sIdx : 0]);
    } else if (e.key === 'Escape') { hideSuggest(); }
  }

  /* =====================================================================
     AUTO-DETECT
     ===================================================================== */
  function measureHz(cb) {
    var times = [], last = 0, count = 0, finished = false;
    function done(v) { if (!finished) { finished = true; cb(v); } }
    function tick(t) {
      if (finished) return;
      if (last) times.push(t - last);
      last = t;
      count++;
      if (count < 50) { requestAnimationFrame(tick); return; }
      times.sort(function (a, b) { return a - b; });
      var med = times[Math.floor(times.length / 2)];
      var fps = med > 0 ? 1000 / med : 60;
      done(fps < 75 ? 60 : snapHz(fps));
    }
    setTimeout(function () { done(0); }, 2500);
    requestAnimationFrame(tick);
  }

  function getModel(isIOS, cb) {
    if (isIOS) { cb(''); return; }
    var finished = false;
    function out(m) { if (!finished) { finished = true; cb(m || ''); } }
    setTimeout(function () { out(''); }, 1500);
    var m = '';
    var mm = (navigator.userAgent || '').match(/Android [\d.]+; ([^;)]+)/);
    if (mm && mm[1] && mm[1].replace(/ Build.*/, '').trim().length > 1) m = mm[1].replace(/ Build.*/, '').trim();
    var uad = navigator.userAgentData;
    if (uad && uad.getHighEntropyValues) {
      uad.getHighEntropyValues(['model']).then(function (v) { out(v && v.model ? v.model : m); }, function () { out(m); });
    } else {
      out(m);
    }
  }

  // Rough size / performance guesses for iPhones from their screen size in points.
  function iosInfo(w, h) {
    var key = w + 'x' + h;
    var table = {
      '320x568': [4, 1], '375x667': [4.7, 1], '414x736': [5.5, 1], '375x812': [5.8, 2], '360x780': [5.4, 3],
      '390x844': [6.1, 3], '393x852': [6.1, 3], '414x896': [6.1, 2], '428x926': [6.7, 3], '430x932': [6.7, 3],
      '402x874': [6.3, 3], '440x956': [6.9, 3]
    };
    return table[key] || [6.1, 2];
  }

  function applyDetection(isIOS, model, hz) {
    var note = $('ffv-detect-note');
    var ua = navigator.userAgent || '';
    var isIPad = /iPad/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

    if (isIOS) {
      var w = Math.min(screen.width, screen.height), h = Math.max(screen.width, screen.height);
      if (isIPad) {
        var sz = w >= 1024 ? 12.9 : (w >= 820 ? 10.9 : 10.2);
        setDevice({ name: 'Your iPad', size: sz, hz: hz || 60, tier: 2, known: false, measured: !!hz }, true);
        note.textContent = 'Detected an iPad. Search the exact model for better accuracy.';
      } else {
        var info = iosInfo(w, h);
        setDevice({ name: 'Your iPhone', size: info[0], hz: hz || 60, tier: info[1], known: false, measured: !!hz }, true);
        note.textContent = 'Detected an iPhone (about ' + info[0] + '" screen, ' + (hz || 60) + ' Hz). Search the exact model for better accuracy.';
      }
      return;
    }

    var found = model ? matchModel(model) : null;
    if (found) {
      setDevice({ name: found.name, size: found.size, hz: Math.max(found.hz, hz || 0), tier: found.tier, known: true, measured: !!hz }, true);
      note.textContent = 'Detected: ' + found.name + '. Not right? Search your phone above.';
      return;
    }

    var mem = navigator.deviceMemory;
    var tier = 1;
    if (mem) tier = mem <= 2 ? 0 : (mem <= 4 ? 1 : ((hz >= 120 && mem >= 8) ? 3 : 2));
    var label = model ? 'Your phone (' + model + ')' : 'Your Android phone';
    setDevice({ name: label, size: 6.5, hz: hz || 60, tier: tier, known: false, measured: !!hz }, true);
    note.textContent = 'We could not match your exact model, so we used your phone\'s measured speed (' + (hz || 60) +
      ' Hz). Search your phone name above for a closer match.';
  }

  function detect() {
    var btn = $('ffv-detect');
    var note = $('ffv-detect-note');
    var ua = navigator.userAgent || '';
    var isIOS = /iPhone|iPad|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    var isAndroid = /Android/i.test(ua);
    if (!isIOS && !isAndroid) {
      note.textContent = 'This looks like a computer, so we cannot detect a phone. Search your phone name above instead.';
      return;
    }
    btn.disabled = true;
    note.textContent = 'Detecting your phone…';
    var model = '', hz = 0, pending = 2;
    function finish() {
      pending--;
      if (pending > 0) return;
      btn.disabled = false;
      applyDetection(isIOS, model, hz);
    }
    measureHz(function (v) { hz = v; finish(); });
    getModel(isIOS, function (m) { model = m; finish(); });
  }

  /* =====================================================================
     FINE-TUNE
     ===================================================================== */
  function adjust(delta) {
    if (!current) return;
    var next = clamp(tweak + delta, -TWEAK_LIMIT, TWEAK_LIMIT);
    if (next === tweak) { toast('Fine-tune limit reached'); return; }
    tweak = next;
    saveJSON(KEY_TWEAK, tweak);
    update(false);
    toast((delta < 0 ? 'Lowered' : 'Raised') + ' by ' + Math.abs(delta) + '. Test in Training Ground.');
  }

  function resetTune() {
    if (!current) return;
    tweak = 0;
    saveJSON(KEY_TWEAK, 0);
    update(false);
    toast('Fine-tune reset');
  }

  /* =====================================================================
     COPY / SHARE
     ===================================================================== */
  function buildText() {
    if (!current) return '';
    var p = current.profile, v = current.result.values;
    var lines = ['FFVERSE – ' + p.game + ' Sensitivity', p.name + ' | ' + STYLE_NAMES[p.style], ''];
    LABELS.forEach(function (pair) { lines.push(pair[1] + ': ' + v[pair[0]]); });
    lines.push('', 'Generate yours on FFVERSE');
    return lines.join('\n');
  }

  function fallbackCopy(text) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    var ok = false;
    try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
    document.body.removeChild(ta);
    return ok;
  }

  function copySettings() {
    var text = buildText();
    if (!text) return;
    var done = function (ok) { toast(ok ? 'Settings copied!' : 'Could not copy. Select and copy manually.'); };
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(function () { done(true); }, function () { done(fallbackCopy(text)); });
    } else {
      done(fallbackCopy(text));
    }
  }

  function shareWhatsApp() {
    var text = buildText();
    if (!text) return;
    window.open('https://wa.me/?text=' + encodeURIComponent(text), '_blank', 'noopener');
  }

  /* =====================================================================
     PRESETS
     ===================================================================== */
  function getPresets() {
    var list = loadJSON(KEY_PRESETS, []);
    return Array.isArray(list) ? list : [];
  }

  function validSaved(p) {
    return p && typeof p.name === 'string' && p.name && BASE[p.style] && !isNaN(p.size) &&
      HZ_OPTIONS.indexOf(p.hz) !== -1 && p.tier >= 0 && p.tier <= 3;
  }

  function restoreProfile(p, scroll) {
    setRadio('game', p.game);
    setRadio('style', p.style);
    setRadio('fingers', p.fingers);
    setRadio('exp', p.exp);
    $('ffv-touch').value = String(p.touch || 0);
    setDevice({ name: p.name, size: p.size, hz: p.hz, tier: p.tier, known: p.known, measured: p.measured }, scroll);
  }

  function renderPresets() {
    var list = getPresets().filter(function (x) { return x && validSaved(x.profile); });
    var ul = $('ffv-presets');
    ul.textContent = '';
    $('ffv-no-presets').hidden = list.length > 0;

    list.forEach(function (pr) {
      var li = el('li', 'ffv-preset');
      var info = el('div', 'ffv-preset-info');
      info.appendChild(el('span', 'ffv-preset-name', pr.name));
      info.appendChild(el('span', 'ffv-preset-meta',
        pr.profile.name + ' · ' + STYLE_NAMES[pr.profile.style] + ' · ' + new Date(pr.ts).toLocaleDateString()));

      var btns = el('div', 'ffv-preset-btns');
      var load = el('button', 'ffv-btn ffv-btn-ghost', 'Load');
      load.type = 'button';
      load.addEventListener('click', function () {
        tweak = clamp(+pr.tweak || 0, -TWEAK_LIMIT, TWEAK_LIMIT);
        saveJSON(KEY_TWEAK, tweak);
        restoreProfile(pr.profile, true);
        toast('Preset loaded');
      });
      var del = el('button', 'ffv-btn ffv-btn-ghost ffv-btn-danger', 'Delete');
      del.type = 'button';
      del.addEventListener('click', function () {
        var rest = getPresets().filter(function (x) { return x.id !== pr.id; });
        saveJSON(KEY_PRESETS, rest);
        renderPresets();
        toast('Preset deleted');
      });
      btns.appendChild(load);
      btns.appendChild(del);
      li.appendChild(info);
      li.appendChild(btns);
      ul.appendChild(li);
    });
  }

  function savePreset() {
    if (!current) return;
    var list = getPresets();
    if (list.length >= MAX_PRESETS) { toast('Preset limit reached (' + MAX_PRESETS + '). Delete one first.'); return; }
    var input = $('ffv-preset-name');
    var p = current.profile;
    var name = input.value.trim().slice(0, 30) || (STYLE_NAMES[p.style] + ' setup');
    list.unshift({
      id: Date.now() + '-' + Math.floor(Math.random() * 1000),
      name: name,
      ts: Date.now(),
      tweak: tweak,
      profile: p
    });
    if (saveJSON(KEY_PRESETS, list)) {
      input.value = '';
      renderPresets();
      toast('Preset saved');
    } else {
      toast('Could not save. Browser storage is blocked.');
    }
  }

  /* =====================================================================
     INIT
     ===================================================================== */
  var search$ = $('ffv-search');
  search$.addEventListener('input', onSearchInput);
  search$.addEventListener('focus', function () {
    if (!norm(search$.value) || (device && search$.value === device.name)) showPopular();
    else onSearchInput();
  });
  search$.addEventListener('keydown', onSearchKey);
  document.addEventListener('click', function (e) {
    var box = root.querySelector('.ffv-search');
    if (box && !box.contains(e.target)) hideSuggest();
  });

  $('ffv-detect').addEventListener('click', detect);

  var chips = root.querySelectorAll('.ffv-chip input');
  for (var i = 0; i < chips.length; i++) chips[i].addEventListener('change', function () { update(false); });

  $('ffv-style-quick').addEventListener('change', function () {
    setRadio('style', this.value);
    update(false);
  });

  $('ffv-size').addEventListener('input', markCustom);
  $('ffv-hz').addEventListener('change', markCustom);
  $('ffv-tier').addEventListener('change', markCustom);
  $('ffv-touch').addEventListener('change', function () { update(false); });

  $('ffv-slower').addEventListener('click', function () { adjust(-TWEAK_STEP); });
  $('ffv-faster').addEventListener('click', function () { adjust(TWEAK_STEP); });
  $('ffv-reset-tune').addEventListener('click', resetTune);
  $('ffv-copy').addEventListener('click', copySettings);
  $('ffv-share').addEventListener('click', shareWhatsApp);
  $('ffv-save').addEventListener('click', savePreset);

  var saved = loadJSON(KEY_PROFILE, null);
  if (validSaved(saved)) restoreProfile(saved, false);
  else update(false);

  renderPresets();
})();