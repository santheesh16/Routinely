import { verifyToken } from '@clerk/clerk-sdk-node';

// Middleware to verify authentication and extract user ID
export const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.substring(7);

    // Verify the JWT token using Clerk
    // verifyToken will automatically read CLERK_JWT_KEY from environment if set
    // If CLERK_JWT_KEY is not set, it will try to fetch JWK from Clerk's servers
    const decodedToken = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY,
    });

    // Extract user ID from token (Clerk uses 'sub' as the user ID field in JWT)
    const userId = decodedToken?.sub || decodedToken?.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Invalid token: no user ID found' });
    }

    // Attach user info to request
    req.auth = { userId };
    req.clerkUserId = userId;
    next();
  } catch (error) {
    console.error('Auth error:', error);

    // Provide helpful error message for JWT key issues
    if (error.reason === 'jwk-failed-to-resolve' || error.message?.includes('JWK')) {
      console.error('JWT Key Error: You may need to set CLERK_JWT_KEY in your environment variables.');
      console.error('Alternatively, ensure the frontend is sending a JWT token (not a session token).');
    }

    return res.status(401).json({
      error: 'Authentication failed',
      details: error.message || 'Invalid or expired token'
    });
  }
};