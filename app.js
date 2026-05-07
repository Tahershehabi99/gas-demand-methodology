// EU Gas Demand Methodology — interactive logic. Vanilla JS.
// Step flow:
//   1. Country dropdown
//   2. Historical | Current month
//   3. (if Historical) Before Eurostat | After Eurostat
//   4. Detail content rendered

(function () {
  const countrySelect = document.getElementById("country-select");
  const stepPeriod = document.getElementById("step-period");
  const stepSubstate = document.getElementById("step-substate");
  const stepSubstateIntro = document.getElementById("step-substate-intro");
  const stepDetail = document.getElementById("step-detail");
  const detailContent = document.getElementById("detail-content");
  const resetBtn = document.getElementById("reset-btn");
  const periodButtons = document.querySelectorAll(".period-btn[data-period]");
  const substateButtons = document.querySelectorAll(".period-btn[data-substate]");
  const lastUpdated = document.getElementById("last-updated");
  const introSection = document.getElementById("intro");

  // ─── Populate country dropdown ─────────────────────────────────────
  COUNTRY_ORDER.forEach(code => {
    const opt = document.createElement("option");
    opt.value = code;
    opt.textContent = COUNTRIES[code].name;
    countrySelect.appendChild(opt);
  });

  lastUpdated.textContent = new Date().toLocaleDateString("en-GB", {
    day: "numeric", month: "long", year: "numeric"
  });

  let selectedCountry = null;
  let selectedPeriod = null;

  // ─── Country selection ─────────────────────────────────────────────
  countrySelect.addEventListener("change", (e) => {
    selectedCountry = e.target.value;
    selectedPeriod = null;
    if (selectedCountry) {
      stepPeriod.classList.remove("hidden");
      stepSubstate.classList.add("hidden");
      stepDetail.classList.add("hidden");
      introSection.classList.add("hidden");
      stepPeriod.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      stepPeriod.classList.add("hidden");
      stepSubstate.classList.add("hidden");
      stepDetail.classList.add("hidden");
      introSection.classList.remove("hidden");
    }
  });

  // ─── Period selection (Historical | Current) ──────────────────────
  periodButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      selectedPeriod = btn.dataset.period;
      if (selectedPeriod === "current") {
        stepSubstate.classList.add("hidden");
        renderDetail(selectedCountry, "current", null);
        stepDetail.classList.remove("hidden");
        stepDetail.scrollIntoView({ behavior: "smooth", block: "start" });
      } else {
        // Historical: show step 3 (before/after Eurostat)
        renderSubstateIntro(selectedCountry);
        stepSubstate.classList.remove("hidden");
        stepDetail.classList.add("hidden");
        stepSubstate.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });

  // ─── Substate selection (before / after Eurostat) ──────────────────
  substateButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const substate = btn.dataset.substate;
      renderDetail(selectedCountry, "historical", substate);
      stepDetail.classList.remove("hidden");
      stepDetail.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  // ─── Reset ─────────────────────────────────────────────────────────
  resetBtn.addEventListener("click", () => {
    countrySelect.value = "";
    selectedCountry = null;
    selectedPeriod = null;
    stepPeriod.classList.add("hidden");
    stepSubstate.classList.add("hidden");
    stepDetail.classList.add("hidden");
    introSection.classList.remove("hidden");
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  // ─── Render functions ──────────────────────────────────────────────

  function renderSubstateIntro(code) {
    const c = COUNTRIES[code];
    const anchor = code === "UK" ? "DESNZ (UK government statistics)" : "Eurostat";
    stepSubstateIntro.innerHTML = `
      We use <strong>${anchor}</strong> as the official monthly Total for
      ${escape(c.name)}, but ${anchor} publishes about 2 months after each
      month ends. So for any given month there are two states: <em>before
      ${anchor} reports</em> (preliminary numbers) and <em>after ${anchor}
      reports</em> (final, confirmed numbers). The two states use slightly
      different methodologies — pick which one you want to see.
    `;
  }

  function renderDetail(code, period, substate) {
    const c = COUNTRIES[code];
    if (!c) {
      detailContent.innerHTML = "<p>Country not found.</p>";
      return;
    }

    if (period === "current") {
      detailContent.innerHTML = renderCurrent(c);
      return;
    }

    detailContent.innerHTML = renderHistorical(c, code, substate);
  }

  function renderHistorical(c, code, substate) {
    const data = c.historical[substate === "before" ? "before_eurostat" : "after_eurostat"];
    if (!data) return "<p>No methodology defined for this state.</p>";

    const tagLabel = substate === "before" ? "Before Eurostat reports (preliminary)" : "After Eurostat reports (final)";
    const tagClass = substate === "before" ? "before-tag" : "after-tag";

    const sectorBlock = (label, iconClass, sectorData) => {
      if (!sectorData) return "";
      return `
        <div class="sector-block">
          <h3><span class="sector-icon ${iconClass}"></span>${label}</h3>
          <div class="source-line">Source: <strong>${escape(sectorData.source)}</strong></div>
          <p class="method-text">${escape(sectorData.text)}</p>
        </div>`;
    };

    let kFactorHtml = "";
    if (substate === "after" && K_FACTORS[code] && c.historical.k_factor) {
      kFactorHtml = renderKFactorTable(code, c.historical.k_factor);
    }

    let exampleHtml = "";
    if (substate === "after" && c.historical.example) {
      exampleHtml = renderExample(c.historical.example);
    }

    const anchorName = code === "UK" ? "DESNZ" : "Eurostat";
    const subTagLabel = substate === "before"
      ? `Before ${anchorName} reports (preliminary)`
      : `After ${anchorName} reports (final)`;

    return `
      <div class="country-header">
        <h2>${escape(c.name)}</h2>
        <span class="country-tag">Historical</span>
        <span class="country-tag ${tagClass}">${escape(subTagLabel)}</span>
      </div>
      <p class="group-line">${escape(c.group)}</p>

      ${sectorBlock("Total gas demand", "total", data.total)}
      ${sectorBlock("Power (gas burned in power stations)", "power", data.power)}
      ${sectorBlock("Industry (factories, refineries, etc.)", "industry", data.industry)}
      ${sectorBlock("Homes & Businesses (residential + commercial)", "res_com", data.res_com)}
      ${sectorBlock("Other / Unaccounted", "ih", data.ih)}

      ${kFactorHtml}
      ${exampleHtml}
    `;
  }

  function renderKFactorTable(code, meta) {
    const rows = K_FACTORS[code] || [];
    if (!rows.length) return "";
    const tbody = rows.map(r => `
      <tr>
        <td>${r.year}</td>
        <td class="value">${r.k.toFixed(4)}</td>
        <td><span class="${r.type === "actual_annual" ? "actual" : "rolling"}">${r.type === "actual_annual" ? "Confirmed annual" : "Rolling estimate"}</span></td>
      </tr>
    `).join("");
    return `
      <div class="k-factor-box">
        <h3>${escape(meta.title)}</h3>
        <p class="method-text">${escape(meta.intro)}</p>
        <table class="k-factor-table">
          <thead><tr><th>Year</th><th style="text-align:right;">k factor</th><th>Type</th></tr></thead>
          <tbody>${tbody}</tbody>
        </table>
        <p style="font-size:0.85rem; color: var(--color-muted); margin-top:0.75rem;">
          ${escape(meta.note)}
        </p>
      </div>
    `;
  }

  function renderExample(ex) {
    const fmt = v => (v == null ? "—" : Number(v).toFixed(2) + " TWh");
    const rows = [];
    if (ex.power != null) rows.push(["Power", ex.power, "power"]);
    if (ex.industry != null) rows.push(["Industry", ex.industry, "industry"]);
    if (ex.res_com != null) rows.push(["Homes & Businesses", ex.res_com, "res_com"]);
    if (ex.ih != null && Math.abs(ex.ih) > 0.001) rows.push(["Other / Unaccounted", ex.ih, "ih"]);

    return `
      <div class="example-box">
        <h3>Example: ${escape(ex.month)}</h3>
        <p style="font-size: 0.9rem; color: var(--color-muted);">
          Real numbers from a fully-confirmed historical month (in TWh of gas):
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
    const paragraphs = CURRENT_MONTH_PLACEHOLDER_TEXT
      .split(/\n\s*\n/).map(p => p.trim()).filter(p => p.length);

    const html = paragraphs.map(p => {
      const lines = p.split(/\n/).map(l => l.trim()).filter(l => l.length);
      const isBulletList = lines.every(line => line.startsWith("•") || lines.indexOf(line) === 0);
      const hasBullets = lines.some(line => line.startsWith("•"));

      if (hasBullets) {
        const intro = lines[0].startsWith("•") ? "" : `<p>${escape(lines[0])}</p>`;
        const items = lines.filter(l => l.startsWith("•"))
          .map(l => `<li>${escape(l.slice(1).trim())}</li>`).join("");
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
