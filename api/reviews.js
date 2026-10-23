// Vercel serverless endpoint. Reads reviews only from the verified Google Business Profile.
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_REVIEWS_BASE = "https://mybusiness.googleapis.com/v4/";

module.exports = async function handler(req, res) {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("X-Content-Type-Options", "nosniff");
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "method_not_allowed" });
  }

  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_OAUTH_REFRESH_TOKEN;
  const locationResource = (process.env.GOOGLE_BUSINESS_LOCATION_RESOURCE || "").replace(/^\/+|\/+$/g, "");

  if (!clientId || !clientSecret || !refreshToken || !/^accounts\/[^/]+\/locations\/[^/]+$/.test(locationResource)) {
    res.setHeader("Cache-Control", "no-store");
    return res.status(503).json({ error: "google_business_profile_not_configured" });
  }

  try {
    const tokenResponse = await fetch(GOOGLE_TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: "refresh_token"
      })
    });

    if (!tokenResponse.ok) {
      console.error("Google OAuth token refresh failed:", tokenResponse.status);
      res.setHeader("Cache-Control", "no-store");
      return res.status(502).json({ error: "google_auth_failed" });
    }

    const tokenData = await tokenResponse.json();
    if (!tokenData.access_token) {
      res.setHeader("Cache-Control", "no-store");
      return res.status(502).json({ error: "google_auth_failed" });
    }

    const collected = [];
    let pageToken = "";
    let pageCount = 0;
    let totalReviewCount = 0;
    let averageRating = null;

    do {
      const url = new URL(
        GOOGLE_REVIEWS_BASE + locationResource + "/reviews"
      );
      url.searchParams.set("pageSize", "50");
      url.searchParams.set("orderBy", "updateTime desc");
      if (pageToken) url.searchParams.set("pageToken", pageToken);

      const response = await fetch(url, {
        headers: { Authorization: "Bearer " + tokenData.access_token }
      });

      if (!response.ok) {
        console.error("Google Business Profile reviews request failed:", response.status);
        res.setHeader("Cache-Control", "no-store");
        return res.status(502).json({ error: "google_reviews_unavailable" });
      }

      const data = await response.json();
      if (pageCount === 0) {
        totalReviewCount = Number(data.totalReviewCount || 0);
        averageRating = typeof data.averageRating === "number" ? data.averageRating : null;
      }
      collected.push(...(Array.isArray(data.reviews) ? data.reviews : []));
      pageToken = data.nextPageToken || "";
      pageCount += 1;
    } while (pageToken && pageCount < 20);

    // Keep only genuine five-star reviews that include the customer's written comment.
    // Review text and reviewer names are returned without rewriting them.
    const reviews = collected
      .filter((review) =>
        review.starRating === "FIVE" &&
        typeof review.comment === "string" &&
        review.comment.trim().length > 0
      )
      .sort((a, b) => Date.parse(b.createTime || b.updateTime || 0) - Date.parse(a.createTime || a.updateTime || 0))
      .map((review) => ({
        id: review.reviewId || review.name || (review.reviewer && review.reviewer.displayName) || "google-review",
        authorName: (review.reviewer && review.reviewer.displayName) || "Usuario de Google",
        comment: review.comment,
        createTime: review.createTime || null,
        updateTime: review.updateTime || null,
        rating: 5
      }));

    // The edge cache is short-lived so new reviews are reflected automatically.
    res.setHeader("Cache-Control", "public, max-age=0, s-maxage=900, stale-while-revalidate=1800");
    return res.status(200).json({
      averageRating,
      totalReviewCount,
      reviews,
      source: "Google Business Profile"
    });
  } catch (error) {
    console.error("Google reviews endpoint error:", error && error.message ? error.message : "unknown error");
    res.setHeader("Cache-Control", "no-store");
    return res.status(502).json({ error: "google_reviews_unavailable" });
  }
};
