
(function () {
  const status = document.getElementById("search-status");
  const results = document.getElementById("results");
  const input = document.getElementById("q");
  const generated = document.getElementById("generated-at");

  function norm(s) {
    return (s || "")
      .toString()
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  }

  function money(amount, currency) {
    if (amount === null || amount === undefined) return "—";
    const n = Number(amount);
    const sym = { USD: "$", EUR: "€", GBP: "£" }[currency || "USD"] || ((currency || "") + " ");
    if (n === 0) return sym + "0.00 (free)";
    return sym + n.toFixed(2);
  }

  function typeLabel(t) {
    return ({
      promo_redeem: "Promo / redeem code",
      content_redeem: "Content code",
      creator: "Creator code",
      perk: "Perk / offer",
      how_to_only: "How to redeem",
      redeem: "Redeem code",
      cheat: "Code"
    })[t] || t;
  }

  fetch("data.json")
    .then((r) => r.json())
    .then((data) => {
      generated.textContent = data.generated_at || "";
      const codesByGame = {};
      const salesByGame = {};
      (data.codes || []).forEach((c) => {
        (codesByGame[c.game_id] ||= []).push(c);
      });
      (data.sales || []).forEach((s) => {
        (salesByGame[s.game_id] ||= []).push(s);
      });

      function render(filter) {
        const q = norm(filter);
        results.innerHTML = "";
        let shown = 0;
        data.games.forEach((g) => {
          const hay = norm([g.name, g.aliases, g.publisher, g.franchise_or_platform].join(" "));
          if (q && !hay.includes(q)) return;
          shown += 1;
          const art = document.createElement("article");
          art.className = "card";
          const teen = (g.audience_label || "").indexOf("13") !== -1 || (g.age_rating || "").indexOf("T for Teen") !== -1;
          const badge = g.audience_label
            ? `<span class="badge${teen ? " teen" : ""}">${escapeHtml(g.audience_label)}</span>`
            : "";
          const ratingSrc = g.age_rating_source_url
            ? " " + extLink(g.age_rating_source_url, "rating source")
            : "";
          const site = g.official_site ? " · " + extLink(g.official_site, "official site") : "";
          const redeem = g.official_redeem_url ? " · " + extLink(g.official_redeem_url, "official redeem page") : "";

          let body = "";
          const codes = codesByGame[g.id] || [];
          const sales = salesByGame[g.id] || [];
          if (!codes.length && !sales.length) {
            body += `<p>No verified active codes or prices are on file yet. Check the official page linked above.</p>`;
          }
          codes.forEach((c) => {
            const code = c.code_text
              ? `<p>Code: <span class="code">${escapeHtml(c.code_text)}</span></p>`
              : "";
            const window = [c.start_date ? "from " + c.start_date : "", c.expiry_date ? "until " + c.expiry_date : ""]
              .filter(Boolean)
              .join(" ");
            body += `<section class="item">
              <h3>${escapeHtml(typeLabel(c.type))}${c.code_text ? "" : ""}</h3>
              ${code}
              <p>${escapeHtml(c.reward || "")}</p>
              ${c.redeem_instructions ? `<p>${escapeHtml(c.redeem_instructions)}</p>` : ""}
              ${window ? `<p>Window: ${escapeHtml(window)}</p>` : ""}
              ${c.region_lock ? `<p>Region: ${escapeHtml(c.region_lock)}</p>` : ""}
              ${c.source_url ? `<p>Source: ${extLink(c.source_url, c.source_name || c.source_url)} (checked ${escapeHtml(c.date_checked || "")})</p>` : ""}
            </section>`;
          });
          sales.forEach((s) => {
            const disc = Number(s.discount_pct) > 0 ? `, ${Number(s.discount_pct)}% off` : ", not currently on sale";
            const tracking = !!(s.affiliate_or_redirect || s.source === "cheapshark");
            const href = tracking ? null : (s.deal_url || s.source_url);
            const ed = s.edition ? " — " + s.edition : "";
            const storeLink = tracking
              ? `<p>Price checked through a deal-tracker redirect, which is not linked here because those links can share technical data with other companies.</p>`
              : (href ? `<p>${extLink(href, "Official store listing")} (you are leaving Codekeeper).</p>` : "");
            body += `<section class="item">
              <h3>${escapeHtml(s.store)}${escapeHtml(ed)} (${escapeHtml(s.region || "")})</h3>
              <p>${escapeHtml(money(s.sale_price, s.currency))} (regular ${escapeHtml(money(s.regular_price, s.currency))}${escapeHtml(disc)})</p>
              ${storeLink}
              <p>Checked ${escapeHtml(s.date_checked || "")}.</p>
            </section>`;
          });
          if (g.notes) body += `<p class="meta">${escapeHtml(g.notes)}</p>`;

          art.innerHTML = `
            <header class="card-head">
              <h2>${badge}${escapeHtml(g.name)}</h2>
              <p class="meta">${escapeHtml(g.publisher || "")}${g.platforms ? " · " + escapeHtml(g.platforms) : ""}${site}${redeem}</p>
              <p class="rating">${escapeHtml(g.age_rating || "Age rating: see official store")}${ratingSrc}</p>
            </header>
            <div class="body">${body}</div>`;
          results.appendChild(art);
        });
        status.textContent = q
          ? (shown ? shown + " game" + (shown === 1 ? "" : "s") + " matched." : "No games matched. Try a shorter name or an alias.")
          : (data.games.length + " games in this catalog. Type to filter.");
        if (!shown) {
          const p = document.createElement("p");
          p.className = "empty";
          p.textContent = "No matching games in this official-source snapshot.";
          results.appendChild(p);
        }
      }

      function escapeHtml(s) {
        return String(s || "")
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;");
      }
      function escapeAttr(s) { return escapeHtml(s).replace(/'/g, "&#39;"); }
      function extLink(href, label) {
        return `<a href="${escapeAttr(href)}" target="_blank" rel="noopener noreferrer">${escapeHtml(label)}</a>`;
      }

      input.addEventListener("input", () => render(input.value));
      render("");
    })
    .catch(() => {
      status.textContent = "Could not load data.json.";
    });
})();
