const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { onSchedule } = require("firebase-functions/v2/scheduler");
const admin = require("firebase-admin");

admin.initializeApp();
const db = admin.firestore();

function sanitizeReason(value) {
  return String(value || "").replace(/\s+/g, " ").trim().slice(0, 240);
}

function getDurationExpirationIso(durationUnit, durationValue, isPermanent = false) {
  if (isPermanent) return "";
  const value = Math.max(1, Number(durationValue) || 1);
  const now = new Date();
  const next = new Date(now.getTime());
  if (durationUnit === "weeks") next.setDate(next.getDate() + value * 7);
  else if (durationUnit === "months") next.setMonth(next.getMonth() + value);
  else next.setDate(next.getDate() + value);
  return next.toISOString();
}

function getNextPermabanReviewIso() {
  const reviewDate = new Date();
  reviewDate.setFullYear(reviewDate.getFullYear() + 3);
  return reviewDate.toISOString();
}

async function isAdminEmail(email) {
  if (!email) return false;
  const snapshot = await db.collection("app-config").doc("admin").get();
  if (!snapshot.exists) return false;
  const enabledEmails = Array.isArray(snapshot.data().enabledEmails) ? snapshot.data().enabledEmails : [];
  return enabledEmails.includes(String(email || "").toLowerCase());
}

async function appendModerationLog(entry) {
  await db.collection("moderation-log").add({
    ...entry,
    createdAtServer: admin.firestore.FieldValue.serverTimestamp(),
  });
}

exports.applyModerationAction = onCall(async (request) => {
  const actorUid = request.auth?.uid || "";
  const actorEmail = String(request.auth?.token?.email || "").toLowerCase();
  if (!actorUid || !actorEmail) {
    throw new HttpsError("unauthenticated", "Authentication required");
  }

  const adminAuthorized = await isAdminEmail(actorEmail);
  if (!adminAuthorized) {
    throw new HttpsError("permission-denied", "Admin rights required");
  }

  const targetUserId = String(request.data?.targetUserId || "").trim();
  const targetEmail = String(request.data?.targetEmail || "").trim().toLowerCase();
  const sanctionType = String(request.data?.sanctionType || "timeout").toLowerCase();
  const durationUnit = String(request.data?.durationUnit || "days").toLowerCase();
  const durationValue = Number(request.data?.durationValue || 1);
  const offlineProfileNow = request.data?.offlineProfileNow === true;
  const reason = sanitizeReason(request.data?.reason || "No reason provided.");

  if (!targetUserId) {
    throw new HttpsError("invalid-argument", "targetUserId is required");
  }
  if (!reason || reason.length < 4) {
    throw new HttpsError("invalid-argument", "A short reason is required");
  }

  const moderationRef = db.collection("user-moderation").doc(targetUserId);
  const moderationSnap = await moderationRef.get();
  const prev = moderationSnap.exists ? moderationSnap.data() : {};
  const prevStrikeCount = Number(prev.strikeCount || 0);
  const prevBanCount = Number(prev.banCount || 0);

  const nextStrikeCount = prevStrikeCount + 1;
  const nextBanCount = sanctionType === "ban" ? prevBanCount + 1 : prevBanCount;
  const escalationToPermaban = nextBanCount >= 3;
  const nextState = escalationToPermaban ? "permaban" : sanctionType;
  const expiresAt = escalationToPermaban ? "" : getDurationExpirationIso(durationUnit, durationValue, durationUnit === "permanent");
  const permabanReviewAt = escalationToPermaban ? getNextPermabanReviewIso() : String(prev.permabanReviewAt || "");
  const profileOffline = escalationToPermaban || offlineProfileNow;

  const nowIso = new Date().toISOString();
  const notificationMessage = escalationToPermaban
    ? `Your account has been placed on permanent social restriction after repeated bans. Reason: ${reason}.`
    : `Admin moderation applied: ${nextState}. Reason: ${reason}.`;

  await moderationRef.set(
    {
      uid: targetUserId,
      targetEmail,
      state: nextState,
      sanctionType,
      reason,
      startedAt: nowIso,
      expiresAt,
      actorId: actorUid,
      actorEmail,
      strikeCount: nextStrikeCount,
      banCount: nextBanCount,
      publishBlocked: true,
      profileOffline,
      socialIsolation: escalationToPermaban,
      familyReadOnly: escalationToPermaban,
      permabanReviewAt,
      latestNotification: {
        id: `moderation-${Date.now()}`,
        title: escalationToPermaban ? "Permanent account restriction" : "Account moderation update",
        message: notificationMessage,
        createdAt: nowIso,
      },
      updatedAt: nowIso,
    },
    { merge: true }
  );

  if (profileOffline) {
    await db.collection("users").doc(targetUserId).set(
      {
        isPublic: false,
        displayName: "",
        country: "",
        bio: "",
        moderationProfileClearedAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
  }

  await appendModerationLog({
    action: "account-moderation-applied",
    actorId: actorUid,
    actorEmail,
    targetUserId,
    targetEmail,
    reason,
    details: {
      sanctionType,
      state: nextState,
      expiresAt,
      strikeCount: nextStrikeCount,
      banCount: nextBanCount,
      profileOffline,
      socialIsolation: escalationToPermaban,
      permabanReviewAt,
    },
    createdAt: nowIso,
    appView: "cloud-function",
  });

  return {
    ok: true,
    targetUserId,
    state: nextState,
    strikeCount: nextStrikeCount,
    banCount: nextBanCount,
    permabanReviewAt,
  };
});

exports.clearModerationAction = onCall(async (request) => {
  const actorUid = request.auth?.uid || "";
  const actorEmail = String(request.auth?.token?.email || "").toLowerCase();
  if (!actorUid || !actorEmail) {
    throw new HttpsError("unauthenticated", "Authentication required");
  }

  const adminAuthorized = await isAdminEmail(actorEmail);
  if (!adminAuthorized) {
    throw new HttpsError("permission-denied", "Admin rights required");
  }

  const targetUserId = String(request.data?.targetUserId || "").trim();
  const reason = sanitizeReason(request.data?.reason || "Admin cleared moderation state.");
  if (!targetUserId) {
    throw new HttpsError("invalid-argument", "targetUserId is required");
  }

  const moderationRef = db.collection("user-moderation").doc(targetUserId);
  const moderationSnap = await moderationRef.get();
  const prev = moderationSnap.exists ? moderationSnap.data() : {};
  const nowIso = new Date().toISOString();

  await moderationRef.set(
    {
      uid: targetUserId,
      state: "clear",
      sanctionType: "",
      reason,
      startedAt: "",
      expiresAt: "",
      actorId: actorUid,
      actorEmail,
      strikeCount: Number(prev.strikeCount || 0),
      banCount: Number(prev.banCount || 0),
      publishBlocked: false,
      profileOffline: false,
      socialIsolation: false,
      familyReadOnly: false,
      latestNotification: {
        id: `moderation-${Date.now()}`,
        title: "Moderation updated",
        message: `Your account restriction was cleared by an admin. Reason: ${reason}`,
        createdAt: nowIso,
      },
      updatedAt: nowIso,
    },
    { merge: true }
  );

  await appendModerationLog({
    action: "account-moderation-cleared",
    actorId: actorUid,
    actorEmail,
    targetUserId,
    reason,
    details: {
      previousState: String(prev.state || "clear"),
    },
    createdAt: nowIso,
    appView: "cloud-function",
  });

  return { ok: true, targetUserId, state: "clear" };
});

exports.reviewPermabans = onSchedule("every day 03:00", async () => {
  const now = new Date();
  const nowIso = now.toISOString();
  const snapshot = await db.collection("user-moderation").where("state", "==", "permaban").get();

  let dueCount = 0;
  for (const doc of snapshot.docs) {
    const data = doc.data() || {};
    const reviewAtMs = new Date(String(data.permabanReviewAt || 0)).getTime();
    if (!Number.isFinite(reviewAtMs) || reviewAtMs > now.getTime()) continue;
    dueCount += 1;
    await db.collection("moderation-log").add({
      action: "permaban-review-due",
      actorId: "system",
      actorEmail: "system",
      targetUserId: doc.id,
      targetEmail: String(data.targetEmail || ""),
      reason: "Three-year permaban review checkpoint reached.",
      details: {
        permabanReviewAt: String(data.permabanReviewAt || ""),
      },
      createdAt: nowIso,
      createdAtServer: admin.firestore.FieldValue.serverTimestamp(),
      appView: "cloud-function",
    });
  }

  return null;
});
