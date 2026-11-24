const CATALOGS = {
  laptop: {
    intent: "Lightweight developer laptop, 32GB RAM, long battery life, under $1,800",
    items: [
      {
        id: "lap-1",
        name: "ThinkPad X1 Carbon Gen 12 (32GB / 1TB)",
        vendor: "Lenovo Direct Enterprise",
        basePrice: 1589,
        shippingTax: 45,
        deliveryDays: 2,
        qualityScore: 95,
        sustainScore: 90,
        reviews: "4.8/5 (1,420 verified)",
        pro: "Best-in-class Linux/dev keyboard & 3-yr onsite warranty",
        con: "Integrated GPU limits heavy 3D rendering"
      },
      {
        id: "lap-2",
        name: "MacBook Pro 14 (M3 Pro, 36GB / 512GB)",
        vendor: "B&H Photo Authorized",
        basePrice: 1749,
        shippingTax: 0,
        deliveryDays: 1,
        qualityScore: 98,
        sustainScore: 92,
        reviews: "4.9/5 (3,890 verified)",
        pro: "18-hr real battery life & next-day free shipping",
        con: "Highest upfront landed cost in tier"
      },
      {
        id: "lap-3",
        name: "ASUS Zenbook 14 OLED (Ultra 7, 32GB)",
        vendor: "Newegg Business",
        basePrice: 1249,
        shippingTax: 39,
        deliveryDays: 4,
        qualityScore: 86,
        sustainScore: 78,
        reviews: "4.5/5 (910 verified)",
        pro: "Lowest landed cost ($461 below top competitor)",
        con: "Standard 1-yr depot warranty; 4-day transit"
      },
      {
        id: "lap-4",
        name: "Framework Laptop 13 DIY (Ryzen 7, 32GB)",
        vendor: "Framework Marketplace",
        basePrice: 1399,
        shippingTax: 29,
        deliveryDays: 5,
        qualityScore: 91,
        sustainScore: 99,
        reviews: "4.7/5 (1,150 verified)",
        pro: "10/10 repairability & modular upgradeable ports",
        con: "5-day international fulfillment window"
      }
    ]
  },
  office: {
    intent: "Ergonomic mesh chair + dual-motor standing desk bundle for home office",
    items: [
      {
        id: "off-1",
        name: "Herman Miller Aeron + Jarvis Bamboo Frame",
        vendor: "Fully / MillerKnoll Direct",
        basePrice: 1620,
        shippingTax: 0,
        deliveryDays: 3,
        qualityScore: 98,
        sustainScore: 94,
        reviews: "4.9/5 (4,210 verified)",
        pro: "12-year commercial warranty & zero-VOC bamboo top",
        con: "Premium investment tier"
      },
      {
        id: "off-2",
        name: "Steelcase Leap V2 + Uplift V2 Commercial",
        vendor: "Uplift Workspace",
        basePrice: 1490,
        shippingTax: 49,
        deliveryDays: 2,
        qualityScore: 95,
        sustainScore: 88,
        reviews: "4.8/5 (2,340 verified)",
        pro: "Fastest 2-day freight dispatch & high stability",
        con: "Requires 45-min frame assembly"
      },
      {
        id: "off-3",
        name: "Branch Ergonomic Pro + FlexiSpot E7",
        vendor: "Branch Direct",
        basePrice: 985,
        shippingTax: 35,
        deliveryDays: 4,
        qualityScore: 87,
        sustainScore: 82,
        reviews: "4.6/5 (1,780 verified)",
        pro: "Saves ~$500+ with strong lumbar support",
        con: "7-year warranty vs 12-year enterprise tier"
      }
    ]
  },
  espresso: {
    intent: "Dual-boiler commercial espresso setup with PID temperature control",
    items: [
      {
        id: "esp-1",
        name: "Profitec Pro 600 Dual Boiler + Flow Control",
        vendor: "Clive Coffee",
        basePrice: 2399,
        shippingTax: 0,
        deliveryDays: 2,
        qualityScore: 97,
        sustainScore: 91,
        reviews: "4.9/5 (640 verified)",
        pro: "Bench-tested before shipping + 3-yr parts/labor",
        con: "20-minute heat-up cycle without smart plug"
      },
      {
        id: "esp-2",
        name: "Breville Dual Boiler BES920XL",
        vendor: "Seattle Coffee Gear",
        basePrice: 1599,
        shippingTax: 0,
        deliveryDays: 1,
        qualityScore: 89,
        sustainScore: 76,
        reviews: "4.6/5 (2,810 verified)",
        pro: "Fastest 8-min warmup & lowest price by $800",
        con: "Higher long-term gasket maintenance frequency"
      },
      {
        id: "esp-3",
        name: "Lelit Bianca V3 Dual Boiler",
        vendor: "1st-Line Equipment",
        basePrice: 2695,
        shippingTax: 65,
        deliveryDays: 4,
        qualityScore: 98,
        sustainScore: 93,
        reviews: "4.9/5 (520 verified)",
        pro: "Rotary pump + movable water reservoir",
        con: "Highest landed price + freight surcharge"
      }
    ]
  }
};

let activePreset = "laptop";
let rankedItems = [];
let activeTab = "digest";

const auditLogs = [
  "09:14 AM — Price-Drop Watchdog armed for ThinkPad X1 Carbon (target < $1,550).",
  "08:42 AM — Weekly Commercial Digest dispatched to procurement@acme.io (4 offers)."
];

// DOM Elements
const intentInput = document.getElementById("intentInput");
const scanBtn = document.getElementById("scanBtn");
const choicesGrid = document.getElementById("choicesGrid");
const pipelineBox = document.getElementById("pipelineBox");
const progressBar = document.getElementById("progressBar");
const pipelineStatus = document.getElementById("pipelineStatus");

const weights = {
  price: document.getElementById("priceWeight"),
  quality: document.getElementById("qualityWeight"),
  speed: document.getElementById("speedWeight"),
  sustain: document.getElementById("sustainWeight")
};

const weightLabels = {
  price: document.getElementById("priceWeightVal"),
  quality: document.getElementById("qualityWeightVal"),
  speed: document.getElementById("speedWeightVal"),
  sustain: document.getElementById("sustainWeightVal")
};

// Email Modal Elements
const emailModal = document.getElementById("emailModal");
const openEmailHubBtn = document.getElementById("openEmailHubBtn");
const closeEmailModalBtn = document.getElementById("closeEmailModalBtn");
const selectedProductSelect = document.getElementById("selectedProductSelect");
const emailSubject = document.getElementById("emailSubject");
const emailBody = document.getElementById("emailBody");
const sendEmailBtn = document.getElementById("sendEmailBtn");
const auditLogList = document.getElementById("auditLogList");
const logCountBadge = document.getElementById("logCountBadge");
const toast = document.getElementById("toast");

function computeScores() {
  const items = CATALOGS[activePreset].items;
  const landedPrices = items.map((i) => i.basePrice + i.shippingTax);
  const minPrice = Math.min(...landedPrices);
  const maxPrice = Math.max(...landedPrices);

  const wP = Number(weights.price.value);
  const wQ = Number(weights.quality.value);
  const wS = Number(weights.speed.value);
  const wE = Number(weights.sustain.value);
  const totalW = wP + wQ + wS + wE || 1;

  rankedItems = items
    .map((item) => {
      const landed = item.basePrice + item.shippingTax;
      const priceNorm =
        maxPrice === minPrice ? 100 : 100 - ((landed - minPrice) / (maxPrice - minPrice)) * 35;
      const speedNorm = Math.max(60, 105 - item.deliveryDays * 8);

      const rawScore =
        (priceNorm * wP +
          item.qualityScore * wQ +
          speedNorm * wS +
          item.sustainScore * wE) /
        totalW;

      return {
        ...item,
        landed,
        aiScore: Math.round(rawScore * 10) / 10
      };
    })
    .sort((a, b) => b.aiScore - a.aiScore);

  renderChoices();
  populateProductSelect();
}

function renderChoices() {
  choicesGrid.innerHTML = rankedItems
    .map((item, idx) => {
      const isTop = idx === 0;
      return `
      <article class="choice-card ${isTop ? "top-pick" : ""}">
        <div>
          <div class="card-top">
            <span class="rank-tag">${isTop ? "#1 AI TOP CHOICE" : `#${idx + 1} VERIFIED`}</span>
            <span class="score-pill">${item.aiScore}% Match</span>
          </div>
          <h3 class="choice-title">${item.name}</h3>
          <p class="vendor-line">${item.vendor} • ${item.reviews} • ${item.deliveryDays}-day delivery</p>
        </div>

        <div class="price-box">
          <span class="landed-price">$${item.landed.toLocaleString()}</span>
          <span class="price-breakdown">Base $${item.basePrice} + $${item.shippingTax} ship/tax</span>
        </div>

        <div class="insights">
          <p class="pro">+ ${item.pro}</p>
          <p class="con">- ${item.con}</p>
        </div>

        <div class="card-actions">
          <button class="btn btn-primary" onclick="triggerEmailFlow('${item.id}', 'digest')">Email Digest</button>
          <button class="btn btn-secondary" onclick="triggerEmailFlow('${item.id}', 'alert')">Price Alert</button>
        </div>
      </article>
    `;
    })
    .join("");
}

function populateProductSelect() {
  selectedProductSelect.innerHTML = rankedItems
    .map((item) => `<option value="${item.id}">${item.name} ($${item.landed})</option>`)
    .join("");
}

function updateEmailDraft() {
  const selectedId = selectedProductSelect.value || rankedItems[0]?.id;
  const item = rankedItems.find((i) => i.id === selectedId) || rankedItems[0];
  if (!item) return;

  if (activeTab === "digest") {
    emailSubject.value = `AI Commercial Recommendation: ${item.name} (${item.aiScore}% Match)`;
    emailBody.value = `Hello,

Based on your sourcing criteria ("${intentInput.value}"), our AI engine evaluated 142 live web listings and ranked "${item.name}" #1 with a ${item.aiScore}% match score.

• Vendor: ${item.vendor}
• True Landed Cost: $${item.landed} (Base $${item.basePrice} + $${item.shippingTax} shipping/tax)
• Delivery Estimate: ${item.deliveryDays} business day(s)
• Key Advantage: ${item.pro}

Reply "APPROVE" to lock in this offer or view runner-up comparisons in your dashboard.

— CommerceScout Autonomous Agent`;
  } else if (activeTab === "vendor") {
    emailSubject.value = `RFQ & Volume Discount Inquiry: ${item.name}`;
    emailBody.value = `Dear ${item.vendor} Sales Team,

We are evaluating "${item.name}" (currently listed at $${item.basePrice}) for upcoming procurement.

Could you confirm:
1. Current stock availability for immediate ${item.deliveryDays}-day dispatch?
2. Best commercial/volume pricing and extended warranty options?

Best regards,
Autonomous Procurement Desk`;
  } else {
    const targetPrice = Math.round(item.landed * 0.92);
    emailSubject.value = `Price-Drop Watchdog Armed: ${item.name} (Target: $${targetPrice})`;
    emailBody.value = `Automated Alert Confirmation:

CommerceScout AI is now monitoring ${item.vendor} and 17 competing retailers every 15 minutes for "${item.name}".

• Current Landed Price: $${item.landed}
• Trigger Threshold: $${targetPrice} (8% drop)

You will receive an instant checkout link the moment any verified seller crosses your target threshold.`;
  }
}

window.triggerEmailFlow = function (itemId, tab) {
  activeTab = tab;
  document.querySelectorAll(".tab-btn").forEach((b) => {
    b.classList.toggle("active", b.dataset.tab === tab);
  });
  selectedProductSelect.value = itemId;
  updateEmailDraft();
  emailModal.classList.remove("hidden");
};

function renderAuditLogs() {
  auditLogList.innerHTML = auditLogs.map((entry) => `<li>${entry}</li>`).join("");
  logCountBadge.textContent = auditLogs.length;
}

function showToast(msg) {
  toast.textContent = msg;
  toast.classList.remove("hidden");
  setTimeout(() => toast.classList.add("hidden"), 3200);
}

// Event Listeners
Object.keys(weights).forEach((key) => {
  weights[key].addEventListener("input", () => {
    weightLabels[key].textContent = `${weights[key].value}%`;
    computeScores();
  });
});

document.querySelectorAll(".preset-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".preset-btn").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    activePreset = btn.dataset.preset;
    intentInput.value = CATALOGS[activePreset].intent;
    computeScores();
  });
});

scanBtn.addEventListener("click", () => {
  pipelineBox.classList.remove("hidden");
  const steps = [
    document.getElementById("step1"),
    document.getElementById("step2"),
    document.getElementById("step3")
  ];
  steps.forEach((s) => s.classList.remove("active"));

  steps[0].classList.add("active");
  progressBar.style.width = "33%";
  pipelineStatus.textContent = "Crawling merchant feeds, marketplaces, and shipping tables...";

  setTimeout(() => {
    steps[1].classList.add("active");
    progressBar.style.width = "68%";
    pipelineStatus.textContent = "Filtering out fake reviews, hidden fees, and out-of-stock SKUs...";
  }, 450);

  setTimeout(() => {
    steps[2].classList.add("active");
    progressBar.style.width = "100%";
    pipelineStatus.textContent = "Ranking complete. Optimal commercial choices updated below.";
    computeScores();
  }, 900);
});

openEmailHubBtn.addEventListener("click", () => {
  updateEmailDraft();
  emailModal.classList.remove("hidden");
});

closeEmailModalBtn.addEventListener("click", () => {
  emailModal.classList.add("hidden");
});

document.querySelectorAll(".tab-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab-btn").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    activeTab = btn.dataset.tab;
    updateEmailDraft();
  });
});

selectedProductSelect.addEventListener("change", updateEmailDraft);

sendEmailBtn.addEventListener("click", () => {
  const recipient = document.getElementById("recipientEmail").value || "customer@example.com";
  const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  auditLogs.unshift(`${now} — Sent [${activeTab.toUpperCase()}] to ${recipient}: "${emailSubject.value}"`);
  renderAuditLogs();
  emailModal.classList.add("hidden");
  showToast(`Automated email dispatched to ${recipient}`);
});

// Initialize
computeScores();
renderAuditLogs();