// Methodology data — terms, country methodologies, k_factor tables, examples.
// Example values are from February 2024 (a fully-confirmed historical month).

// ─── Glossary ────────────────────────────────────────────────────────────

const GLOSSARY = [
  {
    term: "Eurostat",
    definition: "The official statistical agency of the European Union. Eurostat publishes a monthly gas balance for each EU country about 2 months after the month ends. This is the primary 'final' figure we anchor to."
  },
  {
    term: "DESNZ",
    definition: "The UK's Department for Energy Security and Net Zero. DESNZ publishes the UK's monthly gas balance (Energy Trends Table 4.2) about 2 months after the month ends — same role as Eurostat plays for EU countries."
  },
  {
    term: "ENTSO-E",
    definition: "The European electricity network organisation. Publishes daily electricity generation per country, broken down by fuel type — including how much electricity was made from gas."
  },
  {
    term: "ENTSOG balance method (sometimes called M1)",
    definition: "A way of calculating a country's daily gas demand from gas-network flow data: add up daily gas inputs (imports + production + storage withdrawals) and subtract outputs (exports + storage injections). The result is gas consumed inside the country that day. Published by ENTSOG (the European gas network operators) for most EU countries."
  },
  {
    term: "Power station efficiency",
    definition: "How much electricity a gas-fired power station produces per unit of gas burned. Typically 30–45%. We calculate one efficiency per country per year, calibrated against Eurostat's annual figure for total gas-to-electricity (which includes industrial CHP plants and small power plants that don't show up in ENTSO-E's data). This lets us convert ENTSO-E's daily electricity output back into the gas that was consumed to make it."
  },
  {
    term: "Annual k factor (Industry)",
    definition: "A scaling factor applied to daily Industry data (currently France GRTGaz and Germany THE-RLM) so that the annual sum of monthly Industry values matches Eurostat's official annual industrial gas figure exactly. We compute one k per country per year. For years where Eurostat's annual figure isn't published yet, we use the average of the latest two confirmed years."
  },
  {
    term: "Anchored / anchoring",
    definition: "When Eurostat publishes a monthly figure, we 'anchor' our daily values to it: scale every daily number up or down so the monthly sum exactly matches the official Eurostat figure. The day-to-day shape is preserved; only the absolute level is corrected."
  },
  {
    term: "Computed leftover (residual)",
    definition: "When we know the Total, the Power, and the Industry figures, the 'Homes & Businesses' sector can be calculated as: Total − Power − Industry. This is the residual or leftover method."
  },
  {
    term: "Other / Unaccounted",
    definition: "A small balancing line that captures gas consumption that doesn't fit cleanly into Power, Industry, or Homes & Businesses. Typical contents: refineries, transport, gas used as feedstock to make chemicals or fertilisers, network own-use, statistical residuals."
  },
  {
    term: "Trading Hub Europe (THE)",
    definition: "Germany's gas market operator. Publishes daily total gas consumption plus a breakdown into 'large customers' (RLM — Registered Load Metering, includes industry + power + large commercial) and 'small customers' (SLP — Synthetic Load Profile, mostly households + small commerce)."
  },
  {
    term: "GRTGaz",
    definition: "France's main gas transmission network operator. Publishes daily breakdowns of gas consumption by industrial customers and homes & businesses, covering both NaTran and Terega networks (full France)."
  },
  {
    term: "ENTSOG point classifier",
    definition: "A classification (originally developed by Bruegel) that tags each ENTSOG flow point by what type of customer it serves — industrial, household, power station, etc. By summing the points tagged 'industrial' or 'household', we get a daily breakdown for countries that have one. Available from November 2019 onwards for Belgium, Hungary, Italy, Luxembourg, Netherlands, Portugal, Romania."
  },
  {
    term: "Enagás",
    definition: "Spain's gas system operator. Publishes a monthly statistical bulletin (Boletín Estadístico) with detailed gas demand figures, typically about 6 weeks after each month ends."
  },
  {
    term: "National Gas (UK)",
    definition: "The UK gas transmission system operator. Publishes daily flow data for the National Transmission System (NTS), including gas to large power stations. About 12% of UK gas bypasses the NTS (off-network gas), which is why we anchor monthly to DESNZ rather than rely on National Gas alone."
  },
  {
    term: "TWh (terawatt-hour)",
    definition: "The unit we use for gas energy throughout: 1 TWh = 1 billion kilowatt-hours. For context, 1 TWh ≈ 90 million cubic metres of natural gas, or enough to heat about 60,000 UK homes for a year."
  }
];

// ─── Country methodology ─────────────────────────────────────────────────
//
// For each country, the historical methodology is split into two states:
//   before_eurostat: Eurostat has not yet published the monthly Total
//   after_eurostat:  Eurostat has published the monthly Total
//
// Most countries use Eurostat as the official monthly Total. The exception
// is the UK, where DESNZ plays the same role.

const COUNTRIES = {

  // ─── GROUP 1: Italy & Netherlands ─────────────────────────────────────
  // Eurostat publishes monthly Industry + Other-Sectors for these two.
  // ENTSOG point-classifier fills before Eurostat publishes.

  "IT": {
    name: "Italy",
    group: "Italy and the Netherlands are the only EU countries where Eurostat publishes monthly Industry and Homes & Businesses data directly.",
    historical: {
      before_eurostat: {
        total: { source: "ENTSOG (European gas network operators) — balance method", text: "ENTSOG publishes daily gas-network flow data for Italy. We calculate Italy's daily gas consumption by adding up everything flowing IN (imports across borders + domestic production + gas withdrawn from storage) and subtracting everything flowing OUT (exports + gas injected into storage). What's left is the gas consumed inside the country that day." },
        power: { source: "ENTSO-E (European electricity network) — daily generation ÷ annual efficiency", text: "Daily electricity generated from gas-fired power stations (from ENTSO-E), divided by Italy's annual power-station efficiency to convert it back into gas burned." },
        industry: { source: "ENTSOG point classifier", text: "We sum the daily flows at all ENTSOG network points tagged as 'industrial' for Italy. Available from November 2019 onwards." },
        res_com: { source: "ENTSOG point classifier", text: "We sum the daily flows at all ENTSOG points tagged as 'household' for Italy." },
        ih: { source: "Computed leftover", text: "Total − Power − Industry − Homes & Businesses. Captures refineries, transport, non-energy use, and statistical residuals." }
      },
      after_eurostat: {
        total: { source: "Eurostat (the EU statistical agency) — anchored", text: "Eurostat publishes Italy's official monthly gas consumption. We use this figure directly and scale our daily ENTSOG totals so they sum to exactly this number." },
        power: { source: "ENTSO-E (European electricity network) — daily generation ÷ annual efficiency", text: "Daily electricity generated from gas-fired power stations (from ENTSO-E), divided by Italy's annual power-station efficiency to convert it back into gas burned." },
        industry: { source: "Eurostat monthly Industry", text: "Eurostat publishes Italy's monthly industrial gas consumption directly." },
        res_com: { source: "Eurostat monthly Other-Sectors", text: "Eurostat publishes Italy's monthly gas consumption for households + commercial services + agriculture directly." },
        ih: { source: "Computed leftover", text: "Whatever remains of the Eurostat total after subtracting Power + Industry + Homes & Businesses. For Italy this captures refineries, transport, and non-energy gas use." }
      },
      example: { month: "February 2024", state: "after_eurostat", total: 67.44, power: 19.95, industry: 10.31, res_com: 37.18 }
    }
  },

  "NL": {
    name: "Netherlands",
    group: "Italy and the Netherlands are the only EU countries where Eurostat publishes monthly Industry and Homes & Businesses data directly.",
    historical: {
      before_eurostat: {
        total: { source: "ENTSOG direct-consumer flows (daily)", text: "We sum daily flows at ENTSOG points classified as direct industrial consumers, industrial-power consumers, and local distribution companies (LDCs). This gives a near-real-time daily total for the Netherlands." },
        power: { source: "ENTSO-E (European electricity network) — daily generation ÷ annual efficiency", text: "Daily electricity from gas-fired power stations, divided by Netherlands' annual power-station efficiency." },
        industry: { source: "ENTSOG point classifier", text: "We sum daily flows at ENTSOG points tagged as 'industrial' for the Netherlands. Available from November 2019 onwards." },
        res_com: { source: "ENTSOG point classifier", text: "We sum daily flows at ENTSOG points tagged as 'household' for the Netherlands." },
        ih: { source: "Computed leftover", text: "Total − Power − Industry − Homes & Businesses. For the Netherlands this is typically a few percent — non-energy gas use plus statistical residual." }
      },
      after_eurostat: {
        total: { source: "Eurostat (the EU statistical agency) — anchored", text: "Eurostat publishes the Netherlands' official monthly gas consumption. We use this and scale the daily values to match." },
        power: { source: "ENTSO-E (European electricity network) — daily generation ÷ annual efficiency", text: "Daily electricity from gas-fired power stations, divided by Netherlands' annual power-station efficiency." },
        industry: { source: "Eurostat monthly Industry", text: "Eurostat publishes the Netherlands' monthly industrial gas consumption directly." },
        res_com: { source: "Eurostat monthly Other-Sectors", text: "Eurostat publishes the Netherlands' monthly gas consumption for households + commercial services + agriculture directly." },
        ih: { source: "Computed leftover", text: "Whatever remains after subtracting the three sectors from the Eurostat total." }
      },
      example: { month: "February 2024", state: "after_eurostat", total: 29.28, power: 6.59, industry: 7.21, res_com: 11.49, ih: 3.99 }
    }
  },

  // ─── GROUP 2: Germany ─────────────────────────────────────────────────

  "DE": {
    name: "Germany",
    group: "Germany has its own data ecosystem via Trading Hub Europe (THE), the German gas operator.",
    historical: {
      before_eurostat: {
        total: { source: "Trading Hub Europe (daily)", text: "THE publishes Germany's daily total gas consumption directly." },
        power: { source: "ENTSO-E (European electricity network) — daily generation ÷ annual efficiency", text: "Daily electricity from gas-fired power stations, divided by Germany's annual power-station efficiency. The efficiency is calibrated against Eurostat's annual figure for total gas-to-electricity, which includes industrial CHP plants that ENTSO-E doesn't directly capture." },
        industry: { source: "THE large-customer data − Power, scaled by rolling k", text: "THE publishes daily 'large customer' gas (called RLM — registered load metering). This includes industry + gas-fired power + large commercial all together. We subtract the gas-for-power figure (from ENTSO-E) to remove the power slice. Then we multiply by a rolling k factor (the average of the last 2 confirmed years) to align with Eurostat's industrial scope." },
        res_com: { source: "THE small-customer data (SLP, raw)", text: "THE publishes daily 'small customer' gas (called SLP — synthetic load profile). This is essentially households + small commercial, a clean proxy for our Homes & Businesses category." },
        ih: { source: "Computed leftover", text: "THE total − Power − Industry − Homes & Businesses. Captures off-network gas, refineries, transport, and statistical residuals." }
      },
      after_eurostat: {
        total: { source: "Trading Hub Europe (anchored to Eurostat)", text: "Once Eurostat publishes Germany's official monthly gas consumption, we scale the daily THE values so the monthly sum matches the Eurostat figure exactly." },
        power: { source: "ENTSO-E (European electricity network) — daily generation ÷ annual efficiency", text: "Daily electricity from gas-fired power stations, divided by Germany's annual power-station efficiency. The efficiency is calibrated against Eurostat's annual figure for total gas-to-electricity, which includes industrial CHP plants that ENTSO-E doesn't directly capture." },
        industry: { source: "THE large-customer − Power, scaled by k", text: "Same calculation as before-Eurostat: THE-RLM minus ENTSO-E gas-for-power, then multiplied by an annual k factor. For years where Eurostat has published the annual industrial figure, we use the exact k for that year so the annual sum ties to Eurostat exactly." },
        res_com: { source: "Computed leftover", text: "Once Eurostat publishes the monthly Total, we calculate Homes & Businesses as: Total − Power − Industry. This automatically captures whatever isn't in Power or Industry, including statistical residuals. (We discard the daily SLP measurement in favour of this leftover, on the user's instruction.)" },
        ih: { source: "Not emitted (zero)", text: "Always zero in confirmed months — Homes & Businesses absorbs all the leftover." }
      },
      k_factor: {
        title: "Germany Industry annual k factors",
        intro: "Each year's k = (Eurostat annual industrial figure) ÷ (sum of THE-RLM minus ENTSO-E gas for that year). Years before 2022 use the rolling average because THE data only starts in October 2021.",
        note: "Note: 2017–2020 use the rolling factor because Trading Hub Europe daily data only starts October 2021. 2021 is also rolling because only Q4 of THE data is available — too partial to compute a reliable annual k."
      },
      example: { month: "February 2024", state: "after_eurostat", total: 87.17, power: 20.89, industry: 21.13, res_com: 45.15 }
    }
  },

  // ─── GROUP 3: France ──────────────────────────────────────────────────

  "FR": {
    name: "France",
    group: "France has daily Industry and Homes & Businesses data from GRTGaz, the French gas network operator (covers both NaTran and Terega = full France).",
    historical: {
      before_eurostat: {
        total: { source: "ENTSOG (European gas network operators) — balance method", text: "ENTSOG publishes daily gas-network flow data for France. We calculate France's daily gas consumption by adding up everything flowing IN (imports across borders + domestic production + gas withdrawn from storage) and subtracting everything flowing OUT (exports + gas injected into storage). What's left is the gas consumed inside France that day." },
        power: { source: "ENTSO-E (European electricity network) — daily generation ÷ annual efficiency", text: "Daily electricity from gas-fired power stations, divided by France's annual power-station efficiency. Calibrated against Eurostat's annual gas-to-electricity figure (which includes autoproducer plants — large in France)." },
        industry: { source: "GRTGaz daily × rolling k", text: "GRTGaz publishes France's daily industrial gas consumption directly. We multiply by a rolling k factor (average of the last 2 confirmed years) to align the annual scope with Eurostat." },
        res_com: { source: "GRTGaz daily (raw)", text: "GRTGaz publishes France's daily homes & businesses gas consumption directly. Used as-is in this state." },
        ih: { source: "Computed leftover", text: "Whatever remains after subtracting Power + Industry × rolling k + GRTGaz Homes & Businesses from the daily ENTSOG total. Captures non-energy gas use and statistical noise from the rolling-k approximation." }
      },
      after_eurostat: {
        total: { source: "ENTSOG (balance method) — anchored to Eurostat", text: "Once Eurostat publishes France's monthly figure, we scale the daily ENTSOG values so the monthly sum matches Eurostat exactly." },
        power: { source: "ENTSO-E (European electricity network) — daily generation ÷ annual efficiency", text: "Daily electricity from gas-fired power stations, divided by France's annual power-station efficiency. Calibrated against Eurostat's annual gas-to-electricity figure (which includes autoproducer plants — large in France)." },
        industry: { source: "GRTGaz daily × k (actual or rolling)", text: "GRTGaz daily multiplied by a k factor. For years where Eurostat has published the annual industrial figure, we use the exact k so the annual sum ties exactly. For years before that (typically the most recent year), we use the rolling 2-year average." },
        res_com: { source: "Depends on whether annual Industry is confirmed", text: "If Eurostat has published the annual Industry figure for that year (i.e. k is 'actual_annual'), we compute Homes & Businesses as Total − Power − Industry (computed leftover). If Eurostat hasn't published the annual yet (k is 'rolling'), we keep using GRTGaz daily directly because the rolling Industry estimate isn't precise enough to trust the residual." },
        ih: { source: "Zero or balance — depends on annual Industry status", text: "Zero for years where annual Industry is confirmed (residual fully accounts for the leftover). Otherwise a small balance line absorbs the rolling-k approximation error." }
      },
      k_factor: {
        title: "France Industry annual k factors",
        intro: "Each year's k = (Eurostat annual industrial figure) ÷ (sum of GRTGaz industrial for that year). Smaller k means GRTGaz reports more 'industrial' than Eurostat's pure-industry definition.",
        note: "2017 has no GRTGaz data (the public dataset starts January 2018), so it uses the rolling factor. 2025–2026 are rolling because Eurostat hasn't published their annual industrial figures yet."
      },
      example: { month: "February 2024", state: "after_eurostat", total: 41.14, power: 5.68, industry: 11.58, res_com: 23.89 }
    }
  },

  // ─── GROUP 4: Spain ───────────────────────────────────────────────────

  "ES": {
    name: "Spain",
    group: "Spain uses Enagás's monthly statistical bulletin (Boletín Estadístico) as its primary monthly source.",
    historical: {
      before_eurostat: {
        total: { source: "Enagás monthly bulletin (when published)", text: "Enagás (the Spanish gas system operator) publishes a monthly statistical bulletin about 6 weeks after each month ends. Until that publication, we have no preliminary monthly total for Spain — Spain doesn't have a daily total source like ENTSOG-balance countries do." },
        power: { source: "ENTSO-E (European electricity network) — daily generation ÷ annual efficiency", text: "Daily electricity from gas-fired power stations, divided by Spain's annual power-station efficiency. The efficiency is calibrated against Eurostat's annual figure (which includes autoproducers and CHP that Enagás's own 'Sector Eléctrico' line misses)." },
        industry: { source: "Eurostat annual Industry, distributed monthly", text: "We take Eurostat's last published annual industrial figure for Spain and distribute it across the 12 months using the typical European industrial seasonal pattern (more in winter, less in summer). For the current year — where Eurostat hasn't published yet — we carry forward the most recent confirmed annual figure." },
        res_com: { source: "Not available until total is known", text: "Without a monthly Total figure, we can't compute the leftover for Homes & Businesses." },
        ih: { source: "Not available", text: "Same — no Total means no leftover." }
      },
      after_eurostat: {
        total: { source: "Eurostat (anchored, replaces Enagás)", text: "Once Eurostat publishes Spain's official monthly figure, we use that as the final Total." },
        power: { source: "ENTSO-E (European electricity network) — daily generation ÷ annual efficiency", text: "Daily electricity from gas-fired power stations, divided by Spain's annual power-station efficiency. The efficiency is calibrated against Eurostat's annual figure (which includes autoproducers and CHP that Enagás's own 'Sector Eléctrico' line misses)." },
        industry: { source: "Eurostat annual Industry, distributed monthly", text: "We take Eurostat's last published annual industrial figure for Spain and distribute it across the 12 months using the typical European industrial seasonal pattern (more in winter, less in summer). For the current year — where Eurostat hasn't published yet — we carry forward the most recent confirmed annual figure." },
        res_com: { source: "Computed leftover", text: "Homes & Businesses = Total − Power − Industry." },
        ih: { source: "Not emitted", text: "Always zero — Homes & Businesses absorbs all leftover." }
      },
      example: { month: "February 2024", state: "after_eurostat", total: 27.83, power: 6.92, industry: 9.91, res_com: 11.00 }
    }
  },

  // ─── GROUP 5: Belgium / Hungary / Luxembourg / Portugal / Romania ─────

  "BE": {
    name: "Belgium",
    group: "Belgium has daily total via the ENTSOG balance method, plus Bruegel-style point classification for Industry and Homes & Businesses.",
    historical: {
      before_eurostat: {
        total: { source: "ENTSOG (European gas network operators) — balance method", text: "ENTSOG publishes daily gas-network flow data for Belgium. We calculate Belgium's daily gas consumption by adding up everything flowing IN (imports + domestic production + storage withdrawals) and subtracting everything flowing OUT (exports + storage injections). The result is the gas consumed inside Belgium that day." },
        power: { source: "ENTSO-E (European electricity network) — daily generation ÷ annual efficiency", text: "Daily electricity from gas-fired power stations divided by Belgium's annual power-station efficiency." },
        industry: { source: "ENTSOG point classifier (from Nov 2019)", text: "Sum of daily flows at ENTSOG points tagged as 'industrial' for Belgium. For months before November 2019, we use Eurostat's annual industrial figure spread across months." },
        res_com: { source: "ENTSOG point classifier (from Nov 2019)", text: "Sum of daily flows at ENTSOG points tagged as 'household' for Belgium." },
        ih: { source: "Computed leftover", text: "ENTSOG total − Power − Industry − Homes & Businesses. Absorbs any classification gaps." }
      },
      after_eurostat: {
        total: { source: "ENTSOG balance, anchored to Eurostat", text: "We scale daily ENTSOG values so the monthly sum matches Eurostat's official figure." },
        power: { source: "ENTSO-E (European electricity network) — daily generation ÷ annual efficiency", text: "Daily electricity from gas-fired power stations divided by Belgium's annual power-station efficiency." },
        industry: { source: "ENTSOG point classifier (from Nov 2019), or Eurostat annual distributed", text: "Same source as before-Eurostat — the classifier doesn't change once Eurostat anchors the total." },
        res_com: { source: "Computed leftover", text: "Once Eurostat anchors the Total, we compute Homes & Businesses as Total − Power − Industry. This replaces the ENTSOG point classifier for Homes & Businesses (we keep the classifier for Industry only)." },
        ih: { source: "Not emitted (zero)", text: "Always zero in confirmed months — leftover absorbs everything not in Power and Industry." }
      },
      example: { month: "February 2024", state: "after_eurostat", total: 15.25, power: 1.91, industry: 3.64, res_com: 9.70 }
    }
  },

  "HU": {
    name: "Hungary",
    group: "Hungary has daily Industry and Homes & Businesses data via the Bruegel-style ENTSOG point classifier, but no daily total source.",
    historical: {
      before_eurostat: {
        total: { source: "Not available", text: "Hungary has no near-real-time daily total source — we depend entirely on Eurostat's monthly publication. The ENTSOG balance method for Hungary is unreliable due to large transit flows that distort the calculation." },
        power: { source: "ENTSO-E (European electricity network) — daily generation ÷ annual efficiency", text: "Daily electricity from gas-fired power stations divided by Hungary's annual power-station efficiency." },
        industry: { source: "ENTSOG point classifier (from Nov 2019)", text: "Sum of daily flows at points tagged as 'industrial' for Hungary." },
        res_com: { source: "ENTSOG point classifier (from Nov 2019)", text: "Sum of daily flows at points tagged as 'household' for Hungary." },
        ih: { source: "Not available", text: "Without a Total, no leftover can be computed." }
      },
      after_eurostat: {
        total: { source: "Eurostat (the EU statistical agency) — monthly figure", text: "Hungary's official monthly gas consumption from Eurostat." },
        power: { source: "ENTSO-E (European electricity network) — daily generation ÷ annual efficiency", text: "Daily electricity from gas-fired power stations divided by Hungary's annual power-station efficiency." },
        industry: { source: "ENTSOG point classifier", text: "Sum of points tagged 'industrial'. For pre-November 2019, we use Eurostat's annual industrial figure spread across months." },
        res_com: { source: "Computed leftover", text: "Homes & Businesses = Total − Power − Industry." },
        ih: { source: "Not emitted (zero)", text: "Always zero." }
      },
      example: { month: "February 2024", state: "after_eurostat", total: 9.46, power: 1.51, industry: 1.90, res_com: 6.05 }
    }
  },

  "LU": {
    name: "Luxembourg",
    group: "Luxembourg has Bruegel-style ENTSOG point classifier data for Industry and Homes & Businesses, but no daily total source.",
    historical: {
      before_eurostat: {
        total: { source: "Not available", text: "Luxembourg has no near-real-time daily total source — we depend on Eurostat. The ENTSOG balance for Luxembourg is unreliable due to transit flows." },
        power: { source: "ENTSO-E (European electricity network) — daily generation ÷ annual efficiency", text: "Daily electricity divided by Luxembourg's annual power-station efficiency." },
        industry: { source: "ENTSOG point classifier", text: "Sum of points tagged 'industrial' for Luxembourg." },
        res_com: { source: "ENTSOG point classifier", text: "Sum of points tagged 'household' for Luxembourg." },
        ih: { source: "Not available", text: "Without a Total, no leftover." }
      },
      after_eurostat: {
        total: { source: "Eurostat (the EU statistical agency) — monthly figure", text: "Luxembourg's official monthly gas consumption from Eurostat." },
        power: { source: "ENTSO-E (European electricity network) — daily generation ÷ annual efficiency", text: "Daily electricity divided by Luxembourg's annual power-station efficiency." },
        industry: { source: "ENTSOG point classifier (or Eurostat annual distributed for pre-2019)", text: "Sum of points tagged 'industrial'." },
        res_com: { source: "Computed leftover", text: "Homes & Businesses = Total − Power − Industry." },
        ih: { source: "Not emitted (zero)", text: "Always zero." }
      },
      example: { month: "February 2024", state: "after_eurostat", total: 0.72, power: 0.04, industry: 0.23, res_com: 0.46 }
    }
  },

  "PT": {
    name: "Portugal",
    group: "Portugal has daily total via ENTSOG balance method, plus point classifier for sectors.",
    historical: {
      before_eurostat: {
        total: { source: "ENTSOG (European gas network operators) — balance method", text: "ENTSOG publishes daily gas-network flow data for Portugal. We calculate Portugal's daily gas consumption by adding up everything flowing IN (imports + storage withdrawals) and subtracting everything flowing OUT (exports + storage injections). The result is the gas consumed inside Portugal that day." },
        power: { source: "ENTSO-E (European electricity network) — daily generation ÷ annual efficiency", text: "Daily electricity ÷ annual power-station efficiency." },
        industry: { source: "ENTSOG point classifier (from Nov 2019)", text: "Sum of points tagged 'industrial' for Portugal." },
        res_com: { source: "ENTSOG point classifier (from Nov 2019)", text: "Sum of points tagged 'household' for Portugal." },
        ih: { source: "Computed leftover", text: "Total − Power − Industry − Homes & Businesses." }
      },
      after_eurostat: {
        total: { source: "ENTSOG balance, anchored to Eurostat", text: "Daily ENTSOG values scaled so monthly sum matches Eurostat." },
        power: { source: "ENTSO-E (European electricity network) — daily generation ÷ annual efficiency", text: "Daily electricity ÷ annual power-station efficiency." },
        industry: { source: "ENTSOG point classifier (or Eurostat annual distributed for pre-2019)", text: "Sum of points tagged 'industrial'." },
        res_com: { source: "Computed leftover", text: "Total − Power − Industry." },
        ih: { source: "Not emitted (zero)", text: "Always zero." }
      },
      example: { month: "February 2024", state: "after_eurostat", total: 3.84, power: 1.20, industry: 1.46, res_com: 1.18 }
    }
  },

  "RO": {
    name: "Romania",
    group: "Romania has daily total via ENTSOG balance method, plus point classifier for sectors.",
    historical: {
      before_eurostat: {
        total: { source: "ENTSOG (European gas network operators) — balance method", text: "ENTSOG publishes daily gas-network flow data for Romania. We calculate Romania's daily gas consumption by adding up everything flowing IN (imports + domestic production + storage withdrawals) and subtracting everything flowing OUT (exports + storage injections). The result is the gas consumed inside Romania that day." },
        power: { source: "ENTSO-E (European electricity network) — daily generation ÷ annual efficiency", text: "Daily electricity ÷ annual power-station efficiency." },
        industry: { source: "ENTSOG point classifier (from Nov 2019)", text: "Sum of points tagged 'industrial' for Romania." },
        res_com: { source: "ENTSOG point classifier (from Nov 2019)", text: "Sum of points tagged 'household' for Romania." },
        ih: { source: "Computed leftover", text: "Total − Power − Industry − Homes & Businesses." }
      },
      after_eurostat: {
        total: { source: "ENTSOG balance, anchored to Eurostat", text: "Daily ENTSOG values scaled so monthly sum matches Eurostat." },
        power: { source: "ENTSO-E (European electricity network) — daily generation ÷ annual efficiency", text: "Daily electricity ÷ annual power-station efficiency." },
        industry: { source: "ENTSOG point classifier (or Eurostat annual distributed for pre-2019)", text: "Sum of points tagged 'industrial'." },
        res_com: { source: "Computed leftover", text: "Total − Power − Industry." },
        ih: { source: "Not emitted (zero)", text: "Always zero." }
      },
      example: { month: "February 2024", state: "after_eurostat", total: 12.18, power: 2.83, industry: 1.87, res_com: 7.48 }
    }
  },

  // ─── GROUP 6: Tier 2 ENTSOG balance — BG / GR / LT / SI ───────────────

  "BG": {
    name: "Bulgaria",
    group: "Bulgaria has daily total via the ENTSOG balance method but no monthly sector breakdown — Industry comes from Eurostat's annual figure.",
    historical: {
      before_eurostat: {
        total: { source: "ENTSOG (European gas network operators) — balance method", text: "ENTSOG publishes daily gas-network flow data for Bulgaria. We calculate Bulgaria's daily gas consumption by adding up everything flowing IN (imports + storage withdrawals) and subtracting everything flowing OUT (exports + storage injections). The result is the gas consumed inside Bulgaria that day." },
        power: { source: "ENTSO-E (European electricity network) — daily generation ÷ annual efficiency", text: "Daily electricity ÷ annual power-station efficiency." },
        industry: { source: "Eurostat annual figure, spread across months", text: "Bulgaria's annual industrial figure from Eurostat, spread across months using the typical European industrial seasonal pattern. For the current year, we carry forward the most recent confirmed annual." },
        res_com: { source: "Computed leftover (preliminary)", text: "Daily ENTSOG total minus Power minus Industry." },
        ih: { source: "Not emitted (zero)", text: "Always zero — Homes & Businesses absorbs all the leftover." }
      },
      after_eurostat: {
        total: { source: "ENTSOG balance, anchored to Eurostat", text: "Daily values scaled so monthly sum matches Eurostat." },
        power: { source: "ENTSO-E (European electricity network) — daily generation ÷ annual efficiency", text: "Daily electricity ÷ annual power-station efficiency." },
        industry: { source: "Eurostat annual figure, spread across months", text: "Bulgaria's annual industrial figure from Eurostat, spread across months using the typical European industrial seasonal pattern. For the current year, we carry forward the most recent confirmed annual." },
        res_com: { source: "Computed leftover (final)", text: "Eurostat-anchored Total − Power − Industry." },
        ih: { source: "Not emitted (zero)", text: "Always zero." }
      },
      example: { month: "February 2024", state: "after_eurostat", total: 2.73, power: 0.88, industry: 1.04, res_com: 0.80 }
    }
  },

  "GR": {
    name: "Greece",
    group: "Greece has daily total via the ENTSOG balance method but no monthly sector breakdown — Industry comes from Eurostat's annual figure.",
    historical: {
      before_eurostat: {
        total: { source: "ENTSOG (European gas network operators) — balance method", text: "ENTSOG publishes daily gas-network flow data for Greece. We calculate Greece's daily gas consumption by adding up everything flowing IN (imports + storage withdrawals) and subtracting everything flowing OUT (exports + storage injections). The result is the gas consumed inside Greece that day." },
        power: { source: "ENTSO-E (European electricity network) — daily generation ÷ annual efficiency", text: "Daily electricity ÷ annual power-station efficiency." },
        industry: { source: "Eurostat annual figure, spread across months", text: "Greece's annual industrial figure spread across months via the European seasonal pattern. Current year uses carry-forward of the latest confirmed annual." },
        res_com: { source: "Computed leftover (preliminary)", text: "ENTSOG total − Power − Industry." },
        ih: { source: "Not emitted", text: "Always zero." }
      },
      after_eurostat: {
        total: { source: "ENTSOG balance, anchored to Eurostat", text: "Daily values scaled to match Eurostat monthly." },
        power: { source: "ENTSO-E (European electricity network) — daily generation ÷ annual efficiency", text: "Daily electricity ÷ annual power-station efficiency." },
        industry: { source: "Eurostat annual figure, spread across months", text: "Same — annual spread via seasonal pattern." },
        res_com: { source: "Computed leftover (final)", text: "Total − Power − Industry." },
        ih: { source: "Not emitted", text: "Always zero." }
      },
      example: { month: "February 2024", state: "after_eurostat", total: 4.97, power: 2.60, industry: 0.76, res_com: 1.61 }
    }
  },

  "LT": {
    name: "Lithuania",
    group: "Lithuania has daily total via the ENTSOG balance method but no monthly sector breakdown — Industry comes from Eurostat's annual figure.",
    historical: {
      before_eurostat: {
        total: { source: "ENTSOG (European gas network operators) — balance method", text: "ENTSOG publishes daily gas-network flow data for Lithuania. We calculate Lithuania's daily gas consumption by adding up everything flowing IN (imports + storage withdrawals) and subtracting everything flowing OUT (exports + storage injections). The result is the gas consumed inside Lithuania that day." },
        power: { source: "ENTSO-E (European electricity network) — daily generation ÷ annual efficiency", text: "Daily electricity ÷ annual power-station efficiency." },
        industry: { source: "Eurostat annual figure, spread across months", text: "Annual industrial figure spread monthly via European seasonal pattern." },
        res_com: { source: "Computed leftover (preliminary)", text: "ENTSOG total − Power − Industry." },
        ih: { source: "Not emitted", text: "Always zero." }
      },
      after_eurostat: {
        total: { source: "ENTSOG balance, anchored to Eurostat", text: "Daily values scaled to match Eurostat monthly." },
        power: { source: "ENTSO-E (European electricity network) — daily generation ÷ annual efficiency", text: "Daily electricity ÷ annual power-station efficiency." },
        industry: { source: "Eurostat annual figure, spread across months", text: "Annual industrial figure spread monthly via European seasonal pattern." },
        res_com: { source: "Computed leftover (final)", text: "Total − Power − Industry." },
        ih: { source: "Not emitted", text: "Always zero." }
      },
      example: { month: "February 2024", state: "after_eurostat", total: 1.80, power: 0.18, industry: 1.00, res_com: 0.62 }
    }
  },

  "SI": {
    name: "Slovenia",
    group: "Slovenia has daily total via the ENTSOG balance method but no monthly sector breakdown — Industry comes from Eurostat's annual figure.",
    historical: {
      before_eurostat: {
        total: { source: "ENTSOG (European gas network operators) — balance method", text: "ENTSOG publishes daily gas-network flow data for Slovenia. We calculate Slovenia's daily gas consumption by adding up everything flowing IN (imports + storage withdrawals) and subtracting everything flowing OUT (exports + storage injections). The result is the gas consumed inside Slovenia that day." },
        power: { source: "ENTSO-E (European electricity network) — daily generation ÷ annual efficiency", text: "Daily electricity ÷ annual power-station efficiency." },
        industry: { source: "Eurostat annual figure, spread across months", text: "Annual industrial figure spread monthly via European seasonal pattern." },
        res_com: { source: "Computed leftover (preliminary)", text: "ENTSOG total − Power − Industry." },
        ih: { source: "Not emitted", text: "Always zero." }
      },
      after_eurostat: {
        total: { source: "ENTSOG balance, anchored to Eurostat", text: "Daily values scaled to match Eurostat." },
        power: { source: "ENTSO-E (European electricity network) — daily generation ÷ annual efficiency", text: "Daily electricity ÷ annual power-station efficiency." },
        industry: { source: "Eurostat annual figure, spread across months", text: "Same." },
        res_com: { source: "Computed leftover (final)", text: "Total − Power − Industry." },
        ih: { source: "Not emitted", text: "Always zero." }
      },
      example: { month: "February 2024", state: "after_eurostat", total: 0.92, power: 0.11, industry: 0.49, res_com: 0.32 }
    }
  },

  // ─── GROUP 7: Poland ──────────────────────────────────────────────────

  "PL": {
    name: "Poland",
    group: "Poland uses ENTSOG direct-consumer flow data (rather than the balance method) as its daily total source, with a small adjustment.",
    historical: {
      before_eurostat: {
        total: { source: "ENTSOG direct-consumer flows × 1.09", text: "ENTSOG publishes daily flows to direct consumers in Poland. These run about 9% below the official figure consistently, so we apply a flat 1.09 multiplier to align." },
        power: { source: "ENTSO-E (European electricity network) — daily generation ÷ annual efficiency", text: "Daily electricity ÷ annual power-station efficiency." },
        industry: { source: "Eurostat annual figure, spread across months", text: "Poland's annual industrial figure spread monthly via European seasonal pattern." },
        res_com: { source: "Computed leftover (preliminary)", text: "Daily total − Power − Industry." },
        ih: { source: "Not emitted", text: "Always zero." }
      },
      after_eurostat: {
        total: { source: "ENTSOG direct-consumer × 1.09, anchored to Eurostat", text: "Daily values further scaled so monthly sum matches Eurostat exactly." },
        power: { source: "ENTSO-E (European electricity network) — daily generation ÷ annual efficiency", text: "Daily electricity ÷ annual power-station efficiency." },
        industry: { source: "Eurostat annual figure, spread across months", text: "Poland's annual industrial figure spread monthly via European seasonal pattern." },
        res_com: { source: "Computed leftover (final)", text: "Total − Power − Industry." },
        ih: { source: "Not emitted", text: "Always zero." }
      },
      example: { month: "February 2024", state: "after_eurostat", total: 21.64, power: 3.74, industry: 6.49, res_com: 11.41 }
    }
  },

  // ─── GROUP 8: Eurostat-only countries ─────────────────────────────────

  "AT": {
    name: "Austria",
    group: "Austria depends on Eurostat for its monthly Total — there's no near-real-time daily total source. (Austria's own gas operator AGGM requires authentication credentials we are still arranging.)",
    historical: {
      before_eurostat: {
        total: { source: "Not available", text: "Austria has no daily total source available to us yet. The ENTSOG balance for Austria is unreliable (~60% off vs Eurostat) due to large transit flows. So before Eurostat publishes, we have no Total figure for Austria." },
        power: { source: "ENTSO-E (European electricity network) — daily generation ÷ annual efficiency", text: "Daily electricity from gas-fired power stations ÷ annual power-station efficiency." },
        industry: { source: "Eurostat annual figure, spread across months", text: "Austria's annual industrial figure spread across months via European seasonal pattern. Current year uses carry-forward of the latest confirmed annual." },
        res_com: { source: "Not available until total is known", text: "Without a Total, no leftover can be computed." },
        ih: { source: "Not available", text: "Same." }
      },
      after_eurostat: {
        total: { source: "Eurostat (the EU statistical agency) — monthly figure", text: "Austria's official monthly gas consumption from Eurostat." },
        power: { source: "ENTSO-E (European electricity network) — daily generation ÷ annual efficiency", text: "Daily electricity from gas-fired power stations ÷ annual power-station efficiency." },
        industry: { source: "Eurostat annual figure, spread across months", text: "Austria's annual industrial figure spread across months via European seasonal pattern. Current year uses carry-forward of the latest confirmed annual." },
        res_com: { source: "Computed leftover", text: "Homes & Businesses = Total − Power − Industry." },
        ih: { source: "Not emitted", text: "Always zero." }
      },
      example: { month: "February 2024", state: "after_eurostat", total: 7.60, power: 1.91, industry: 3.08, res_com: 2.60 }
    }
  },

  "CZ": {
    name: "Czech Republic",
    group: "Czech Republic depends on Eurostat for its monthly Total — the ENTSOG balance is unreliable (~140% off) and the Czech direct-consumer feed is empty.",
    historical: {
      before_eurostat: {
        total: { source: "Not available", text: "No daily total source available — the Czech ENTSOG balance is unreliable and the operator-level feed is empty. Before Eurostat publishes, no Total figure for Czech Republic." },
        power: { source: "ENTSO-E (European electricity network) — daily generation ÷ annual efficiency", text: "Daily electricity ÷ annual power-station efficiency." },
        industry: { source: "Eurostat annual figure, spread across months", text: "Annual industrial figure spread monthly via European seasonal pattern." },
        res_com: { source: "Not available until total is known", text: "No total → no leftover." },
        ih: { source: "Not available", text: "Same." }
      },
      after_eurostat: {
        total: { source: "Eurostat (the EU statistical agency) — monthly figure", text: "Czech Republic's official monthly gas consumption from Eurostat." },
        power: { source: "ENTSO-E (European electricity network) — daily generation ÷ annual efficiency", text: "Daily electricity ÷ annual power-station efficiency." },
        industry: { source: "Eurostat annual figure, spread across months", text: "Annual industrial figure spread monthly via European seasonal pattern." },
        res_com: { source: "Computed leftover", text: "Total − Power − Industry." },
        ih: { source: "Not emitted", text: "Always zero." }
      },
      example: { month: "February 2024", state: "after_eurostat", total: 7.76, power: 0.73, industry: 2.21, res_com: 4.81 }
    }
  },

  "DK": {
    name: "Denmark",
    group: "Denmark depends on Eurostat for its monthly Total — no near-real-time daily total source.",
    historical: {
      before_eurostat: {
        total: { source: "Not available", text: "No daily total source. Before Eurostat publishes, no Total." },
        power: { source: "ENTSO-E (European electricity network) — daily generation ÷ annual efficiency", text: "Daily electricity ÷ annual efficiency." },
        industry: { source: "Eurostat annual figure, spread across months", text: "Annual figure spread monthly." },
        res_com: { source: "Not available", text: "No total → no leftover." },
        ih: { source: "Not available", text: "Same." }
      },
      after_eurostat: {
        total: { source: "Eurostat (the EU statistical agency) — monthly figure", text: "Denmark's official monthly figure from Eurostat." },
        power: { source: "ENTSO-E (European electricity network) — daily generation ÷ annual efficiency", text: "Daily electricity ÷ annual efficiency." },
        industry: { source: "Eurostat annual figure, spread across months", text: "Same." },
        res_com: { source: "Computed leftover", text: "Total − Power − Industry." },
        ih: { source: "Not emitted", text: "Always zero." }
      },
      example: { month: "February 2024", state: "after_eurostat", total: 2.65, power: 0.28, industry: 0.75, res_com: 1.62 }
    }
  },

  "EE": {
    name: "Estonia",
    group: "Estonia depends on Eurostat for its monthly Total — no near-real-time daily total source.",
    historical: {
      before_eurostat: {
        total: { source: "Not available", text: "No daily total source for Estonia." },
        power: { source: "ENTSO-E (European electricity network) — daily generation ÷ annual efficiency", text: "Daily electricity ÷ annual efficiency." },
        industry: { source: "Eurostat annual figure, spread across months", text: "Annual figure spread monthly." },
        res_com: { source: "Not available", text: "No total → no leftover." },
        ih: { source: "Not available", text: "Same." }
      },
      after_eurostat: {
        total: { source: "Eurostat (the EU statistical agency) — monthly figure", text: "Estonia's official monthly figure from Eurostat." },
        power: { source: "ENTSO-E (European electricity network) — daily generation ÷ annual efficiency", text: "Daily electricity ÷ annual efficiency." },
        industry: { source: "Eurostat annual figure, spread across months", text: "Same." },
        res_com: { source: "Computed leftover", text: "Total − Power − Industry." },
        ih: { source: "Not emitted", text: "Always zero." }
      },
      example: { month: "February 2024", state: "after_eurostat", total: 0.47, power: 0.01, industry: 0.07, res_com: 0.40 }
    }
  },

  "FI": {
    name: "Finland",
    group: "Finland depends on Eurostat for its monthly Total — no near-real-time daily total source.",
    historical: {
      before_eurostat: {
        total: { source: "Not available", text: "No daily total source for Finland." },
        power: { source: "ENTSO-E (European electricity network) — daily generation ÷ annual efficiency", text: "Daily electricity ÷ annual efficiency." },
        industry: { source: "Eurostat annual figure, spread across months", text: "Annual figure spread monthly." },
        res_com: { source: "Not available", text: "No total → no leftover." },
        ih: { source: "Not available", text: "Same." }
      },
      after_eurostat: {
        total: { source: "Eurostat (the EU statistical agency) — monthly figure", text: "Finland's official monthly figure from Eurostat." },
        power: { source: "ENTSO-E (European electricity network) — daily generation ÷ annual efficiency", text: "Daily electricity ÷ annual efficiency." },
        industry: { source: "Eurostat annual figure, spread across months", text: "Same." },
        res_com: { source: "Computed leftover", text: "Total − Power − Industry." },
        ih: { source: "Not emitted", text: "Always zero." }
      },
      example: { month: "February 2024", state: "after_eurostat", total: 2.17, power: 0.45, industry: 0.59, res_com: 1.13 }
    }
  },

  "HR": {
    name: "Croatia",
    group: "Croatia depends on Eurostat for its monthly Total — no near-real-time daily total source.",
    historical: {
      before_eurostat: {
        total: { source: "Not available", text: "No daily total source for Croatia." },
        power: { source: "ENTSO-E (European electricity network) — daily generation ÷ annual efficiency", text: "Daily electricity ÷ annual efficiency." },
        industry: { source: "Eurostat annual figure, spread across months", text: "Annual figure spread monthly." },
        res_com: { source: "Not available", text: "No total → no leftover." },
        ih: { source: "Not available", text: "Same." }
      },
      after_eurostat: {
        total: { source: "Eurostat (the EU statistical agency) — monthly figure", text: "Croatia's official monthly figure from Eurostat." },
        power: { source: "ENTSO-E (European electricity network) — daily generation ÷ annual efficiency", text: "Daily electricity ÷ annual efficiency." },
        industry: { source: "Eurostat annual figure, spread across months", text: "Same." },
        res_com: { source: "Computed leftover", text: "Total − Power − Industry." },
        ih: { source: "Not emitted", text: "Always zero." }
      },
      example: { month: "February 2024", state: "after_eurostat", total: 2.45, power: 0.84, industry: 0.52, res_com: 1.09 }
    }
  },

  "IE": {
    name: "Ireland",
    group: "Ireland depends on Eurostat for its monthly Total — no near-real-time daily total source.",
    historical: {
      before_eurostat: {
        total: { source: "Not available", text: "No daily total source for Ireland." },
        power: { source: "ENTSO-E (European electricity network) — daily generation ÷ annual efficiency", text: "Daily electricity ÷ annual efficiency." },
        industry: { source: "Eurostat annual figure, spread across months", text: "Annual figure spread monthly." },
        res_com: { source: "Not available", text: "No total → no leftover." },
        ih: { source: "Not available", text: "Same." }
      },
      after_eurostat: {
        total: { source: "Eurostat (the EU statistical agency) — monthly figure", text: "Ireland's official monthly figure from Eurostat." },
        power: { source: "ENTSO-E (European electricity network) — daily generation ÷ annual efficiency", text: "Daily electricity ÷ annual efficiency." },
        industry: { source: "Eurostat annual figure, spread across months", text: "Same." },
        res_com: { source: "Computed leftover", text: "Total − Power − Industry." },
        ih: { source: "Not emitted", text: "Always zero." }
      },
      example: { month: "February 2024", state: "after_eurostat", total: 4.52, power: 2.29, industry: 1.13, res_com: 1.10 }
    }
  },

  "LV": {
    name: "Latvia",
    group: "Latvia depends on Eurostat for its monthly Total — no near-real-time daily total source.",
    historical: {
      before_eurostat: {
        total: { source: "Not available", text: "No daily total source for Latvia." },
        power: { source: "ENTSO-E (European electricity network) — daily generation ÷ annual efficiency", text: "Daily electricity ÷ annual efficiency." },
        industry: { source: "Eurostat annual figure, spread across months", text: "Annual figure spread monthly." },
        res_com: { source: "Not available", text: "No total → no leftover." },
        ih: { source: "Not available", text: "Same." }
      },
      after_eurostat: {
        total: { source: "Eurostat (the EU statistical agency) — monthly figure", text: "Latvia's official monthly figure from Eurostat." },
        power: { source: "ENTSO-E (European electricity network) — daily generation ÷ annual efficiency", text: "Daily electricity ÷ annual efficiency." },
        industry: { source: "Eurostat annual figure, spread across months", text: "Same." },
        res_com: { source: "Computed leftover", text: "Total − Power − Industry." },
        ih: { source: "Not emitted", text: "Always zero." }
      },
      example: { month: "February 2024", state: "after_eurostat", total: 1.32, power: 0.79, industry: 0.10, res_com: 0.43 }
    }
  },

  "SE": {
    name: "Sweden",
    group: "Sweden has only a small gas system (no significant transmission network) and depends on Eurostat for monthly figures.",
    historical: {
      before_eurostat: {
        total: { source: "Not available", text: "No daily total source for Sweden — its small gas system isn't reflected in ENTSOG." },
        power: { source: "ENTSO-E (European electricity network) — daily generation ÷ annual efficiency", text: "Daily electricity ÷ annual efficiency. Sweden burns very little gas for electricity." },
        industry: { source: "Eurostat annual figure, spread across months", text: "Annual figure spread monthly." },
        res_com: { source: "Not available", text: "No total → no leftover." },
        ih: { source: "Not available", text: "Same." }
      },
      after_eurostat: {
        total: { source: "Eurostat (the EU statistical agency) — monthly figure", text: "Sweden's official monthly figure from Eurostat." },
        power: { source: "ENTSO-E (European electricity network) — daily generation ÷ annual efficiency", text: "Daily electricity ÷ annual efficiency. Sweden burns very little gas for electricity." },
        industry: { source: "Eurostat annual figure, spread across months", text: "Same." },
        res_com: { source: "Computed leftover", text: "Total − Power − Industry." },
        ih: { source: "Not emitted", text: "Always zero." }
      },
      example: { month: "February 2024", state: "after_eurostat", total: 1.02, power: 0.00, industry: 0.56, res_com: 0.46 }
    }
  },

  "SK": {
    name: "Slovakia",
    group: "Slovakia depends on Eurostat for its monthly Total — the ENTSOG balance is distorted by large transit flows.",
    historical: {
      before_eurostat: {
        total: { source: "Not available", text: "No reliable daily total source for Slovakia — ENTSOG balance is distorted by transit flows." },
        power: { source: "ENTSO-E (European electricity network) — daily generation ÷ annual efficiency", text: "Daily electricity ÷ annual efficiency." },
        industry: { source: "Eurostat annual figure, spread across months", text: "Annual figure spread monthly." },
        res_com: { source: "Not available", text: "No total → no leftover." },
        ih: { source: "Not available", text: "Same." }
      },
      after_eurostat: {
        total: { source: "Eurostat (the EU statistical agency) — monthly figure", text: "Slovakia's official monthly figure from Eurostat." },
        power: { source: "ENTSO-E (European electricity network) — daily generation ÷ annual efficiency", text: "Daily electricity ÷ annual efficiency." },
        industry: { source: "Eurostat annual figure, spread across months", text: "Same." },
        res_com: { source: "Computed leftover", text: "Total − Power − Industry." },
        ih: { source: "Not emitted", text: "Always zero." }
      },
      example: { month: "February 2024", state: "after_eurostat", total: 5.06, power: 0.57, industry: 1.35, res_com: 3.14 }
    }
  },

  "MT": {
    name: "Malta",
    group: "Malta has only a small LNG-fed gas system feeding one power plant. We don't break out sectors for Malta.",
    historical: {
      before_eurostat: {
        total: { source: "Not available", text: "No daily total source for Malta." },
        power: { source: "Not separated", text: "Almost all of Malta's gas goes to a single power plant. We don't separately report it." },
        industry: { source: "Negligible", text: "Malta has minimal industrial gas demand." },
        res_com: { source: "Negligible", text: "Malta has no household gas grid." },
        ih: { source: "Not available", text: "Without a Total, nothing to report." }
      },
      after_eurostat: {
        total: { source: "Eurostat (the EU statistical agency) — monthly figure", text: "Malta's official monthly gas consumption from Eurostat." },
        power: { source: "Not separated", text: "Same — not broken out." },
        industry: { source: "Not separated", text: "Negligible." },
        res_com: { source: "Not separated", text: "Negligible." },
        ih: { source: "Captures the entire total", text: "Because we don't separate Malta's sectors, the entire total is reported as a single 'Other / Unaccounted' line." }
      },
      example: { month: "February 2024", state: "after_eurostat", total: 0.32, ih: 0.32 }
    }
  },

  // ─── GROUP 9: UK ──────────────────────────────────────────────────────
  // UK uses DESNZ (UK government) instead of Eurostat — same role, same lag.

  "UK": {
    name: "United Kingdom",
    group: "The UK uses DESNZ (Department for Energy Security and Net Zero) Energy Trends Table 4.2 as its monthly source — Eurostat dropped the UK after Brexit. DESNZ has the same ~2-month lag as Eurostat.",
    historical: {
      before_eurostat: {
        total: { source: "National Gas (daily) × monthly uplift factor", text: "National Gas publishes daily flow on the UK national transmission system. We multiply by a monthly uplift factor (~1.13) to add back off-network gas (refineries, LNG terminal own-use, gas storage own-use, transport, non-energy use). The uplift factor is calculated rolling per month against the latest DESNZ data." },
        power: { source: "National Gas Powerstations × power uplift factor", text: "National Gas publishes daily gas to large power stations on the transmission network. We multiply by a power-specific uplift factor (~1.27) to add back smaller power stations connected to the local distribution networks (which the National Gas data alone misses)." },
        industry: { source: "DESNZ annual, distributed monthly (or DESNZ monthly for 2023+)", text: "From January 2023 onwards, DESNZ publishes monthly UK industrial gas consumption directly. For pre-2023 months, we use DESNZ's annual industrial figure spread across months." },
        res_com: { source: "DESNZ annual, distributed monthly (or DESNZ monthly for 2023+)", text: "From January 2023 onwards, DESNZ publishes monthly UK domestic + services gas directly. Pre-2023 uses the annual figure spread monthly." },
        ih: { source: "Computed leftover", text: "Daily uplifted total minus Power minus Industry minus Homes & Businesses. Captures any remaining off-network gas (~7-12% of UK demand)." }
      },
      after_eurostat: {
        total: { source: "DESNZ ET 4.2 (anchored)", text: "Once DESNZ publishes UK monthly Energy Trends Table 4.2, we scale daily values so the monthly sum matches DESNZ exactly." },
        power: { source: "National Gas Powerstations × uplift, anchored to DESNZ", text: "Daily values further scaled so the monthly sum matches DESNZ's monthly power figure." },
        industry: { source: "DESNZ ET 4.2 monthly (2023+)", text: "DESNZ publishes UK monthly industrial gas directly (from January 2023). Earlier years use DESNZ's annual figure spread across months." },
        res_com: { source: "DESNZ ET 4.2 monthly (2023+, domestic + services)", text: "DESNZ publishes UK monthly domestic + services gas directly (from January 2023). Earlier years use DESNZ annual." },
        ih: { source: "Computed leftover", text: "DESNZ total minus Power minus Industry minus Homes & Businesses. Captures off-network gas not in the three explicit sectors — producer own-use, LNG terminal own-use, refineries, transport, non-energy use." }
      },
      example: { month: "February 2024", state: "after_eurostat", total: 73.11, power: 15.22, industry: 7.96, res_com: 42.71, ih: 7.21 }
    }
  }
};

// ─── Industry annual k factor tables (FR + DE only) ──────────────────────

const K_FACTORS = {
  "FR": [
    { year: 2017, k: 0.8976, type: "rolling" },
    { year: 2018, k: 0.8657, type: "actual_annual" },
    { year: 2019, k: 0.7681, type: "actual_annual" },
    { year: 2020, k: 0.7502, type: "actual_annual" },
    { year: 2021, k: 0.8463, type: "actual_annual" },
    { year: 2022, k: 0.7165, type: "actual_annual" },
    { year: 2023, k: 0.8142, type: "actual_annual" },
    { year: 2024, k: 0.9810, type: "actual_annual" },
    { year: 2025, k: 0.8976, type: "rolling" },
    { year: 2026, k: 0.8976, type: "rolling" }
  ],
  "DE": [
    { year: 2017, k: 0.8708, type: "rolling" },
    { year: 2018, k: 0.8708, type: "rolling" },
    { year: 2019, k: 0.8708, type: "rolling" },
    { year: 2020, k: 0.8708, type: "rolling" },
    { year: 2021, k: 0.8708, type: "rolling" },
    { year: 2022, k: 0.8643, type: "actual_annual" },
    { year: 2023, k: 0.9108, type: "actual_annual" },
    { year: 2024, k: 0.8309, type: "actual_annual" },
    { year: 2025, k: 0.8708, type: "rolling" },
    { year: 2026, k: 0.8708, type: "rolling" }
  ]
};

// Display order — countries listed alphabetically by name
const COUNTRY_ORDER = Object.keys(COUNTRIES).sort((a, b) =>
  COUNTRIES[a].name.localeCompare(COUNTRIES[b].name)
);

// Current month methodology (placeholder until finalised)
const CURRENT_MONTH_PLACEHOLDER_TEXT = `
The methodology for the current month and very recent months (typically the last 1-2 months) is still being finalised.

In general:
• Power is always up-to-date (ENTSO-E publishes within a day)
• Total demand uses the country's daily operator data if available (Trading Hub Europe for Germany, ENTSOG balance method for many others, National Gas for the UK, Enagás for Spain). Countries that depend on Eurostat (such as Austria, Czech Republic, the Nordics) have no current-month total until Eurostat publishes about 2 months later.
• Industry uses the latest annual figure carried forward, or the daily operator data where available.
• Homes & Businesses fills in via daily operator data or as a leftover once the total is known.

Detailed per-country current-month methodology will be added here once finalised.
`.trim();
