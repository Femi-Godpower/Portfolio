# Auth

The starter keeps credentials and access tokens behind same-origin route handlers while `@ominity/next` owns auth state and request behavior.

## Included flows

- password login and normal user registration
- encrypted, HttpOnly auth session cookies and refresh
- password reset request and completion pages
- MFA verification through TOTP, email, SMS, or recovery code
- enabled social-provider discovery and OAuth callback completion
- current-user login activity, including successful password, registration, and linked social-provider sign-ins
- customer invitation authentication through the normal login and registration endpoints

The branded pages live in `src/components/auth`. Server routes remain thin calls to the factories exported by `@ominity/next/auth/server`.

## Routes

| Method | Route | Purpose |
|---|---|---|
| `POST` | `/api/auth/login` | Password sign-in |
| `POST` | `/api/auth/register` | Normal user registration |
| `POST` | `/api/auth/logout` | Clear the session |
| `GET` | `/api/auth/me` | Restore the browser session |
| `POST` | `/api/auth/refresh` | Refresh OAuth tokens in the encrypted session |
| `GET` | `/api/auth/social/*` | Provider discovery, OAuth start, and callback |
| `GET` | `/api/auth/login-activity/*` | Current-user activity list and detail |
| `GET/POST` | `/api/auth/mfa/*` | MFA methods, challenges, and verification |
| `POST` | `/api/auth/password/forgot` | Send a reset email |
| `POST` | `/api/auth/password/reset` | Complete a reset |

## MFA flow

1. The user signs in through the regular login endpoint.
2. `OminityAuthProvider` loads the available MFA methods.
3. A required challenge redirects to the existing MFA page with a safe `returnTo` path.
4. After verification, the user continues to the account or invitation page.

## Social login

The login page loads enabled providers from `/api/auth/social` and links to the package-owned start route. The callback exchanges its one-time code on the server, creates the encrypted user session, records login activity, and redirects to the localized account page. Provider identities must already be linked to an Ominity user; the application never links accounts by email automatically.

## Security boundary

The browser never receives the OAuth client secret, Ominity API key, user access token, or refresh token. Login activity routes derive the user ID and access token from the encrypted session. The `.env.example` session secret is a placeholder and must be replaced in production.

## Removing auth

Set `OMINITY_FEATURE_AUTH=false`, then remove `src/app/(auth)`, `src/components/auth`, the auth API routes, and the auth provider when the project does not need user accounts. Customer accounts depend on auth and are disabled automatically by the runtime config.
