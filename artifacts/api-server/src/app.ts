import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import cookieParser from "cookie-parser";
import session from "express-session";
import passport from "passport";
import connectPg from "connect-pg-simple";
import * as client from "openid-client";
import { Strategy, type VerifyFunction } from "openid-client/passport";
import memoize from "memoizee";
import router from "./routes";
import { logger } from "./lib/logger";
import { db } from "@workspace/db";
import { users } from "@workspace/db/schema";

const app: Express = express();

app.set("trust proxy", 1);

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const sessionTtl = 7 * 24 * 60 * 60 * 1000;
const PgStore = connectPg(session);
const sessionStore = new PgStore({
  conString: process.env.DATABASE_URL,
  createTableIfMissing: false,
  ttl: sessionTtl / 1000,
  tableName: "sessions",
});

app.use(
  session({
    secret: process.env.SESSION_SECRET ?? "ghostmap-dev-secret-change-in-production",
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: sessionTtl,
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

const getOidcConfig = memoize(
  async () => {
    return await client.discovery(
      new URL(process.env.ISSUER_URL ?? "https://replit.com/oidc"),
      process.env.REPL_ID!
    );
  },
  { maxAge: 3600 * 1000 }
);

function updateUserSession(
  user: Record<string, unknown>,
  tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers
) {
  user["claims"] = tokens.claims();
  user["access_token"] = tokens.access_token;
  user["refresh_token"] = tokens.refresh_token;
  user["expires_at"] = (user["claims"] as Record<string, unknown>)?.["exp"];
}

async function upsertReplitUser(claims: Record<string, unknown>) {
  const userId = claims["sub"] as string;
  const userName = (claims["first_name"] as string | undefined) ?? (claims["name"] as string | undefined) ?? null;
  const userEmail = (claims["email"] as string | undefined) ?? null;
  try {
    await db.insert(users).values({ id: userId, name: userName, email: userEmail })
      .onConflictDoUpdate({ target: users.id, set: { name: userName, email: userEmail } });
  } catch {
    // best-effort
  }
}

const registeredStrategies = new Set<string>();

function ensureStrategy(domain: string) {
  const strategyName = `replitauth:${domain}`;
  if (!registeredStrategies.has(strategyName)) {
    getOidcConfig().then((config) => {
      const verify: VerifyFunction = async (tokens, verified) => {
        const user: Record<string, unknown> = {};
        updateUserSession(user, tokens);
        await upsertReplitUser(tokens.claims() as unknown as Record<string, unknown>);
        verified(null, user as Express.User);
      };

      const strategy = new Strategy(
        {
          name: strategyName,
          config,
          scope: "openid email profile offline_access",
          callbackURL: `https://${domain}/api/callback`,
        },
        verify
      );
      passport.use(strategy);
      registeredStrategies.add(strategyName);
    }).catch(logger.error);
  }
}

passport.serializeUser((user, cb) => cb(null, user));
passport.deserializeUser((user: Express.User, cb) => cb(null, user));

app.get("/api/login", (req, res, next) => {
  ensureStrategy(req.hostname);
  const strategyName = `replitauth:${req.hostname}`;
  if (!registeredStrategies.has(strategyName)) {
    setTimeout(() => {
      passport.authenticate(strategyName, {
        prompt: "login consent",
        scope: ["openid", "email", "profile", "offline_access"],
      })(req, res, next);
    }, 500);
    return;
  }
  passport.authenticate(strategyName, {
    prompt: "login consent",
    scope: ["openid", "email", "profile", "offline_access"],
  })(req, res, next);
});

app.get("/api/callback", (req, res, next) => {
  const strategyName = `replitauth:${req.hostname}`;
  passport.authenticate(strategyName, {
    successReturnToOrRedirect: "/",
    failureRedirect: "/api/login",
  })(req, res, next);
});

app.get("/api/logout", async (req, res) => {
  req.logout(() => {});
  try {
    const config = await getOidcConfig();
    res.redirect(
      client.buildEndSessionUrl(config, {
        client_id: process.env.REPL_ID!,
        post_logout_redirect_uri: `${req.protocol}://${req.hostname}`,
      }).href
    );
  } catch {
    res.redirect("/");
  }
});

app.use("/api", router);

export default app;
