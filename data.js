// Methodology data for each country.
// Example values are from February 2024 (a fully-anchored historical month).
// Units: TWh (terawatt-hours, gas energy content)

const COUNTRIES = {

  // ─── GROUP 1: Italy & Netherlands ─────────────────────────────────────
  // These two get the full monthly breakdown directly from Eurostat.

  "IT": {
    name: "Italy",
    group: "Eurostat publishes the full monthly breakdown",
    historical: {
      total: {
        source: "Eurostat (the EU statistical agency)",
        text: "Eurostat publishes Italy's total monthly gas consumption about 2 months after the month ends. This is the official figure."
      },
      power: {
        source: "ENTSO-E (European electricity network)",
        text: "We get the daily electricity generated from gas-fired power stations from ENTSO-E. We then divide this by Italy's average power-station efficiency for that year (calibrated against Eurostat's annual figure for total gas-to-power, which includes industrial CHP and small power plants). The result is the amount of gas burned to make electricity."
      },
      industry: {
        source: "Eurostat",
        text: "Eurostat publishes Italy's monthly industrial gas consumption directly."
      },
      res_com: {
        source: "Eurostat",
        text: "Eurostat publishes Italy's monthly gas consumption for households + commercial services + agriculture directly."
      },
      ih: {
        source: "Computed leftover",
        text: "Whatever remains of the Total after subtracting Power + Industry + Homes & Businesses. Captures gas used by refineries, transport, and non-energy purposes (chemical feedstock)."
      },
      example: { month: "February 2024", total: 67.44, power: 19.95, industry: 10.31, res_com: 37.18 }
    }
  },

  "NL": {
    name: "Netherlands",
    group: "Eurostat publishes the full monthly breakdown",
    historical: {
      total: {
        source: "Eurostat",
        text: "Eurostat publishes the Netherlands' total monthly gas consumption about 2 months after the month ends. This is the official figure."
      },
      power: {
        source: "ENTSO-E",
        text: "Daily electricity generated from gas-fired power stations is taken from ENTSO-E. We divide by the Netherlands' annual power station efficiency (calibrated each year to Eurostat's full annual gas-to-power figure)."
      },
      industry: {
        source: "Eurostat",
        text: "Eurostat publishes the Netherlands' monthly industrial gas consumption directly."
      },
      res_com: {
        source: "Eurostat",
        text: "Eurostat publishes the Netherlands' monthly gas consumption for households + commercial services + agriculture directly."
      },
      ih: {
        source: "Computed leftover",
        text: "Whatever remains of the Total after subtracting Power + Industry + Homes & Businesses. For the Netherlands this is typically a few percent — mainly statistical residual and non-energy use."
      },
      example: { month: "February 2024", total: 29.28, power: 6.59, industry: 7.21, res_com: 11.49, ih: 3.99 }
    }
  },

  // ─── GROUP 2: Germany (own ecosystem) ─────────────────────────────────

  "DE": {
    name: "Germany",
    group: "Germany — uses its own gas operator data",
    historical: {
      total: {
        source: "Trading Hub Europe (the German gas operator) anchored to Eurostat",
        text: "Trading Hub Europe (THE) publishes daily total gas consumption for Germany. Once Eurostat publishes the official monthly figure (~2-month lag), we adjust the THE daily values so they sum exactly to the Eurostat monthly total."
      },
      power: {
        source: "ENTSO-E",
        text: "Daily electricity from gas-fired power stations, divided by Germany's annual power station efficiency (about 25%, calibrated each year against Eurostat's annual figure for total gas-to-power)."
      },
      industry: {
        source: "Trading Hub Europe — large customer data minus power",
        text: "THE publishes daily 'large customer' gas demand (called RLM). This includes industrial users, gas-fired power stations, and large commercial users together. We subtract the gas-for-power figure (from ENTSO-E) to remove the power slice. Each year we then scale the result so the annual total matches Eurostat's official annual industry figure."
      },
      res_com: {
        source: "Computed leftover",
        text: "Once Eurostat publishes the monthly Total, Homes & Businesses gas demand is calculated as: Total − Power − Industry. This automatically captures households, small commerce, and any other residual gas not in the Industry or Power categories."
      },
      ih: {
        source: "Not emitted (collapsed into Homes & Businesses)",
        text: "For Germany, once Eurostat publishes the monthly total, we put everything that's not Power and not Industry into Homes & Businesses. There's no separate 'other' line."
      },
      example: { month: "February 2024", total: 87.17, power: 20.89, industry: 21.13, res_com: 45.15 }
    }
  },

  // ─── GROUP 3: France ──────────────────────────────────────────────────

  "FR": {
    name: "France",
    group: "France — uses its own gas operator data",
    historical: {
      total: {
        source: "ENTSOG (European gas network) anchored to Eurostat",
        text: "ENTSOG publishes France's daily total gas consumption (the 'M1 balance method'). Once Eurostat publishes the official monthly figure, we scale the daily values so they sum exactly to the Eurostat monthly total."
      },
      power: {
        source: "ENTSO-E",
        text: "Daily electricity from gas-fired power stations, divided by France's annual power station efficiency (calibrated each year against Eurostat's annual figure for total gas-to-power, including autoproducer plants which are large in France)."
      },
      industry: {
        source: "GRTGaz (French gas network operator) scaled annually to Eurostat",
        text: "GRTGaz publishes daily industrial gas consumption for France (covers both NaTran and Terega networks = full France). Each year we scale these daily values so the annual sum matches Eurostat's official annual industry figure exactly. For years where Eurostat hasn't published yet, we use the average scaling factor of the last 2 confirmed years."
      },
      res_com: {
        source: "GRTGaz directly (or computed leftover after annual confirmation)",
        text: "GRTGaz publishes daily homes & businesses gas demand for France. Once Eurostat confirms both the monthly Total AND the annual Industry for that year, we switch to the leftover method: Homes & Businesses = Total − Power − Industry."
      },
      ih: {
        source: "Computed leftover (only for years before annual Industry is confirmed)",
        text: "Until Eurostat publishes the annual Industry figure for the year, there's a small leftover line capturing the gap between (Power + Industry × rolling factor + raw GRTGaz Homes & Businesses) and the Eurostat-anchored Total. Once annual Industry is confirmed, this collapses to zero."
      },
      example: { month: "February 2024", total: 41.14, power: 5.68, industry: 11.58, res_com: 23.89 }
    }
  },

  // ─── GROUP 4: Spain ───────────────────────────────────────────────────

  "ES": {
    name: "Spain",
    group: "Spain — uses Enagás monthly bulletin",
    historical: {
      total: {
        source: "Enagás (Spanish gas operator) monthly bulletin anchored to Eurostat",
        text: "Enagás publishes a monthly statistics bulletin (Boletín Estadístico) about 6 weeks after the month ends. Once Eurostat publishes its own monthly figure, we use that to confirm or adjust the Enagás value."
      },
      power: {
        source: "ENTSO-E",
        text: "Daily electricity from gas-fired power stations, divided by Spain's annual power station efficiency. Calibrated each year against Eurostat's annual figure (which includes autoproducers and CHP that Enagás's own 'Sector Eléctrico' line misses)."
      },
      industry: {
        source: "Eurostat annual figure spread across months",
        text: "We take Eurostat's official annual industrial gas consumption for Spain and distribute it across the 12 months using the typical seasonal pattern of European industry (more in winter, less in summer)."
      },
      res_com: {
        source: "Computed leftover",
        text: "Homes & Businesses = Total − Power − Industry."
      },
      ih: { source: "Not emitted", text: "Always zero — Homes & Businesses absorbs all the leftover." },
      example: { month: "February 2024", total: 27.83, power: 6.92, industry: 9.91, res_com: 11.00 }
    }
  },

  // ─── GROUP 5: BE / HU / LU / PT / RO ──────────────────────────────────

  "BE": {
    name: "Belgium",
    group: "Real-time data with Bruegel-style classification",
    historical: {
      total: {
        source: "ENTSOG anchored to Eurostat",
        text: "ENTSOG publishes Belgium's daily total gas consumption (the 'M1 balance method'). Once Eurostat publishes its monthly figure, we scale the daily values to match it exactly."
      },
      power: {
        source: "ENTSO-E",
        text: "Daily electricity from gas-fired power stations, divided by Belgium's annual power station efficiency (calibrated against Eurostat's annual figure)."
      },
      industry: {
        source: "ENTSOG point-classifier (Bruegel classification) — from November 2019 onwards",
        text: "ENTSOG publishes daily flow data per network point. A classification (originally from Bruegel) tags each point as industrial, household, power, etc. We sum the industrial-tagged points per month. For months before November 2019, we use Eurostat's annual industrial figure spread across months."
      },
      res_com: {
        source: "Computed leftover",
        text: "Once Eurostat publishes the monthly Total, Homes & Businesses = Total − Power − Industry. Before Eurostat publishes, we use the ENTSOG point-classifier."
      },
      ih: { source: "Not emitted in confirmed months", text: "Always zero once Eurostat publishes the monthly total." },
      example: { month: "February 2024", total: 15.25, power: 1.91, industry: 3.64, res_com: 9.70 }
    }
  },

  "HU": {
    name: "Hungary",
    group: "Real-time data with Bruegel-style classification",
    historical: {
      total: {
        source: "Eurostat (the EU statistical agency)",
        text: "Hungary doesn't have a fast daily-total source, so we use Eurostat directly. Eurostat publishes Hungary's monthly gas consumption about 2 months after the month ends."
      },
      power: {
        source: "ENTSO-E",
        text: "Daily electricity from gas-fired power stations, divided by Hungary's annual power station efficiency."
      },
      industry: {
        source: "ENTSOG point-classifier — from November 2019 onwards",
        text: "ENTSOG publishes daily flow data per network point. The classification tags each point as industrial, household, etc. We sum the industrial-tagged points per month. Before November 2019, we use Eurostat's annual industrial figure."
      },
      res_com: { source: "Computed leftover", text: "Homes & Businesses = Total − Power − Industry." },
      ih: { source: "Not emitted", text: "Always zero." },
      example: { month: "February 2024", total: 9.46, power: 1.51, industry: 1.90, res_com: 6.05 }
    }
  },

  "LU": {
    name: "Luxembourg",
    group: "Real-time data with Bruegel-style classification",
    historical: {
      total: { source: "Eurostat", text: "Eurostat publishes Luxembourg's monthly gas consumption directly." },
      power: { source: "ENTSO-E", text: "Daily electricity from gas-fired power stations, divided by Luxembourg's annual efficiency." },
      industry: { source: "ENTSOG point-classifier", text: "Industrial-tagged ENTSOG points summed monthly. Falls back to Eurostat annual figure for older months." },
      res_com: { source: "Computed leftover", text: "Homes & Businesses = Total − Power − Industry." },
      ih: { source: "Not emitted", text: "Always zero." },
      example: { month: "February 2024", total: 0.72, power: 0.04, industry: 0.23, res_com: 0.46 }
    }
  },

  "PT": {
    name: "Portugal",
    group: "Real-time data with Bruegel-style classification",
    historical: {
      total: { source: "ENTSOG anchored to Eurostat", text: "ENTSOG daily total scaled to match Eurostat monthly." },
      power: { source: "ENTSO-E", text: "Daily electricity ÷ annual efficiency." },
      industry: { source: "ENTSOG point-classifier", text: "Industrial-tagged points summed monthly (from Nov 2019). Eurostat annual otherwise." },
      res_com: { source: "Computed leftover", text: "Total − Power − Industry." },
      ih: { source: "Not emitted", text: "Always zero." },
      example: { month: "February 2024", total: 3.84, power: 1.20, industry: 1.46, res_com: 1.18 }
    }
  },

  "RO": {
    name: "Romania",
    group: "Real-time data with Bruegel-style classification",
    historical: {
      total: { source: "ENTSOG anchored to Eurostat", text: "ENTSOG daily total scaled to match Eurostat monthly." },
      power: { source: "ENTSO-E", text: "Daily electricity ÷ annual efficiency." },
      industry: { source: "ENTSOG point-classifier", text: "Industrial-tagged points summed monthly (from Nov 2019). Eurostat annual otherwise." },
      res_com: { source: "Computed leftover", text: "Total − Power − Industry." },
      ih: { source: "Not emitted", text: "Always zero." },
      example: { month: "February 2024", total: 12.18, power: 2.83, industry: 1.87, res_com: 7.48 }
    }
  },

  // ─── GROUP 6: Tier 2 ENTSOG — BG / GR / LT / SI ───────────────────────

  "BG": {
    name: "Bulgaria", group: "ENTSOG daily total + Eurostat annual industry",
    historical: {
      total: { source: "ENTSOG anchored to Eurostat", text: "ENTSOG daily total scaled to match Eurostat monthly." },
      power: { source: "ENTSO-E", text: "Daily electricity ÷ annual efficiency." },
      industry: { source: "Eurostat annual figure spread across months", text: "Eurostat's annual industrial figure for Bulgaria, distributed across months using the typical European industrial seasonal pattern." },
      res_com: { source: "Computed leftover", text: "Total − Power − Industry." },
      ih: { source: "Not emitted", text: "Always zero." },
      example: { month: "February 2024", total: 2.73, power: 0.88, industry: 1.04, res_com: 0.80 }
    }
  },

  "GR": {
    name: "Greece", group: "ENTSOG daily total + Eurostat annual industry",
    historical: {
      total: { source: "ENTSOG anchored to Eurostat", text: "ENTSOG daily total scaled to match Eurostat monthly." },
      power: { source: "ENTSO-E", text: "Daily electricity ÷ annual efficiency." },
      industry: { source: "Eurostat annual figure spread across months", text: "Eurostat's annual industrial figure distributed monthly via European seasonal pattern." },
      res_com: { source: "Computed leftover", text: "Total − Power − Industry." },
      ih: { source: "Not emitted", text: "Always zero." },
      example: { month: "February 2024", total: 4.97, power: 2.60, industry: 0.76, res_com: 1.61 }
    }
  },

  "LT": {
    name: "Lithuania", group: "ENTSOG daily total + Eurostat annual industry",
    historical: {
      total: { source: "ENTSOG anchored to Eurostat", text: "ENTSOG daily total scaled to match Eurostat monthly." },
      power: { source: "ENTSO-E", text: "Daily electricity ÷ annual efficiency." },
      industry: { source: "Eurostat annual figure spread across months", text: "Eurostat's annual industrial figure distributed monthly via European seasonal pattern." },
      res_com: { source: "Computed leftover", text: "Total − Power − Industry." },
      ih: { source: "Not emitted", text: "Always zero." },
      example: { month: "February 2024", total: 1.80, power: 0.18, industry: 1.00, res_com: 0.62 }
    }
  },

  "SI": {
    name: "Slovenia", group: "ENTSOG daily total + Eurostat annual industry",
    historical: {
      total: { source: "ENTSOG anchored to Eurostat", text: "ENTSOG daily total scaled to match Eurostat monthly." },
      power: { source: "ENTSO-E", text: "Daily electricity ÷ annual efficiency." },
      industry: { source: "Eurostat annual figure spread across months", text: "Eurostat's annual industrial figure distributed monthly via European seasonal pattern." },
      res_com: { source: "Computed leftover", text: "Total − Power − Industry." },
      ih: { source: "Not emitted", text: "Always zero." },
      example: { month: "February 2024", total: 0.92, power: 0.11, industry: 0.49, res_com: 0.32 }
    }
  },

  // ─── GROUP 7: Poland ──────────────────────────────────────────────────

  "PL": {
    name: "Poland",
    group: "ENTSOG direct consumer total + Eurostat annual industry",
    historical: {
      total: {
        source: "ENTSOG direct consumer flows × adjustment + Eurostat anchor",
        text: "ENTSOG publishes daily flows to direct consumers in Poland. Historically these run about 9% below the official figure, so we apply a 1.09 adjustment factor. Then once Eurostat publishes the monthly figure, we scale the daily values to match exactly."
      },
      power: { source: "ENTSO-E", text: "Daily electricity ÷ annual efficiency." },
      industry: { source: "Eurostat annual figure spread across months", text: "Eurostat's annual industrial figure for Poland, distributed monthly using the typical European seasonal pattern." },
      res_com: { source: "Computed leftover", text: "Total − Power − Industry." },
      ih: { source: "Not emitted", text: "Always zero." },
      example: { month: "February 2024", total: 21.64, power: 3.74, industry: 6.49, res_com: 11.41 }
    }
  },

  // ─── GROUP 8: Eurostat-only countries ─────────────────────────────────
  // No daily total source — totally dependent on Eurostat monthly publication.

  "AT": {
    name: "Austria", group: "Eurostat monthly total + Eurostat annual industry",
    historical: {
      total: { source: "Eurostat", text: "Eurostat publishes Austria's monthly gas consumption directly. (Austria's own gas operator, AGGM, requires authentication credentials we are still arranging.)" },
      power: { source: "ENTSO-E", text: "Daily electricity ÷ annual efficiency." },
      industry: { source: "Eurostat annual figure spread across months", text: "Eurostat's annual industrial figure distributed monthly via European seasonal pattern." },
      res_com: { source: "Computed leftover", text: "Total − Power − Industry." },
      ih: { source: "Not emitted", text: "Always zero." },
      example: { month: "February 2024", total: 7.60, power: 1.91, industry: 3.08, res_com: 2.60 }
    }
  },

  "CZ": {
    name: "Czech Republic", group: "Eurostat monthly total + Eurostat annual industry",
    historical: {
      total: { source: "Eurostat", text: "Eurostat publishes the Czech Republic's monthly gas consumption directly. The Czech ENTSOG total is unreliable (~138% off vs Eurostat) so we use Eurostat as the primary source." },
      power: { source: "ENTSO-E", text: "Daily electricity ÷ annual efficiency." },
      industry: { source: "Eurostat annual figure spread across months", text: "Eurostat's annual industrial figure distributed monthly via European seasonal pattern." },
      res_com: { source: "Computed leftover", text: "Total − Power − Industry." },
      ih: { source: "Not emitted", text: "Always zero." },
      example: { month: "February 2024", total: 7.76, power: 0.73, industry: 2.21, res_com: 4.81 }
    }
  },

  "DK": {
    name: "Denmark", group: "Eurostat monthly total + Eurostat annual industry",
    historical: {
      total: { source: "Eurostat", text: "Eurostat publishes Denmark's monthly gas consumption directly." },
      power: { source: "ENTSO-E", text: "Daily electricity ÷ annual efficiency." },
      industry: { source: "Eurostat annual figure spread across months", text: "Eurostat's annual industrial figure distributed monthly via European seasonal pattern." },
      res_com: { source: "Computed leftover", text: "Total − Power − Industry." },
      ih: { source: "Not emitted", text: "Always zero." },
      example: { month: "February 2024", total: 2.65, power: 0.28, industry: 0.75, res_com: 1.62 }
    }
  },

  "EE": {
    name: "Estonia", group: "Eurostat monthly total + Eurostat annual industry",
    historical: {
      total: { source: "Eurostat", text: "Eurostat publishes Estonia's monthly gas consumption directly." },
      power: { source: "ENTSO-E", text: "Daily electricity ÷ annual efficiency." },
      industry: { source: "Eurostat annual figure spread across months", text: "Eurostat's annual industrial figure distributed monthly via European seasonal pattern." },
      res_com: { source: "Computed leftover", text: "Total − Power − Industry." },
      ih: { source: "Not emitted", text: "Always zero." },
      example: { month: "February 2024", total: 0.47, power: 0.01, industry: 0.07, res_com: 0.40 }
    }
  },

  "FI": {
    name: "Finland", group: "Eurostat monthly total + Eurostat annual industry",
    historical: {
      total: { source: "Eurostat", text: "Eurostat publishes Finland's monthly gas consumption directly." },
      power: { source: "ENTSO-E", text: "Daily electricity ÷ annual efficiency." },
      industry: { source: "Eurostat annual figure spread across months", text: "Eurostat's annual industrial figure distributed monthly via European seasonal pattern." },
      res_com: { source: "Computed leftover", text: "Total − Power − Industry." },
      ih: { source: "Not emitted", text: "Always zero." },
      example: { month: "February 2024", total: 2.17, power: 0.45, industry: 0.59, res_com: 1.13 }
    }
  },

  "HR": {
    name: "Croatia", group: "Eurostat monthly total + Eurostat annual industry",
    historical: {
      total: { source: "Eurostat", text: "Eurostat publishes Croatia's monthly gas consumption directly." },
      power: { source: "ENTSO-E", text: "Daily electricity ÷ annual efficiency." },
      industry: { source: "Eurostat annual figure spread across months", text: "Eurostat's annual industrial figure distributed monthly via European seasonal pattern." },
      res_com: { source: "Computed leftover", text: "Total − Power − Industry." },
      ih: { source: "Not emitted", text: "Always zero." },
      example: { month: "February 2024", total: 2.45, power: 0.84, industry: 0.52, res_com: 1.09 }
    }
  },

  "IE": {
    name: "Ireland", group: "Eurostat monthly total + Eurostat annual industry",
    historical: {
      total: { source: "Eurostat", text: "Eurostat publishes Ireland's monthly gas consumption directly." },
      power: { source: "ENTSO-E", text: "Daily electricity ÷ annual efficiency." },
      industry: { source: "Eurostat annual figure spread across months", text: "Eurostat's annual industrial figure distributed monthly via European seasonal pattern." },
      res_com: { source: "Computed leftover", text: "Total − Power − Industry." },
      ih: { source: "Not emitted", text: "Always zero." },
      example: { month: "February 2024", total: 4.52, power: 2.29, industry: 1.13, res_com: 1.10 }
    }
  },

  "LV": {
    name: "Latvia", group: "Eurostat monthly total + Eurostat annual industry",
    historical: {
      total: { source: "Eurostat", text: "Eurostat publishes Latvia's monthly gas consumption directly." },
      power: { source: "ENTSO-E", text: "Daily electricity ÷ annual efficiency." },
      industry: { source: "Eurostat annual figure spread across months", text: "Eurostat's annual industrial figure distributed monthly via European seasonal pattern." },
      res_com: { source: "Computed leftover", text: "Total − Power − Industry." },
      ih: { source: "Not emitted", text: "Always zero." },
      example: { month: "February 2024", total: 1.32, power: 0.79, industry: 0.10, res_com: 0.43 }
    }
  },

  "SE": {
    name: "Sweden", group: "Eurostat monthly total + Eurostat annual industry",
    historical: {
      total: { source: "Eurostat", text: "Eurostat publishes Sweden's monthly gas consumption directly. (Sweden has no significant ENTSOG transmission network.)" },
      power: { source: "ENTSO-E", text: "Daily electricity ÷ annual efficiency." },
      industry: { source: "Eurostat annual figure spread across months", text: "Eurostat's annual industrial figure distributed monthly via European seasonal pattern." },
      res_com: { source: "Computed leftover", text: "Total − Power − Industry." },
      ih: { source: "Not emitted", text: "Always zero." },
      example: { month: "February 2024", total: 1.02, power: 0.00, industry: 0.56, res_com: 0.46 }
    }
  },

  "SK": {
    name: "Slovakia", group: "Eurostat monthly total + Eurostat annual industry",
    historical: {
      total: { source: "Eurostat", text: "Eurostat publishes Slovakia's monthly gas consumption directly. The Slovak ENTSOG balance is distorted by transit flows so we use Eurostat as the primary source." },
      power: { source: "ENTSO-E", text: "Daily electricity ÷ annual efficiency." },
      industry: { source: "Eurostat annual figure spread across months", text: "Eurostat's annual industrial figure distributed monthly via European seasonal pattern." },
      res_com: { source: "Computed leftover", text: "Total − Power − Industry." },
      ih: { source: "Not emitted", text: "Always zero." },
      example: { month: "February 2024", total: 5.06, power: 0.57, industry: 1.35, res_com: 3.14 }
    }
  },

  "MT": {
    name: "Malta", group: "Eurostat-only (very small system)",
    historical: {
      total: { source: "Eurostat", text: "Eurostat publishes Malta's monthly gas consumption directly. Malta has only a small LNG-fed gas system feeding a power plant." },
      power: { source: "Not separated", text: "Malta's gas is essentially all used for one power plant. We don't separate it from the total." },
      industry: { source: "Not separated", text: "Negligible." },
      res_com: { source: "Not separated", text: "Negligible — Malta has no household gas grid." },
      ih: { source: "Captures the entire total", text: "Because we don't have a clean Power/Industry/Homes split for Malta, the entire total is reported as a single 'other' line." },
      example: { month: "February 2024", total: 0.32, ih: 0.32 }
    }
  },

  // ─── GROUP 9: UK (DESNZ) ──────────────────────────────────────────────

  "UK": {
    name: "United Kingdom",
    group: "UK — uses DESNZ (UK government statistics)",
    historical: {
      total: {
        source: "National Gas (UK gas operator) anchored to DESNZ ET 4.2",
        text: "National Gas publishes daily total flow on the UK national transmission system. Once DESNZ (the UK Department for Energy Security and Net Zero) publishes its monthly Energy Trends Table 4.2 (~2-month lag), we scale the daily values so the monthly sum matches exactly. DESNZ ET 4.2 includes off-network gas (refineries, LNG terminals, storage) that the National Gas data alone misses."
      },
      power: {
        source: "National Gas (Powerstations) scaled by DESNZ uplift, anchored to DESNZ",
        text: "National Gas publishes daily gas to large power stations. We multiply by an annual uplift factor (~1.27) to add back the gas going to smaller power stations connected to the local distribution network. Once DESNZ publishes the monthly figure, we scale to match it exactly."
      },
      industry: {
        source: "DESNZ Energy Trends Table 4.2 (monthly from 2023)",
        text: "DESNZ publishes monthly UK industrial gas consumption directly from 2023 onwards. For older months, we use DESNZ's annual industrial figure spread across months."
      },
      res_com: {
        source: "DESNZ Energy Trends Table 4.2 (households + services, monthly from 2023)",
        text: "DESNZ publishes monthly UK domestic + services gas consumption directly from 2023 onwards. For older months, we use DESNZ's annual figure spread across months."
      },
      ih: {
        source: "Computed leftover (off-NTS gas)",
        text: "DESNZ's total includes off-network gas — producer own-use, LNG terminal own-use, gas storage own-use, refineries, transport, non-energy use. After subtracting Power + Industry + Homes & Businesses from the DESNZ total, this leftover line captures that off-network gas (~7-12% of UK total)."
      },
      example: { month: "February 2024", total: 73.11, power: 15.22, industry: 7.96, res_com: 42.71, ih: 7.21 }
    }
  }

};

// Display order — countries listed alphabetically by name in the dropdown
const COUNTRY_ORDER = Object.keys(COUNTRIES).sort((a, b) =>
  COUNTRIES[a].name.localeCompare(COUNTRIES[b].name)
);

// ─── Current month methodology (placeholder — to be finalised) ───────────
//
// User has not yet locked in the current-month methodology details.
// The pipeline currently uses:
//   - Power: ENTSO-E daily values (publishes within a day)
//   - Total / Industry / Res_Com: depends on country; preliminary values
//     from operator data where available, otherwise carry-forward estimates
//
// This section will be populated once the methodology is finalised.
const CURRENT_MONTH_PLACEHOLDER_TEXT = `
The methodology for the current month and very recent months (typically the
last 1-2 months) is still being finalised.

In general:
  • Power is always up-to-date (ENTSO-E publishes within a day)
  • Total demand uses the country's daily operator data if available
    (Trading Hub Europe for Germany, ENTSOG for many others, National Gas
    for the UK, Enagás for Spain). Countries that depend on Eurostat (like
    Austria, Czech Republic, the Nordics) have no current-month total
    until Eurostat publishes ~2 months later.
  • Industry uses the latest annual figure carried forward, or the daily
    operator data where available.
  • Homes & Businesses fills in via daily operator data or as a leftover
    once the total is known.

Detailed per-country current-month methodology will be added here once finalised.
`.trim();
