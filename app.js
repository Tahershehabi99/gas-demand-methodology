// EU Gas Demand Methodology — interactive logic.
// Vanilla JS, no frameworks. Reads from data.js (COUNTRIES + COUNTRY_ORDER).

(function () {
  const countrySelect = document.getElementById("country-select");
  const stepPeriod = document.getElementById("step-period");
  const stepDetail = document.getElementById("step-detail");
  const detailContent = document.getElementById("detail-content");
  const resetBtn = document.getElementById("reset-btn");
  const periodButtons = document.querySelectorAll(".period-btn");
  const lastUpdated = document.getElementById("last-updated");
  const introSection = document.getElementById("intro");

  // Populate country dropdown
  COUNTRY_ORDER.forEach(code => {
    const opt = document.createElement("option");
    opt.value = code;
    opt.textContent = COUNTRIES[code].name;
    countrySelect.appendChild(opt);
  });

  // Last-updated date — today
  lastUpdated.textContent = new Date().toLocaleDateString("en-GB", {
    day: "numeric", month: "long", year: "numeric"
  });

  let selectedCountry = null;

  countrySelect.addEventListener("change", (e) => {
    selectedCountry = e.target.value;
    if (selectedCountry) {
      stepPeriod.classList.remove("hidden");
      stepDetail.classList.add("hidden");
      introSection.classList.add("hidden");
      stepPeriod.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      stepPeriod.classList.add("hidden");
      stepDetail.classList.add("hidden");
      introSection.classList.remove("hidden");
    }
  });

  periodButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const period = btn.dataset.period;
      renderDetail(selectedCountry, period);
      stepDetail.classList.remove("hidden");
      stepDetail.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  resetBtn.addEventListener("click", () => {
    countrySelect.value = "";
    selectedCountry = null;
    stepPeriod.classList.add("hidden");
    stepDetail.classList.add("hidden");
    introSection.classList.remove("hidden");
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  function renderDetail(code, period) {
    const c = COUNTRIES[code];
    if (!c) {
      detailContent.innerHTML = "<p>Country not found.</p>";
      return;
    }

    if (period === "current") {
      detailContent.innerHTML = renderCurrent(c);
      return;
    }

    detailContent.innerHTML = renderHistorical(c);
  }

  function renderHistorical(c) {
    const h = c.historical;
    if (!h) return "<p>No historical methodology defined for this country.</p>";

    const sectorBlock = (key, label, iconClass, data) => {
      if (!data) return "";
      return `
        <div class="sector-block">
          <h3><span class="sector-icon ${iconClass}"></span>${label}</h3>
          <div class="source-line">Source: <strong>${escape(data.source)}</strong></div>
          <p class="method-text">${escape(data.text)}</p>
        </div>`;
    };

    const example = h.example ? renderExample(h.example) : "";

    return `
      <div class="country-header">
        <h2>${escape(c.name)}</h2>
        <span class="country-tag">Historical (confirmed) months</span>
      </div>
      <p class="method-text" style="margin-bottom: 1.5rem;">
        <strong>${escape(c.group)}</strong>
      </p>

      ${sectorBlock("total", "Total gas demand", "total", h.total)}
      ${sectorBlock("power", "Power (gas burned in power stations)", "power", h.power)}
      ${sectorBlock("industry", "Industry (factories, refineries, etc.)", "industry", h.industry)}
      ${sectorBlock("res_com", "Homes & Businesses (residential + commercial)", "res_com", h.res_com)}
      ${sectorBlock("ih", "Other / Unaccounted", "ih", h.ih)}

      ${example}
    `;
  }

  function renderExample(ex) {
    const fmt = v => (v == null ? "—" : Number(v).toFixed(2) + " TWh");
    const rows = [];
    if (ex.power != null) rows.push(["Power", ex.power, "power"]);
    if (ex.industry != null) rows.push(["Industry", ex.industry, "industry"]);
    if (ex.res_com != null) rows.push(["Homes & Businesses", ex.res_com, "res_com"]);
    if (ex.ih != null && ex.ih > 0.001) rows.push(["Other / Unaccounted", ex.ih, "ih"]);

    const sum = rows.reduce((a, [, v]) => a + (v || 0), 0);

    return `
      <div class="example-box">
        <h3>Example: ${escape(ex.month)}</h3>
        <p style="font-size: 0.9rem; color: var(--color-muted);">
          Real numbers from the most recent fully-confirmed month, in TWh
          (terawatt-hours of gas energy):
        </p>
        <table class="example-table">
          <thead>
            <tr><th>Sector</th><th style="text-align:right;">Value</th></tr>
          </thead>
          <tbody>
            ${rows.map(([label, v, cls]) => `
              <tr>
                <td><span class="sector-icon ${cls}" style="margin-right:0.5rem;"></span>${escape(label)}</td>
                <td class="value">${fmt(v)}</td>
              </tr>
            `).join("")}
            <tr class="total-row">
              <td><span class="sector-icon total" style="margin-right:0.5rem;"></span>Total</td>
              <td class="value">${fmt(ex.total)}</td>
            </tr>
          </tbody>
        </table>
        <p style="font-size: 0.85rem; color: var(--color-muted); margin-top: 0.75rem;">
          (The sum of the sector lines equals the Total figure, by construction.)
        </p>
      </div>
    `;
  }

  function renderCurrent(c) {
    // Convert the multi-paragraph placeholder text into HTML paragraphs.
    const paragraphs = CURRENT_MONTH_PLACEHOLDER_TEXT
      .split(/\n\s*\n/)
      .map(p => p.trim())
      .filter(p => p.length);
    const html = paragraphs.map(p => {
      if (/^\s*•/.test(p) || /\n\s*•/.test(p)) {
        // bullet list
        const items = p.split(/\n/).map(line => line.trim())
          .filter(line => line.startsWith("•"))
          .map(line => `<li>${escape(line.slice(1).trim())}</li>`).join("");
        const intro = p.split(/\n/)[0].startsWith("•") ? "" : `<p>${escape(p.split(/\n/)[0])}</p>`;
        return intro + `<ul style="margin-left:1.25rem; margin-top:0.5rem;">${items}</ul>`;
      }
      return `<p style="margin-top:0.5rem;">${escape(p)}</p>`;
    }).join("");

    return `
      <div class="country-header">
        <h2>${escape(c.name)}</h2>
        <span class="country-tag">Current month (estimated)</span>
      </div>
      <div class="note">
        <strong>Methodology under development.</strong>
        ${html}
      </div>
    `;
  }

  function escape(s) {
    if (s == null) return "";
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }
})();
