export async function publishPlayerCard(
  player,
  {
    totalProspects = "226,000+",
    countries = "107",
  } = {},
) {
  const card = document.querySelector(".selected-player-stage .prospect-card");

  if (!card) {
    console.error("No selected player card found to publish.");
    return;
  }

  const playerName = player?.name || "prospect-card";
  const playerId = player?.eliteId || player?.id || "unknown";

  const cleanName = String(playerName)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  const publishedAt = new Date();

  const publishedDisplay = publishedAt.toLocaleString("en-CA", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  });

  const liveProfileUrl =
    player?.eliteUrl || `https://www.eliteprospects.com/player/${playerId}`;

  const totalText =
    typeof totalProspects === "number"
      ? totalProspects.toLocaleString()
      : totalProspects;

  const isVerified = Boolean(player?.enriched || player?.imageUrl);
  const sourceText =
    player?.source === "elite_prospects" || player?.eliteUrl
      ? "Elite Prospects Data"
      : "Local Data";

  let publishFooter = null;

  try {
    const { toPng } = await import("html-to-image");
    const QRCode = await import("qrcode");

    const qrDataUrl = await QRCode.toDataURL(liveProfileUrl, {
      width: 180,
      margin: 1,
    });

    card.classList.add("publishing-card");

    publishFooter = document.createElement("div");
    publishFooter.className = "prospector-publish-footer";
    publishFooter.innerHTML = `
      <div class="publish-footer-grid">
        <div>
          <span>Published</span>
          <strong>${publishedDisplay}</strong>
        </div>

        <div>
          <span>Database Snapshot</span>
          <strong>${totalText} Prospects</strong>
          <small>${countries} Countries</small>
        </div>

        <div>
          <span>Intel Quality</span>
          <strong>${isVerified ? "Verified File" : "Basic File"}</strong>
          <small>${sourceText}</small>
        </div>

        <div class="publish-qr-block">
          <img src="${qrDataUrl}" alt="Live profile QR code" />
          <small>Scan for live profile</small>
        </div>
      </div>

      <div class="prospector-brand-pill">
        <strong>DAVE HALL'S PROSPECTOR</strong>
        <span>Global Hockey Intelligence Platform</span>
      </div>
    `;

    card.appendChild(publishFooter);

    await new Promise((resolve) => requestAnimationFrame(resolve));

    const dataUrl = await toPng(card, {
      cacheBust: true,
      pixelRatio: 2,
      width: 720,
      height: card.scrollHeight,

      style: {
        width: "720px",
        maxWidth: "720px",
        minWidth: "720px",
        height: "auto",
        overflow: "visible",
      },

      filter: (node) => {
        // Elite player photos are blocked by CORS in browser canvas export.
        // Skip them so publishing still succeeds.
        if (
          node instanceof HTMLImageElement &&
          node.src.includes("files.eliteprospects.com")
        ) {
          console.warn("Skipping Elite player image during publish.");
          return false;
        }

        const classList = node.classList;

        if (!classList) return true;

        return !(
          classList.contains("publish-button") ||
          classList.contains("intel-button") ||
          classList.contains("story-button") ||
          classList.contains("scout-intel-panel") ||
          classList.contains("podcast-brief-panel")
        );
      },
    });

    const link = document.createElement("a");
    link.download = `${cleanName}-prospector-report.png`;
    link.href = dataUrl;
    link.click();
  } catch (error) {
    console.error("Unable to publish player card:", error);
  } finally {
    if (publishFooter) publishFooter.remove();
    card.classList.remove("publishing-card");
  }
}