import express from "express";
import jwt from "jsonwebtoken";

/** Define the session property on the request object */
declare global {
  namespace Express {
    interface Request {
      session: {
        accountId: string;
        userId: string;
        backToUrl: string | undefined;
        shortLivedToken: string | undefined;
      };
    }
  }
}

interface JwtPayload {
  accountId: string;
  userId: string;
  backToUrl?: string;
  shortLivedToken?: string;
}

export default async function authenticationMiddleware(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
): Promise<void> {
  try {
    const authorization = req.headers.authorization ?? (req.query?.token as string);

    if (typeof authorization !== "string") {
      res.status(401).json({ 
        error: "not authenticated, no credentials in request" 
      });
      return;
    }

    if (typeof process.env.MONDAY_SIGNING_SECRET !== "string") {
      res.status(500).json({ 
        error: "Missing MONDAY_SIGNING_SECRET (should be in .env file)" 
      });
      return;
    }

    const decoded = jwt.verify(
      authorization,
      process.env.MONDAY_SIGNING_SECRET
    ) as JwtPayload;

    const { accountId, userId, backToUrl, shortLivedToken } = decoded;

    if (!accountId || !userId) {
      res.status(401).json({ 
        error: "Invalid token: missing required fields" 
      });
      return;
    }

    req.session = { 
      accountId, 
      userId, 
      backToUrl, 
      shortLivedToken 
    };

    next();
  } catch (err) {
    console.error('Authentication error:', err);
    res.status(401).json({ 
      error: "authentication error, could not verify credentials",
      details: err instanceof Error ? err.message : 'Unknown error'
    });
  }
}