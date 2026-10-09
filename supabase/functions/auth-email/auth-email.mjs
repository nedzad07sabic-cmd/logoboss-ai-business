const SITE = "https://logobossweb-ai.eu";
const AUTH = "https://ppmefffjhqpmrjnlewoq.supabase.co";
const FROM = "LogoBoss AI <account@logobossweb-ai.eu>";
const REPLY_TO = "info.logobossai@gmail.com";
const DOMAIN_ID = "16de0449-3e10-453c-8d43-26934a3f936a";
const ALLOWED_PATHS = new Set(["/", "/index.html", "/admin.html"]);
const COPY = {
  signup: ["E-Mail bestätigen / Confirm email", "Bestätige deine E-Mail-Adresse für dein LogoBoss AI Konto.", "Confirm your email address for your LogoBoss AI account.", "E-Mail bestätigen / Confirm email"],
  recovery: ["Passwort zurücksetzen / Reset password", "Setze dein Passwort für LogoBoss AI zurück.", "Reset your LogoBoss AI password.", "Passwort zurücksetzen / Reset password"],
  magiclink: ["Bei LogoBoss AI anmelden / Sign in", "Melde dich sicher bei deinem LogoBoss AI Konto an.", "Sign in securely to your LogoBoss AI account.", "Anmelden / Sign in"],
  invite: ["Einladung zu LogoBoss AI / Invitation", "Du wurdest zu LogoBoss AI eingeladen.", "You have been invited to LogoBoss AI.", "Einladung annehmen / Accept invitation"],
  email_change: ["E-Mail-Änderung bestätigen / Confirm email change", "Bestätige die Änderung deiner E-Mail-Adresse bei LogoBoss AI.", "Confirm the change to your LogoBoss AI email address.", "Änderung bestätigen / Confirm change"],
  reauthentication: ["LogoBoss AI Sicherheitscode / Security code", "Verwende diesen Sicherheitscode, um deine Aktion zu bestätigen.", "Use this security code to confirm your action.", ""]
};
const esc = (value) => String(value).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const validEmail = (value) => typeof value === "string" && value.length <= 254 && /^[^\s<>@,;]+@[^\s<>@,;]+\.[^\s<>@,;]+$/.test(value);

function redirectURL(value) {
  if (!value) return SITE + "/";
  const url = new URL(value);
  if (url.origin !== SITE || url.username || url.password || !ALLOWED_PATHS.has(url.pathname) || url.search || url.hash) {
    throw new Error("Invalid callback");
  }
  return url.href;
}

function verifyURL(hash, action, redirect) {
  if (typeof hash !== "string" || !/^[a-zA-Z0-9_-]{20,256}$/.test(hash)) throw new Error("Missing verification token");
  const url = new URL(AUTH + "/auth/v1/verify");
  url.searchParams.set("token", hash);
  url.searchParams.set("type", action);
  url.searchParams.set("redirect_to", redirect);
  return url.href;
}

function renderEmail(copy, link, code) {
  const action = link
    ? '<tr><td bgcolor="#1479ec" style="background-color:#1479ec;border-radius:10px;text-align:center;"><a href="' + esc(link) + '" style="display:block;padding-top:16px;padding-bottom:16px;padding-left:20px;padding-right:20px;color:#ffffff;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:24px;font-weight:bold;text-decoration:none;">' + esc(copy[3]) + '</a></td></tr>'
    : '<tr><td style="text-align:center;font-family:Consolas,monospace;font-size:32px;line-height:48px;letter-spacing:6px;color:#36daf6;">' + esc(code) + '</td></tr>';
  const fallback = link ? '<p style="font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:20px;color:#b3bdd4;overflow-wrap:anywhere;">Link: <a href="' + esc(link) + '" style="color:#66dff7;text-decoration:underline;">' + esc(link) + '</a></p>' : "";
  return '<!DOCTYPE html><html lang="de"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><meta http-equiv="X-UA-Compatible" content="IE=edge"><title>' + esc(copy[0]) + '</title></head><body style="margin-top:0;margin-bottom:0;margin-left:0;margin-right:0;background-color:#050922;">'
    + '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td align="center" bgcolor="#050922" style="padding-top:32px;padding-bottom:32px;padding-left:16px;padding-right:16px;background-color:#050922;">'
    + '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;"><tr><td bgcolor="#101731" style="padding-top:28px;padding-bottom:28px;padding-left:24px;padding-right:24px;background-color:#101731;border-radius:16px;border-top:4px solid #8454f7;">'
    + '<img src="' + SITE + '/icon-192.png" width="56" height="56" border="0" alt="LogoBoss AI" style="display:block;"><p style="font-family:Arial,Helvetica,sans-serif;font-size:22px;line-height:30px;font-weight:bold;color:#ffffff;">Logo<span style="color:#38d4ef;">Boss</span> <span style="color:#ab85ff;">AI</span></p>'
    + '<h1 style="font-family:Arial,Helvetica,sans-serif;font-size:22px;line-height:30px;color:#ffffff;">' + esc(copy[0]) + '</h1>'
    + '<p style="font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:26px;color:#e2e8f7;">' + esc(copy[1]) + '</p>'
    + '<p lang="en" style="font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:26px;color:#c3cee4;">' + esc(copy[2]) + '</p>'
    + '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">' + action + '</table>'
    + '<p style="font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:22px;color:#b3bdd4;">Falls du dies nicht angefordert hast, ignoriere diese E-Mail. / If you did not request this, ignore this email.</p>' + fallback
    + '<p style="font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:20px;color:#b3bdd4;">Hilfe / Help: <a href="mailto:' + REPLY_TO + '" style="color:#66dff7;">' + REPLY_TO + '</a></p>'
    + '</td></tr></table></td></tr></table></body></html>';
}

export function buildMessages(payload) {
  const user = payload?.user;
  const data = payload?.email_data;
  if (!user || !data || !validEmail(user.email)) throw new Error("Invalid auth email");
  const action = data.email_action_type;
  const copy = Object.prototype.hasOwnProperty.call(COPY, action) ? COPY[action] : null;
  if (!copy) throw new Error("Unsupported auth action");
  const redirect = redirectURL(data.redirect_to);
  let destinations;
  if (action === "email_change") {
    if (!validEmail(user.new_email)) throw new Error("Missing new email");
    // Supabase's field names are reversed: token_hash_new belongs to the current email.
    destinations = data.token_hash_new
      ? [[user.email, data.token_hash_new], [user.new_email, data.token_hash]]
      : [[user.new_email, data.token_hash]];
  } else {
    destinations = [[user.email, data.token_hash]];
  }
  return destinations.map(([recipient, hash]) => {
    const code = action === "reauthentication" ? data.token : "";
    if (action === "reauthentication" && !/^\d{6,10}$/.test(code || "")) throw new Error("Missing security code");
    const link = action === "reauthentication" ? "" : verifyURL(hash, action, redirect);
    return {
      tokenIdentity: action === "reauthentication" ? code : hash,
      action,
      email: {
        from: FROM, to: [recipient], reply_to: REPLY_TO, subject: copy[0],
        text: [copy[1], copy[2], link || code, "Falls du dies nicht angefordert hast, ignoriere diese E-Mail. / If you did not request this, ignore this email.", "Hilfe / Help: " + REPLY_TO].join("\n\n"),
        html: renderEmail(copy, link, code)
      }
    };
  });
}

export async function idempotencyKey(message) {
  const bytes = new TextEncoder().encode(JSON.stringify([message.action, message.email.to[0], message.tokenIdentity]));
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return "lb-auth-" + Array.from(new Uint8Array(digest), x => x.toString(16).padStart(2, "0")).join("");
}

function response(status, message) {
  return new Response(JSON.stringify(message ? {error:{http_code:status,message}} : {}), {
    status, headers: {"Content-Type":"application/json","Cache-Control":"no-store"}
  });
}

export function createHandler({verify, apiKey, fetcher = fetch}) {
  return async (req) => {
    if (req.method !== "POST") return response(405, "Method not allowed");
    if (!apiKey?.startsWith("re_") || !verify) return response(503, "Email service is not configured");
    if (Number(req.headers.get("content-length") || 0) > 65536) return response(413, "Payload too large");
    const body = await req.text();
    if (new TextEncoder().encode(body).length > 65536) return response(413, "Payload too large");
    let payload;
    try { payload = verify(body, Object.fromEntries(req.headers)); }
    catch { return response(401, "Invalid webhook signature"); }
    const path = new URL(req.url).pathname;
    // Signed sender validation reads only the fixed sending-domain record. It never sends email.
    if (path.endsWith("/auth-email/health")) {
      if (payload?.check !== "sender") return response(400, "Invalid sender check");
      try {
        const check = await fetcher("https://api.resend.com/domains/" + DOMAIN_ID, {
          headers: {Authorization:"Bearer " + apiKey}, signal:AbortSignal.timeout(4000)
        });
        const domain = check.ok ? await check.json() : null;
        if (domain?.id !== DOMAIN_ID || domain?.name !== "logobossweb-ai.eu" || domain?.status !== "verified" || domain?.capabilities?.sending !== "enabled") {
          return response(503, "Sender validation could not be completed");
        }
        return new Response(JSON.stringify({ready:true}), {status:200,headers:{"Content-Type":"application/json","Cache-Control":"no-store"}});
      } catch { return response(503, "Sender validation could not be completed"); }
    }
    if (!path.endsWith("/auth-email")) return response(404, "Not found");
    let messages;
    try { messages = buildMessages(payload); }
    catch { return response(400, "Invalid authentication email"); }
    try {
      await Promise.all(messages.map(async (message) => {
        const sent = await fetcher("https://api.resend.com/emails", {
          method:"POST",
          headers:{Authorization:"Bearer " + apiKey,"Content-Type":"application/json","Idempotency-Key":await idempotencyKey(message)},
          body:JSON.stringify(message.email), signal:AbortSignal.timeout(4000)
        });
        const result = sent.ok ? await sent.json() : null;
        if (!result?.id) throw new Error("Send failed");
      }));
    } catch { return response(503, "Authentication email could not be sent. Please try again."); }
    return response(200);
  };
}
