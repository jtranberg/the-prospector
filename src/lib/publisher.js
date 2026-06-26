import { API_BASE_URL } from "../lib/apiConfig";

function getPublishImageUrl(playerId) {
  return `${API_BASE_URL}/api/prospects/image/${playerId}`;
}

export async function publishPlayerCard(
  player,
  {
    totalProspects = "226,000+",
    countries = "108",
  } = {},
) {
  const card = document.querySelector(".selected-player-stage .prospect-card");

  if (!card) {
    console.error("No selected player card found to publish.");
    return;
  }

  const playerName = player?.name || "prospect-card";
  const playerId = player?.eliteId || player?.id || null;

  const cleanName = String(playerName)
    .toLowerCase()
    .replace(/\./g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  const publishedAt = new Date();
  const publishedDate = publishedAt.toLocaleDateString("en-CA");

  const publishedDateDisplay = publishedAt.toLocaleDateString("en-CA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const publishedTimeDisplay = publishedAt.toLocaleTimeString("en-CA", {
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  });

  const reportId = playerId
    ? `DH-${publishedDate.replaceAll("-", "")}-${playerId}`
    : `DH-${publishedDate.replaceAll("-", "")}`;

  const eliteProfileUrl =
    player?.eliteUrl ||
    player?.links?.eliteprospectsUrl ||
    (player?.eliteprospectsUrlPath
      ? `https://www.eliteprospects.com${player.eliteprospectsUrlPath}`
      : null) ||
    (playerId && cleanName
      ? `https://www.eliteprospects.com/player/${playerId}/${cleanName}`
      : null);

  const qrTargetUrl =
    eliteProfileUrl ||
    (playerId && cleanName
      ? `https://www.eliteprospects.com/player/${playerId}/${cleanName}`
      : "https://www.eliteprospects.com");

  const totalText =
    typeof totalProspects === "number"
      ? totalProspects.toLocaleString()
      : totalProspects;

  const isVerified = Boolean(player?.enriched || player?.imageUrl);
  const sourceText =
    player?.source === "elite_prospects" || eliteProfileUrl
      ? "Elite Prospects Data"
      : "Local Data";

  let publishFooter = null;
  let photoCredit = null;
  let playerImage = null;
  let originalImageSrc = null;

  try {
    const { toPng } = await import("html-to-image");
    const QRCode = await import("qrcode");

    const qrDataUrl = await QRCode.toDataURL(qrTargetUrl, {
      width: 180,
      margin: 1,
    });

    card.classList.add("publishing-card");

    photoCredit = document.createElement("small");
    photoCredit.className = "publish-photo-credit";
    photoCredit.textContent = player?.imageUrl
      ? "Elite Prospects player photo"
      : "Player photo unavailable";

    const photoBlock = card.querySelector(".hockey-card-photo");
    if (photoBlock) photoBlock.appendChild(photoCredit);

    publishFooter = document.createElement("div");
    publishFooter.className = "prospector-publish-footer";
    publishFooter.innerHTML = `
      <div class="publish-footer-grid">
        <div>
          <span>Published</span>
          <strong>${publishedDateDisplay}</strong>
          <small>${publishedTimeDisplay}</small>
          <small class="publish-report-id">Report ${reportId}</small>
        </div>

        <div>
          <span>Database Snapshot</span>
          <strong>${totalText} Players</strong>
          <small>${countries} Countries</small>
        </div>

        <div>
          <span>Intel Quality</span>
          <strong>${isVerified ? "Verified Intel" : "Basic File"}</strong>
          <small>${sourceText}</small>
        </div>

        <div class="publish-qr-block">
          <img src="${qrDataUrl}" alt="Live profile QR code" />
          <small>Scan for live player profile</small>
        </div>
      </div>

      <div class="prospector-brand-pill">
        <strong>DAVE HALL'S PROSPECTOR</strong>
        <span>Global Hockey Intelligence Platform</span>
      </div>
    `;

    card.appendChild(publishFooter);

    const aiBadge = document.createElement("a");
    aiBadge.className = "app-intelligence-badge";
    aiBadge.href = "https://appintelligence.ca";
    aiBadge.target = "_blank";
    aiBadge.rel = "noopener noreferrer";
    aiBadge.innerHTML = `
      <span class="badge-label">Powered by</span>
      <strong>APP INTELLIGENCE.CA</strong>
    `;
    publishFooter.appendChild(aiBadge);

    const versionLine = document.createElement("small");
    versionLine.className = "publish-version-line";
    versionLine.textContent = "Scout Report v1.0 • © 2026 App Intelligence";
    publishFooter.appendChild(versionLine);

    playerImage = card.querySelector(".hockey-card-photo img");
    originalImageSrc = playerImage?.src || null;

    if (playerImage && playerId) {
      playerImage.src = getPublishImageUrl(playerId);

      await new Promise((resolve) => {
        playerImage.onload = resolve;
        playerImage.onerror = resolve;
      });
    }

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
        if (node instanceof HTMLImageElement && !node.complete) return false;

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
    link.download = `${cleanName}-Scout-Report-${publishedDate}-${reportId}.png`;
    link.href = dataUrl;
    link.click();
  } catch (error) {
    console.error("Unable to publish player card:", error);
  } finally {
    if (playerImage && originalImageSrc) playerImage.src = originalImageSrc;
    if (photoCredit) photoCredit.remove();
    if (publishFooter) publishFooter.remove();
    card.classList.remove("publishing-card");
  }
}