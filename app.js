"use strict";

// ---------- Usage counting (GoatCounter) ----------
// Paste your GoatCounter site code here (the "mysite" part of mysite.goatcounter.com).
// While it's empty, nothing is loaded and nothing is counted.
// Only page visits and the event names below are sent: never anything the user types.
const GOATCOUNTER_CODE = "daksh2943";

if (GOATCOUNTER_CODE) {
  const s = document.createElement("script");
  s.async = true;
  s.src = "https://gc.zgo.at/count.js";
  s.setAttribute("data-goatcounter", "https://" + GOATCOUNTER_CODE + ".goatcounter.com/count");
  document.head.appendChild(s);
}

function track(name) {
  try {
    if (window.goatcounter && typeof window.goatcounter.count === "function") {
      window.goatcounter.count({ path: name, title: name, event: true });
    }
  } catch (e) { /* counting must never break the app */ }
}

// ---------- Reference data ----------
// Kept deliberately cautious: these point sellers to rules they should check,
// they do not decide compliance.

const GPSR_LINK = "https://eur-lex.europa.eu/eli/reg/2023/988/oj";

const CATEGORIES = [
  { key: "general", label: "General consumer product (decor, accessories, stationery, homeware…)" },
  { key: "art", label: "Original artwork or prints" },
  { key: "secondhand", label: "Second-hand or vintage (not antique)" },
  { key: "candle", label: "Candle or wax melt" },
  { key: "jewelry", label: "Jewellery" },
  { key: "textile", label: "Clothing or textile product" },
  { key: "toy", label: "Toy, or anything designed for children under 14 to play with" },
  { key: "cosmetic", label: "Cosmetic, skincare or soap" },
  { key: "electrical", label: "Electrical or battery-powered product" },
  { key: "food", label: "Food, drink or food supplement" },
  { key: "plant", label: "Living plant or animal" },
  { key: "medicine", label: "Medicine" },
  { key: "antique", label: "Antique" }
];

// Categories GPSR itself does not cover (Article 2(2) of Regulation (EU) 2023/988).
const EXCLUDED = {
  food: "Food is excluded from GPSR. It is covered by EU food law instead, which has its own labelling and safety rules.",
  plant: "Living plants and animals are excluded from GPSR. Other EU rules (for example plant health and animal health law) may apply.",
  medicine: "Medicinal products are excluded from GPSR. They are covered by EU medicines law, which generally needs authorisation before sale.",
  antique: "Antiques are excluded from GPSR."
};

const FLAGS = [
  { key: "children", label: "Could be used by or reach children" },
  { key: "smallParts", label: "Has small or detachable parts" },
  { key: "sharp", label: "Has sharp edges or points" },
  { key: "cords", label: "Has cords, ribbons or strings" },
  { key: "flame", label: "Burns, or involves a flame" },
  { key: "heat", label: "Gets hot during use" },
  { key: "electrical", label: "Uses mains power or batteries" },
  { key: "skin", label: "Is applied to or worn against skin" },
  { key: "metal", label: "Has metal parts that touch skin" },
  { key: "foodContact", label: "Touches food or drink" },
  { key: "chemicals", label: "Contains paints, dyes, glues, resins or fragrance" },
  { key: "glass", label: "Is glass, ceramic or could shatter" }
];

const HAZARDS = {
  general: "Breaks or is misused in a way a buyer could reasonably be expected to use it",
  children: "A child gets hold of it and uses it in an unintended way",
  smallParts: "Small parts are swallowed or inhaled (choking)",
  sharp: "Cuts or punctures from edges or points",
  cords: "Strangulation or entanglement from cords, ribbons or strings",
  flame: "Fire, or burns from flame or hot wax",
  heat: "Burns from hot surfaces",
  electrical: "Electric shock, overheating or battery fire",
  skin: "Skin irritation or allergic reaction",
  metal: "Harmful metals (such as nickel, lead or cadmium) in parts that touch skin",
  foodContact: "Harmful substances passing from the product into food or drink",
  chemicals: "Exposure to hazardous substances in paints, dyes, glues, resins or fragrance",
  glass: "Cuts from broken glass or ceramic"
};

// Other EU rules worth checking, by category or flag.
function otherRules(p) {
  const out = [];
  const f = p.flags || {};
  if (p.category === "toy") {
    out.push("<strong>EU toy safety law</strong> (currently the Toy Safety Directive 2009/48/EC, which a new Toy Safety Regulation is replacing). Toys generally need a safety assessment, technical documentation, an EU declaration of conformity and CE marking before sale.");
  }
  if (p.category === "cosmetic") {
    out.push("<strong>EU Cosmetics Regulation (EC) No 1223/2009.</strong> Cosmetics need an EU-based Responsible Person, a cosmetic product safety report, and notification on the EU Cosmetic Products Notification Portal (CPNP) before sale. Soap sold as a cleanser is usually treated as a cosmetic.");
  }
  if (p.category === "electrical" || f.electrical) {
    out.push("<strong>EU electrical product rules</strong>, such as the Low Voltage Directive 2014/35/EU, EMC Directive 2014/30/EU and RoHS Directive 2011/65/EU (with CE marking), plus the EU Batteries Regulation (EU) 2023/1542 and e-waste (WEEE) obligations where relevant.");
  }
  if (p.category === "jewelry" || f.metal) {
    out.push("<strong>REACH restrictions (Regulation (EC) No 1907/2006, Annex XVII)</strong> on nickel release, lead and cadmium in jewellery and metal items that touch skin.");
  }
  if (f.foodContact) {
    out.push("<strong>EU food contact materials rules (Regulation (EC) No 1935/2004)</strong>, plus specific rules for some materials such as plastics and ceramics.");
  }
  if (p.category === "textile") {
    out.push("<strong>EU Textile Labelling Regulation (EU) No 1007/2011</strong>, which requires a fibre composition label. Children's clothing with cords or drawstrings also has specific safety standards.");
  }
  if (p.category === "candle" || f.flame) {
    out.push("<strong>Candle safety labelling.</strong> Sellers commonly follow the European standard EN 15494 for candle safety warnings and symbols.");
  }
  if (f.children && p.category !== "toy") {
    out.push("<strong>Products for children get extra scrutiny under GPSR.</strong> Consider whether the product could count as a toy under EU toy safety law.");
  }
  out.push("<strong>EU packaging rules (Packaging and Packaging Waste Regulation (EU) 2025/40)</strong>, which have applied since 12 August 2026. Some EU countries also require you to register for packaging recycling (EPR) before selling there.");
  return out;
}

// ---------- Storage ----------
const STORE_KEY = "gpsr-helper-v1";
const emptyState = () => ({ business: {}, products: [], worth: {} });

function load() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return emptyState();
    const parsed = JSON.parse(raw);
    return Object.assign(emptyState(), parsed);
  } catch (e) {
    return emptyState();
  }
}

let state = load();
let storageOk = true;

function save() {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(state));
    storageOk = true;
  } catch (e) {
    storageOk = false;
    alertBanner("Couldn't save on this device (your browser may be blocking storage). Download a backup from “My data” so you don't lose your work.");
  }
}

// ---------- Helpers ----------
const $ = (sel) => document.querySelector(sel);
const esc = (s) => String(s == null ? "" : s)
  .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
const oneLine = (s) => String(s || "").split(/\r?\n/).map((x) => x.trim()).filter(Boolean).join(", ");
const catLabel = (key) => (CATEGORIES.find((c) => c.key === key) || {}).label || key;

function alertBanner(msg) {
  let el = $("#global-alert");
  if (!el) {
    el = document.createElement("div");
    el.id = "global-alert";
    el.className = "notice bad";
    $("main").prepend(el);
  }
  el.textContent = msg;
}

function needsRP() {
  return state.business.inEU !== "yes";
}

function missingDetails() {
  const b = state.business;
  const miss = [];
  if (!b.name) miss.push("your business name");
  if (!b.address) miss.push("your postal address");
  if (!b.email) miss.push("your email or website contact");
  if (needsRP()) {
    if (!b.rpName) miss.push("EU Responsible Person name");
    if (!b.rpAddress) miss.push("EU Responsible Person address");
    if (!b.rpEmail) miss.push("EU Responsible Person email or website contact");
  }
  return miss;
}

// ---------- Text generators ----------
function listingText(p) {
  const b = state.business;
  const lines = [];
  lines.push("PRODUCT SAFETY INFORMATION (EU)");
  lines.push("Manufacturer: " + [b.name, oneLine(b.address), b.email].filter(Boolean).join(", "));
  if (needsRP()) {
    lines.push("EU Responsible Person: " + ([b.rpName, oneLine(b.rpAddress), b.rpEmail].filter(Boolean).join(", ") || "[MISSING – add before selling to the EU]"));
  }
  lines.push("Product: " + p.name + " | Type/batch: " + p.identifier);
  lines.push("Warnings and safety information: " + (p.warnings && p.warnings.trim() ? p.warnings.trim() : "[Add warnings, or state that no special precautions are needed]"));
  return lines.join("\n");
}

function labelText(p) {
  const b = state.business;
  const lines = [];
  lines.push(p.name + " – " + p.identifier);
  lines.push("Made by: " + [b.name, oneLine(b.address), b.email].filter(Boolean).join(", "));
  if (needsRP()) {
    lines.push("EU Responsible Person: " + ([b.rpName, oneLine(b.rpAddress), b.rpEmail].filter(Boolean).join(", ") || "[MISSING]"));
  }
  if (p.warnings && p.warnings.trim()) lines.push("Warnings: " + p.warnings.trim());
  return lines.join("\n");
}

// ---------- Router ----------
const VIEWS = ["start", "business", "products", "edit", "detail", "worth", "data"];

function route() {
  const hash = location.hash.replace(/^#/, "") || "start";
  const [view, id] = hash.split("/");
  const v = VIEWS.includes(view) ? view : "start";
  document.querySelectorAll("section[data-view]").forEach((s) => s.classList.toggle("active", s.dataset.view === v));
  const navKey = v === "edit" || v === "detail" ? "products" : v;
  document.querySelectorAll("nav a").forEach((a) => a.classList.toggle("active", a.dataset.nav === navKey));

  if (v === "business") renderBusiness();
  if (v === "products") renderProducts();
  if (v === "edit") renderEditor(id);
  if (v === "detail") renderDetail(id);
  if (v === "worth") renderWorth();
  window.scrollTo(0, 0);
}

// ---------- Business ----------
function renderBusiness() {
  const f = $("#business-form").elements;
  const b = state.business;
  f.name.value = b.name || "";
  f.address.value = b.address || "";
  f.email.value = b.email || "";
  f.inEU.value = b.inEU || "no";
  f.rpName.value = b.rpName || "";
  f.rpAddress.value = b.rpAddress || "";
  f.rpEmail.value = b.rpEmail || "";
  $("#rp-block").hidden = f.inEU.value === "yes";
  $("#business-saved").hidden = true;
}

$("#b-eu").addEventListener("change", (e) => { $("#rp-block").hidden = e.target.value === "yes"; });

$("#business-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const f = e.target.elements;
  state.business = {
    name: f.name.value.trim(),
    address: f.address.value.trim(),
    email: f.email.value.trim(),
    inEU: f.inEU.value,
    rpName: f.rpName.value.trim(),
    rpAddress: f.rpAddress.value.trim(),
    rpEmail: f.rpEmail.value.trim()
  };
  save();
  if (storageOk) $("#business-saved").hidden = false;
  track("details-saved");
});

// ---------- Products ----------
function renderProducts() {
  const list = $("#product-list");
  const miss = missingDetails();
  let html = "";
  if (miss.length) {
    html += `<div class="notice warn">Your listing text will be incomplete until you add: ${esc(miss.join(", "))}. <a href="#business">Add my details</a></div>`;
  }
  if (!state.products.length) {
    html += `<div class="card"><p>No products yet. Add your first one to get its listing text, label text and risk assessment.</p></div>`;
  }
  state.products.forEach((p) => {
    const excluded = EXCLUDED[p.category];
    html += `<div class="card product-item">
      <div><strong>${esc(p.name)}</strong><small>${esc(p.identifier)} · ${esc(catLabel(p.category))}${excluded ? " · not covered by GPSR" : ""}</small></div>
      <div class="actions" style="margin:0">
        <a class="btn" href="#detail/${encodeURIComponent(p.id)}">Open</a>
        <a class="btn" href="#edit/${encodeURIComponent(p.id)}">Edit</a>
        <button type="button" class="danger" data-del="${esc(p.id)}">Delete</button>
      </div>
    </div>`;
  });
  list.innerHTML = html;
}

$("#product-list").addEventListener("click", (e) => {
  const id = e.target.getAttribute("data-del");
  if (!id) return;
  const p = state.products.find((x) => x.id === id);
  if (!p || !confirm(`Delete “${p.name}”? This can't be undone.`)) return;
  state.products = state.products.filter((x) => x.id !== id);
  save();
  renderProducts();
});

$("#add-product").addEventListener("click", () => { location.hash = "edit"; });

// Build category select and flag checkboxes once.
$("#p-cat").innerHTML = CATEGORIES.map((c) => `<option value="${c.key}">${esc(c.label)}</option>`).join("");
$("#p-flags").innerHTML = FLAGS.map((fl) =>
  `<label><input type="checkbox" name="flag-${fl.key}"> <span>${esc(fl.label)}</span></label>`).join("");

function renderEditor(id) {
  const f = $("#product-form").elements;
  const p = id ? state.products.find((x) => x.id === decodeURIComponent(id)) : null;
  $("#edit-title").textContent = p ? "Edit product" : "Add a product";
  f.id.value = p ? p.id : "";
  f.name.value = p ? p.name : "";
  f.identifier.value = p ? p.identifier : "";
  f.category.value = p ? p.category : "general";
  f.warnings.value = p ? p.warnings || "" : "";
  FLAGS.forEach((fl) => { f["flag-" + fl.key].checked = !!(p && p.flags && p.flags[fl.key]); });
}

$("#product-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const f = e.target.elements;
  const flags = {};
  FLAGS.forEach((fl) => { if (f["flag-" + fl.key].checked) flags[fl.key] = true; });
  const existing = state.products.find((x) => x.id === f.id.value);
  const p = {
    id: f.id.value || uid(),
    name: f.name.value.trim(),
    identifier: f.identifier.value.trim(),
    category: f.category.value,
    flags,
    warnings: f.warnings.value.trim(),
    risk: existing ? existing.risk || {} : {},
    assessedBy: existing ? existing.assessedBy || "" : "",
    assessedOn: existing ? existing.assessedOn || "" : ""
  };
  if (existing) {
    state.products = state.products.map((x) => (x.id === p.id ? p : x));
  } else {
    state.products.push(p);
    track("product-added");
  }
  save();
  location.hash = "detail/" + encodeURIComponent(p.id);
});

$("#cancel-edit").addEventListener("click", () => { history.length > 1 ? history.back() : (location.hash = "products"); });

// ---------- Product detail ----------
let currentId = null;

function hazardsFor(p) {
  const keys = ["general"];
  Object.keys(p.flags || {}).forEach((k) => { if (HAZARDS[k]) keys.push(k); });
  return keys;
}

function renderDetail(id) {
  const body = $("#detail-body");
  const p = state.products.find((x) => x.id === decodeURIComponent(id || ""));
  if (!p) {
    body.innerHTML = `<div class="card"><p>Product not found.</p></div>`;
    return;
  }
  currentId = p.id;
  const excluded = EXCLUDED[p.category];
  const miss = missingDetails();
  let html = `<h2>${esc(p.name)}</h2><p class="hint">${esc(p.identifier)} · ${esc(catLabel(p.category))}</p>`;

  // 1. Scope
  html += `<h3>1. Does GPSR apply?</h3>`;
  if (excluded) {
    html += `<div class="notice info">${esc(excluded)} This tool only covers GPSR, so check those rules separately.</div>`;
    body.innerHTML = html;
    return;
  }
  if (p.category === "art") {
    html += `<div class="notice warn"><strong>Probably yes.</strong> GPSR does not list artwork as an exclusion, and the rules on this are unclear. Unless a professional advises otherwise, treat it as covered. For most art the safety information can be short (for example, about hanging fixings or fragile glass).</div>`;
  } else if (p.category === "secondhand") {
    html += `<div class="notice warn"><strong>Yes.</strong> Second-hand products are covered by GPSR. Antiques are not.</div>`;
  } else {
    html += `<div class="notice warn"><strong>Yes, very likely</strong>, if you sell this product to consumers in the EU.</div>`;
  }
  const rules = otherRules(p);
  html += `<div class="card"><strong>Other EU rules to check for this product</strong><ul class="clean">${rules.map((r) => `<li>${r}</li>`).join("")}</ul></div>`;

  // 2. Listing text
  html += `<h3>2. Safety information for your online listing</h3>`;
  if (miss.length) html += `<div class="notice bad">Missing: ${esc(miss.join(", "))}. <a href="#business">Add my details</a></div>`;
  html += `<p class="hint">Online listings must show this information (GPSR Article 19). Warnings must be in a language easily understood by buyers in each EU country you sell to, so get them translated: this tool doesn't translate.</p>
    <textarea class="output" id="listing-out" readonly>${esc(listingText(p))}</textarea>
    <div class="actions no-print"><button type="button" data-copy="listing-out">Copy listing text</button></div>`;

  // 3. Label text
  html += `<h3>3. Text for the product, its packaging or an included document</h3>
    <p class="hint">The type, batch or serial number and the manufacturer's details must be on the product. If the product is too small, put them on the packaging or a document that comes with it (GPSR Article 9).</p>
    <textarea class="output" id="label-out" readonly>${esc(labelText(p))}</textarea>
    <div class="actions no-print"><button type="button" data-copy="label-out">Copy label text</button></div>`;

  // 4. Risk assessment
  const hz = hazardsFor(p);
  html += `<h3>4. Risk assessment</h3>
    <p class="hint">Manufacturers must analyse the risks of their product and keep technical documentation for 10 years (GPSR Article 9). For each possible hazard, write down whether it applies and what you do to reduce it. Then print or save this page as a PDF and keep it.</p>
    <div class="card"><table><thead><tr><th style="width:40%">Possible hazard</th><th>Does it apply, and how do you reduce it?</th></tr></thead><tbody>`;
  hz.forEach((k) => {
    const val = (p.risk && p.risk[k]) || "";
    html += `<tr><td>${esc(HAZARDS[k])}</td><td><textarea data-risk="${k}" placeholder="e.g. Not applicable because… / Reduced by…">${esc(val)}</textarea></td></tr>`;
  });
  html += `</tbody></table>
    <div class="row">
      <div><label for="r-by">Assessed by</label><input type="text" id="r-by" value="${esc(p.assessedBy || "")}"></div>
      <div><label for="r-on">Date</label><input type="text" id="r-on" placeholder="YYYY-MM-DD" value="${esc(p.assessedOn || "")}"></div>
    </div>
    <div class="actions no-print"><button type="button" class="primary" id="save-risk">Save risk assessment</button></div>
    <div id="risk-saved" class="notice ok" hidden>Saved on this device.</div>
    </div>`;

  // 5. If something goes wrong
  html += `<h3>5. If something goes wrong</h3>
    <div class="card"><ul class="clean">
      <li>If your product causes a serious accident, GPSR requires you to report it to the authorities through the EU's <strong>Safety Business Gateway</strong> without delay.</li>
      <li>Keep a record of customer complaints about safety.</li>
      <li>If a product turns out to be unsafe, you may need to stop selling it, warn buyers or recall it.</li>
      <li>Full text: <a href="${GPSR_LINK}" target="_blank" rel="noopener">Regulation (EU) 2023/988 on EUR-Lex</a>.</li>
    </ul></div>`;

  body.innerHTML = html;
}

$("#detail-body").addEventListener("click", (e) => {
  const copyId = e.target.getAttribute("data-copy");
  if (copyId) {
    const ta = document.getElementById(copyId);
    track(copyId === "listing-out" ? "listing-text-copied" : "label-text-copied");
    const done = () => { e.target.textContent = "Copied ✓"; setTimeout(() => { e.target.textContent = copyId === "listing-out" ? "Copy listing text" : "Copy label text"; }, 1500); };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(ta.value).then(done, () => { ta.select(); document.execCommand("copy"); done(); });
    } else {
      ta.select(); document.execCommand("copy"); done();
    }
  }
  if (e.target.id === "save-risk") {
    const p = state.products.find((x) => x.id === currentId);
    if (!p) return;
    p.risk = {};
    document.querySelectorAll("[data-risk]").forEach((t) => { if (t.value.trim()) p.risk[t.dataset.risk] = t.value.trim(); });
    p.assessedBy = $("#r-by").value.trim();
    p.assessedOn = $("#r-on").value.trim();
    save();
    if (storageOk) $("#risk-saved").hidden = false;
    track("risk-assessment-saved");
  }
});

$("#detail-edit").addEventListener("click", () => { if (currentId) location.hash = "edit/" + encodeURIComponent(currentId); });

// ---------- Worth it calculator ----------
function renderWorth() {
  const f = $("#worth-form").elements;
  const w = state.worth || {};
  ["orders", "profit", "rp", "other"].forEach((k) => { f[k].value = w[k] != null ? w[k] : 0; });
  calcWorth();
}

function calcWorth() {
  const f = $("#worth-form").elements;
  const num = (v) => { const n = parseFloat(v); return isFinite(n) && n > 0 ? n : 0; };
  const w = { orders: num(f.orders.value), profit: num(f.profit.value), rp: num(f.rp.value), other: num(f.other.value) };
  state.worth = w;
  save();
  const income = w.orders * w.profit;
  const cost = w.rp + w.other;
  const net = income - cost;
  const fmt = (n) => n.toLocaleString(undefined, { maximumFractionDigits: 2 });
  let verdict, cls;
  if (income === 0 && cost === 0) {
    $("#worth-result").innerHTML = `<div class="notice info">Fill in the numbers above to see the result.</div>`;
    return;
  }
  const share = income > 0 ? cost / income : Infinity;
  if (share < 0.1) { cls = "ok"; verdict = "Compliance is a small cost compared with your EU profit. It's likely worth staying in the EU."; }
  else if (share <= 0.5) { cls = "warn"; verdict = "Compliance takes a noticeable share of your EU profit. Worth it if you expect EU sales to grow, or if you can cut costs."; }
  else { cls = "bad"; verdict = "Compliance eats most or all of your EU profit at current volume. Consider pausing EU sales for these products until volume grows."; }
  $("#worth-result").innerHTML = `
    <div class="card">
      <div class="row">
        <div><div class="hint">EU profit per year</div><div class="stat">${fmt(income)}</div></div>
        <div><div class="hint">Compliance cost per year</div><div class="stat">${fmt(cost)}</div></div>
        <div><div class="hint">What's left</div><div class="stat">${fmt(net)}</div></div>
        <div><div class="hint">Compliance as share of EU profit</div><div class="stat">${isFinite(share) ? Math.round(share * 100) + "%" : "—"}</div></div>
      </div>
    </div>
    <div class="notice ${cls}">${esc(verdict)}</div>
    <p class="hint">A rough guide only, using whatever currency you entered. It doesn't include fines or the cost of a listing being removed.</p>`;
}

let worthTracked = false;
$("#worth-form").addEventListener("input", () => {
  calcWorth();
  if (!worthTracked) { worthTracked = true; track("calculator-used"); }
});
window.addEventListener("beforeprint", () => track("printed"));

// ---------- Data ----------
function dataMsg(text, cls) {
  const el = $("#data-msg");
  el.className = "notice " + cls;
  el.textContent = text;
  el.hidden = false;
}

$("#export-data").addEventListener("click", () => {
  track("backup-downloaded");
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "gpsr-helper-backup-" + new Date().toISOString().slice(0, 10) + ".json";
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
});

$("#import-file").addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);
      if (!data || typeof data !== "object" || !Array.isArray(data.products)) throw new Error("bad");
      const clean = emptyState();
      clean.business = typeof data.business === "object" && data.business ? data.business : {};
      clean.worth = typeof data.worth === "object" && data.worth ? data.worth : {};
      clean.products = data.products.filter((p) => p && typeof p === "object" && p.id && p.name);
      if (!confirm("Replace everything currently saved with this backup?")) return;
      state = clean;
      save();
      dataMsg(`Restored ${state.products.length} product(s).`, "ok");
    } catch (err) {
      dataMsg("That file doesn't look like a GPSR Helper backup.", "bad");
    } finally {
      e.target.value = "";
    }
  };
  reader.readAsText(file);
});

$("#delete-all").addEventListener("click", () => {
  if (!confirm("Delete all your details and products from this device? This can't be undone.")) return;
  try { localStorage.removeItem(STORE_KEY); } catch (e) { /* storage unavailable: nothing saved anyway */ }
  state = emptyState();
  dataMsg("All data deleted from this device.", "ok");
});

// ---------- Init ----------
window.addEventListener("hashchange", route);
route();
