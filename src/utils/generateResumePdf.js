// Client-side "open-source resume" PDF generator.
//
// Builds a clean, one-or-more-page PDF from a user's verified Proof of Work
// (their minted attestations). Free for everyone — no server/infra involved.
//
// jsPDF is imported dynamically so it stays out of the main app bundle and is
// only fetched when a user actually clicks "Download resume".

const EMERALD = [16, 185, 129];   // #10b981
const INK = [24, 24, 27];         // zinc-900
const MUTED = [113, 113, 122];    // zinc-500
const LINE = [228, 228, 231];     // zinc-200

/**
 * @param {object}   profile       { github_username, name, github_avatar_url }
 * @param {object[]} attestations  rows from user_attestations
 */
export async function generateResumePdf(profile, attestations = []) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "pt", format: "a4" });

  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const M = 48; // margin
  let y = M;

  const username = profile?.github_username || "unknown";
  const name = profile?.name || username;

  const sorted = [...attestations].sort(
    (a, b) => new Date(b.merged_at || b.created_at) - new Date(a.merged_at || a.created_at),
  );
  const prCount = sorted.length;
  const totalImpact = sorted.reduce((acc, a) => acc + (a.impact_score || 0), 0);

  // Top languages (by frequency).
  const langCounts = {};
  for (const a of sorted) {
    const l = (a.primary_language || "").trim();
    if (l) langCounts[l] = (langCounts[l] || 0) + 1;
  }
  const topLanguages = Object.entries(langCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([l]) => l);

  // ── Header ──────────────────────────────────────────────────────────────
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(...INK);
  doc.text(name, M, y);
  y += 18;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10.5);
  doc.setTextColor(...MUTED);
  doc.text(`github.com/${username}  ·  Open-Source Resume`, M, y);
  y += 22;

  // Accent rule
  doc.setDrawColor(...EMERALD);
  doc.setLineWidth(2);
  doc.line(M, y, pageW - M, y);
  y += 26;

  // ── Summary stats row ───────────────────────────────────────────────────
  const stat = (label, value, x) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.setTextColor(...INK);
    doc.text(String(value), x, y);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...MUTED);
    doc.text(label.toUpperCase(), x, y + 13);
  };
  stat("Merged PRs", prCount, M);
  stat("Total Impact", totalImpact, M + 150);
  stat("Languages", topLanguages.length || "—", M + 300);
  y += 34;

  if (topLanguages.length) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(...MUTED);
    doc.text(`Primary stack: ${topLanguages.join(", ")}`, M, y);
    y += 24;
  }

  // ── Section heading ─────────────────────────────────────────────────────
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...INK);
  doc.text("Verified Contributions", M, y);
  y += 8;
  doc.setDrawColor(...LINE);
  doc.setLineWidth(1);
  doc.line(M, y, pageW - M, y);
  y += 20;

  // ── PR list ─────────────────────────────────────────────────────────────
  if (prCount === 0) {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(10.5);
    doc.setTextColor(...MUTED);
    doc.text("No verified contributions yet.", M, y);
    y += 20;
  }

  for (const a of sorted) {
    // Page break if we're near the bottom.
    if (y > pageH - 80) {
      doc.addPage();
      y = M;
    }

    const date = a.merged_at ? new Date(a.merged_at).toLocaleDateString("en-US", { year: "numeric", month: "short" }) : "";
    const repoLine = `${a.repo_name} #${a.pr_number}`;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.5);
    doc.setTextColor(...INK);
    doc.text(repoLine, M, y);

    // Impact chip (right-aligned)
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...EMERALD);
    doc.text(`+${a.impact_score || 0} impact`, pageW - M, y, { align: "right" });

    y += 14;

    // Title (wrapped)
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(...MUTED);
    const titleLines = doc.splitTextToSize(a.pr_title || "(untitled)", pageW - M * 2 - 90);
    doc.text(titleLines, M, y);

    // Date + language (right-aligned, first line)
    const meta = [date, a.primary_language].filter(Boolean).join("  ·  ");
    if (meta) doc.text(meta, pageW - M, y, { align: "right" });

    y += titleLines.length * 12 + 12;
  }

  // ── Footer on every page ────────────────────────────────────────────────
  const pageCount = doc.internal.getNumberOfPages();
  for (let p = 1; p <= pageCount; p++) {
    doc.setPage(p);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...MUTED);
    doc.text(
      "Cryptographically verified via firstissue.dev — each entry is a real merged pull request.",
      M,
      pageH - 24,
    );
    doc.text(`${p} / ${pageCount}`, pageW - M, pageH - 24, { align: "right" });
  }

  doc.save(`${username}-open-source-resume.pdf`);
}
