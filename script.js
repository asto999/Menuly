// ===== Live order demo =====
(function () {
  const menuList = document.getElementById("menuList");
  const items = Array.from(menuList.querySelectorAll(".menu__item"));
  const cartSummary = document.getElementById("cartSummary");
  const sendBtn = document.getElementById("sendOrderBtn");
  const toast = document.getElementById("orderToast");
  const tableNumEl = document.getElementById("tableNum");
  const upsellNudge = document.getElementById("upsellNudge");
  const upsellAddBtn = document.getElementById("upsellAddBtn");
  const upsellDismiss = document.getElementById("upsellDismiss");
  const toggle86Btn = document.getElementById("toggle86Btn");
  const ticketQueue = document.getElementById("ticketQueue");
  const kitchenEmpty = document.getElementById("kitchenEmpty");

  const MAIN_IDS = ["butter-chicken", "paneer-masala", "veg-biryani"];
  const UPSELL_ID = "gulab-jamun";
  const SOLDOUT_ID = "butter-chicken";

  const state = {
    qty: {},
    soldOut: {},
    upsellDismissed: false,
    orderNo: 40,
  };

  items.forEach((el) => {
    state.qty[el.dataset.id] = 0;
  });

  const tableNumber = Math.floor(Math.random() * 12) + 1;
  tableNumEl.textContent = tableNumber;

  function currency(n) {
    return "₹" + n.toLocaleString("en-IN");
  }

  function cartTotals() {
    let count = 0;
    let total = 0;
    items.forEach((el) => {
      const id = el.dataset.id;
      const qty = state.qty[id] || 0;
      const price = Number(el.dataset.price);
      count += qty;
      total += qty * price;
    });
    return { count, total };
  }

  function renderItem(el) {
    const id = el.dataset.id;
    const qty = state.qty[id] || 0;
    const valEl = el.querySelector(".qty__val");
    const decBtn = el.querySelector('[data-action="dec"]');
    const incBtn = el.querySelector('[data-action="inc"]');
    const soldOut = !!state.soldOut[id];

    valEl.textContent = qty;
    el.classList.toggle("menu__item--soldout", soldOut);
    decBtn.disabled = soldOut || qty === 0;
    incBtn.disabled = soldOut;

    let label = el.querySelector(".menu__soldout-label");
    if (soldOut) {
      el.querySelector(".menu__qty").style.display = "none";
      if (!label) {
        label = document.createElement("span");
        label.className = "menu__soldout-label";
        label.textContent = "Sold out";
        el.appendChild(label);
      }
    } else {
      el.querySelector(".menu__qty").style.display = "";
      if (label) label.remove();
    }
  }

  function renderUpsell() {
    if (state.upsellDismissed || state.soldOut[UPSELL_ID]) {
      upsellNudge.hidden = true;
      return;
    }
    const anyMain = MAIN_IDS.some((id) => (state.qty[id] || 0) > 0);
    const alreadyHasUpsell = (state.qty[UPSELL_ID] || 0) > 0;
    upsellNudge.hidden = !(anyMain && !alreadyHasUpsell);
  }

  function renderCart() {
    const { count, total } = cartTotals();
    cartSummary.textContent = `${count} item${count === 1 ? "" : "s"} · ${currency(total)}`;
    sendBtn.disabled = count === 0;
  }

  function renderAll() {
    items.forEach(renderItem);
    renderUpsell();
    renderCart();
  }

  menuList.addEventListener("click", (e) => {
    const btn = e.target.closest(".qty__btn");
    if (!btn) return;
    const itemEl = btn.closest(".menu__item");
    const id = itemEl.dataset.id;
    if (state.soldOut[id]) return;

    const action = btn.dataset.action;
    const current = state.qty[id] || 0;
    if (action === "inc") {
      state.qty[id] = current + 1;
    } else if (action === "dec") {
      state.qty[id] = Math.max(0, current - 1);
    }
    renderAll();
  });

  upsellAddBtn.addEventListener("click", () => {
    state.qty[UPSELL_ID] = (state.qty[UPSELL_ID] || 0) + 1;
    renderAll();
  });

  upsellDismiss.addEventListener("click", () => {
    state.upsellDismissed = true;
    renderUpsell();
  });

  toggle86Btn.addEventListener("click", () => {
    const nowSoldOut = !state.soldOut[SOLDOUT_ID];
    state.soldOut[SOLDOUT_ID] = nowSoldOut;
    if (nowSoldOut) {
      state.qty[SOLDOUT_ID] = 0;
    }
    toggle86Btn.textContent = nowSoldOut
      ? "Bring Butter Chicken back"
      : "Mark Butter Chicken sold out";
    renderAll();
  });

  function buildTicket(orderItems, total) {
    const ticket = document.createElement("div");
    ticket.className = "ticket";

    const now = new Date();
    const time = now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

    const head = document.createElement("div");
    head.className = "ticket__head";
    head.innerHTML = `<span>#${String(state.orderNo).padStart(4, "0")}</span><span>Table ${tableNumber}</span>`;

    const list = document.createElement("ul");
    list.className = "ticket__items";
    orderItems.forEach(({ name, qty }) => {
      const li = document.createElement("li");
      li.textContent = `${qty}× ${name}`;
      list.appendChild(li);
    });

    const foot = document.createElement("div");
    foot.className = "ticket__foot";
    foot.innerHTML = `<span>${time}</span><span>${currency(total)}</span>`;

    ticket.appendChild(head);
    ticket.appendChild(list);
    ticket.appendChild(foot);
    return ticket;
  }

  sendBtn.addEventListener("click", () => {
    const orderItems = [];
    let total = 0;
    items.forEach((el) => {
      const id = el.dataset.id;
      const qty = state.qty[id] || 0;
      if (qty > 0) {
        orderItems.push({ name: el.dataset.name, qty });
        total += qty * Number(el.dataset.price);
      }
    });
    if (orderItems.length === 0) return;

    state.orderNo += 1;

    setTimeout(() => {
      if (kitchenEmpty) kitchenEmpty.remove();
      const ticket = buildTicket(orderItems, total);
      ticketQueue.insertBefore(ticket, ticketQueue.firstChild);
    }, 450);

    items.forEach((el) => {
      state.qty[el.dataset.id] = 0;
    });
    state.upsellDismissed = false;
    renderAll();

    toast.hidden = false;
    clearTimeout(toast._t);
    toast._t = setTimeout(() => {
      toast.hidden = true;
    }, 2600);
  });

  renderAll();
})();

// ===== ROI calculator =====
(function () {
  const tablesEl = document.getElementById("roiTables");
  const minutesEl = document.getElementById("roiMinutes");
  const spendEl = document.getElementById("roiSpend");
  const turnsOut = document.getElementById("roiTurns");
  const moneyOut = document.getElementById("roiMoney");

  const MINUTES_PER_EXTRA_TURN = 30;

  function format(num) {
    return Number(num).toLocaleString("en-IN", { maximumFractionDigits: 1 });
  }

  function recalc() {
    const tables = Math.max(0, Number(tablesEl.value) || 0);
    const minutes = Math.max(0, Number(minutesEl.value) || 0);
    const spend = Math.max(0, Number(spendEl.value) || 0);

    const totalMinutesSaved = tables * minutes;
    const extraTurnsPerDay = totalMinutesSaved / MINUTES_PER_EXTRA_TURN;
    const extraRevenuePerMonth = extraTurnsPerDay * spend * 30;

    turnsOut.textContent = format(extraTurnsPerDay);
    moneyOut.textContent = "₹" + Math.round(extraRevenuePerMonth).toLocaleString("en-IN");
  }

  [tablesEl, minutesEl, spendEl].forEach((el) => el.addEventListener("input", recalc));
  recalc();
})();

// ===== Contact form =====
(function () {
  const form = document.getElementById("contactForm");
  const confirmEl = document.getElementById("contactConfirm");

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = document.getElementById("cName").value.trim();
    const business = document.getElementById("cBusiness").value.trim();
    const email = document.getElementById("cEmail").value.trim();
    const message = document.getElementById("cMessage").value.trim();

    const subject = `Interested in Menuly — ${business}`;
    const body = [`Name: ${name}`, `Restaurant: ${business}`, `Email: ${email}`, ``, message].join("\n");

    const mailto = `mailto:rajputashutosh999@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailto;

    confirmEl.textContent = "Opening your email app with this filled in — just hit send.";
    confirmEl.hidden = false;
  });
})();
