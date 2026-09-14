/**
 * AI Career Recommendation System — FR4.1 (Personalized Recommendations),
 * FR4.2 (Skill Gap Analysis), FR4.3 (Learning Roadmap).
 *
 * This implements the "RecommendationEngine" object from Appendix B.3's
 * Sequence Diagram: given a student's Profile (skills, interests, career
 * goal) it scores every approved Opportunity and returns the best matches.
 *
 * By default this runs as a transparent rule-based scorer, so the
 * prototype works end-to-end with zero external dependencies or paid
 * API keys. If OPENAI_API_KEY is set in the environment, it is used only
 * to *enrich* the top matches with a short natural-language explanation
 * (the SRS's Software Interfaces section names "OpenAI API (or an
 * equivalent AI service)" — the scoring logic itself intentionally stays
 * deterministic and inspectable, which also satisfies NFR: Safety ->
 * "AI-generated recommendations shall be presented as guidance").
 */

function normalize(str) {
  return String(str || "").toLowerCase().trim();
}

function scoreOpportunity(profile, opportunity) {
  const skills = (profile.skills || []).map(normalize);
  const interests = (profile.interests || []).map(normalize);
  const goal = normalize(profile.careerGoal);
  const tags = (opportunity.tags || []).map(normalize);
  const field = normalize(opportunity.fieldOfStudy);
  const title = normalize(opportunity.title);
  const desc = normalize(opportunity.description);

  let score = 0;
  const matchedOn = [];

  for (const s of skills) {
    if (!s) continue;
    if (tags.includes(s) || field.includes(s) || title.includes(s) || desc.includes(s)) {
      score += 3;
      matchedOn.push(s);
    }
  }
  for (const i of interests) {
    if (!i) continue;
    if (tags.includes(i) || field.includes(i) || title.includes(i) || desc.includes(i)) {
      score += 2;
      matchedOn.push(i);
    }
  }
  if (goal && (title.includes(goal) || desc.includes(goal) || field.includes(goal))) {
    score += 4;
    matchedOn.push(goal);
  }

  // Small recency/urgency boost for opportunities with an upcoming deadline,
  // so time-sensitive opportunities aren't buried (supports the Problem
  // Statement's "opportunities go unnoticed or missed due to late
  // submission" concern from the SRS).
  if (opportunity.deadline) {
    const days = (new Date(opportunity.deadline) - new Date()) / (1000 * 60 * 60 * 24);
    if (days > 0 && days <= 30) score += 1;
  }

  return { score, matchedOn: [...new Set(matchedOn)] };
}

/**
 * Returns the top N scored opportunities for a profile.
 * opportunities: array of Opportunity model instances (or plain objects)
 */
function recommend(profile, opportunities, limit = 10) {
  const scored = opportunities
    .map((o) => {
      const { score, matchedOn } = scoreOpportunity(profile, o);
      return { opportunity: o, score, matchedOn };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return scored.map((r) => ({
    ...r,
    reason: buildReason(r),
  }));
}

function buildReason({ opportunity, matchedOn }) {
  if (matchedOn.length === 0) {
    return `Recommended based on overall fit with your profile.`;
  }
  return `Matches your profile on: ${matchedOn.join(", ")}.`;
}

/**
 * FR4.2 Skill Gap Analysis: compares the student's current skills against
 * the union of skills/tags requested by opportunities aligned with their
 * career goal, and returns the ones they don't have yet.
 */
function skillGapAnalysis(profile, opportunities) {
  const have = new Set((profile.skills || []).map(normalize));
  const goal = normalize(profile.careerGoal);

  const relevant = opportunities.filter((o) => {
    const field = normalize(o.fieldOfStudy);
    const title = normalize(o.title);
    return goal && (field.includes(goal) || title.includes(goal) || (o.tags || []).map(normalize).includes(goal));
  });

  const requested = new Set();
  for (const o of relevant.length ? relevant : opportunities) {
    for (const t of o.tags || []) {
      const n = normalize(t);
      if (n) requested.add(n);
    }
  }

  const gaps = [...requested].filter((t) => !have.has(t));
  return gaps.slice(0, 8);
}

/**
 * FR4.3 Learning Roadmap: turns the skill gaps into an ordered, simple
 * roadmap of learning steps. Deterministic, so it needs no external AI
 * service — but reads naturally as a generated roadmap.
 */
function buildLearningRoadmap(profile, gaps) {
  if (!gaps.length) {
    return [
      `Your profile already covers the core skills we see requested for "${profile.careerGoal || "your career goal"}". Consider exploring advanced or specialized opportunities next.`,
    ];
  }
  return gaps.map(
    (skill, i) =>
      `Step ${i + 1}: Build foundational knowledge in "${skill}" — look for a beginner-friendly course, then apply it in a small project before applying to related opportunities.`
  );
}

/**
 * Optional OpenAI enrichment. Safe no-op if OPENAI_API_KEY isn't set.
 */
async function enrichWithAI(profile, recommendations) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || !recommendations.length) return recommendations;

  try {
    const prompt = `A student with skills [${(profile.skills || []).join(", ")}], interests [${(
      profile.interests || []
    ).join(", ")}], and career goal "${profile.careerGoal || "unspecified"}" was matched to these opportunities: ${recommendations
      .map((r, i) => `${i + 1}. ${r.opportunity.title} (${r.opportunity.category})`)
      .join("; ")}. In one short sentence per item, explain *why* each is a good fit. Reply as a numbered list only.`;

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.4,
      }),
    });
    if (!res.ok) return recommendations;
    const data = await res.json();
    const text = data.choices?.[0]?.message?.content || "";
    const lines = text.split(/\n+/).filter(Boolean);
    return recommendations.map((r, i) => ({ ...r, reason: lines[i]?.replace(/^\d+\.\s*/, "") || r.reason }));
  } catch (err) {
    // Fail open: recommendations still work without the AI enrichment.
    return recommendations;
  }
}

module.exports = { recommend, skillGapAnalysis, buildLearningRoadmap, enrichWithAI, scoreOpportunity };
