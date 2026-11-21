
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
      const tipsByGame = {};
      (data.codes || []).forEach((c) => {
        (codesByGame[c.game_id] ||= []).push(c);
      });
      (data.sales || []).forEach((s) => {
        (salesByGame[s.game_id] ||= []).push(s);
      });
      (data.tips || []).forEach((t) => {
        (tipsByGame[t.game_id] ||= []).push(t);
      });

      function tipKindLabel(k) {
        return ({ tip: "Tips", strategy: "Strategies", advice: "Advice", easter_egg: "Easter eggs" })[k] || k;
      }

      function render(filter) {
        const q = norm(filter);
        results.innerHTML = "";
        let shown = 0;
        data.games.forEach((g) => {
          const tips = tipsByGame[g.id] || [];
          const tipHay = tips.map((t) => [t.title, t.body, t.kind, t.platform].join(" ")).join(" ");
          const hay = norm([g.name, g.aliases, g.publisher, g.franchise_or_platform, tipHay].join(" "));
          if (q && !hay.includes(q)) return;
          shown += 1;
          const art = document.createElement("article");
          art.className = "card";
          const teen = (g.audience_label || "").indexOf("13") !== -1 || (g.age_rating || "").indexOf("T for Teen") !== -1;
          const badge = g.audience_label
            ? `<span class="badge${teen ? " teen" : ""}">${escapeHtml(g.audience_label)}</span>`
            : "";
          const ratingSrc = g.age_rating_source_url
            ? ` <a href="${escapeAttr(g.age_rating_source_url)}">rating source</a>`
            : "";
          const site = g.official_site ? ` · <a href="${escapeAttr(g.official_site)}">official site</a>` : "";
          const redeem = g.official_redeem_url ? ` · <a href="${escapeAttr(g.official_redeem_url)}">official redeem page</a>` : "";

          let body = "";
          const codes = codesByGame[g.id] || [];
          const sales = salesByGame[g.id] || [];
          if (!codes.length && !sales.length && !tips.length) {
            body += `<p>No verified active codes, prices, or tips are on file yet. Check the official page linked above.</p>`;
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
              ${c.source_url ? `<p>Source: <a href="${escapeAttr(c.source_url)}">${escapeHtml(c.source_name || c.source_url)}</a> (checked ${escapeHtml(c.date_checked || "")})</p>` : ""}
            </section>`;
          });
          sales.forEach((s) => {
            const disc = Number(s.discount_pct) > 0 ? `, ${Number(s.discount_pct)}% off` : ", not currently on sale";
            const href = s.deal_url || s.source_url;
            const ed = s.edition ? " — " + s.edition : "";
            const disclose = s.affiliate_or_redirect || s.source === "cheapshark"
              ? " This link is a CheapShark redirect; CheapShark may earn a commission from some stores."
              : "";
            body += `<section class="item">
              <h3>${escapeHtml(s.store)}${escapeHtml(ed)} (${escapeHtml(s.region || "")})</h3>
              <p>${escapeHtml(money(s.sale_price, s.currency))} (regular ${escapeHtml(money(s.regular_price, s.currency))}${escapeHtml(disc)})</p>
              ${href ? `<p><a href="${escapeAttr(href)}">Store listing</a>.${disclose}</p>` : ""}
              <p>Checked ${escapeHtml(s.date_checked || "")}.</p>
            </section>`;
          });
          if (tips.length) {
            body += `<section class="tips"><h3>Tips &amp; secrets</h3>`;
            ["tip", "strategy", "advice", "easter_egg"].forEach((kind) => {
              const group = tips.filter((t) => t.kind === kind);
              if (!group.length) return;
              body += `<h4 class="tip-kind">${escapeHtml(tipKindLabel(kind))}</h4>`;
              group.forEach((t) => {
                body += `<section class="item tip">
                  <h3>${escapeHtml(t.title)}</h3>
                  <p>${escapeHtml(t.body)}</p>
                  ${t.platform ? `<p>Platform: ${escapeHtml(t.platform)}</p>` : ""}
                  ${t.source_url ? `<p>Source: <a href="${escapeAttr(t.source_url)}">${escapeHtml(t.source_name || t.source_url)}</a> (checked ${escapeHtml(t.date_checked || "")})</p>` : (t.date_checked ? `<p>Checked ${escapeHtml(t.date_checked)}.</p>` : "")}
                </section>`;
              });
            });
            body += `</section>`;
          }
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
          ? (shown ? shown + " game" + (shown === 1 ? "" : "s") + " matched." : "No games or tips matched. Try a shorter name or a tip keyword.")
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

      input.addEventListener("input", () => render(input.value));
      render("");
    })
    .catch(() => {
      status.textContent = "Could not load data.json.";
    });
})();
