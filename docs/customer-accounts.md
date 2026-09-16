# Customer accounts and teams

The starter renders a complete example account portal while `@ominity/next/customer-accounts` owns state, permissions, request cancellation, active-account isolation, and API behavior.

## Included examples

- switching between every customer account the user can access
- active customer details with permission-aware editing
- customer address list, creation, editing, and deletion
- team member list, role assignment, and removal
- email invitations for existing and new users, plus revocation
- normal login or registration followed by authenticated invitation acceptance
- assignable channel roles and translated permission metadata
- orders, invoices with PDF download, payments, subscriptions, mandates, and customer groups
- subscription cancellation when the user has `commerce.subscriptions.manage`

The account page imports the SDK model names exposed by the package. It does not define alternate customer, order, payment, or subscription wire types.

## Shared provider

`src/components/providers.tsx` places `OminityCustomerAccountsProvider` inside `OminityAuthProvider`. The provider loads memberships after auth becomes ready, validates the selected account on the server, and reloads account-bound data after a switch. It also loads team resources only when the active membership has `commerce.users.view`.

## One server route

`src/app/api/customer-accounts/[[...path]]/route.ts` exports the package catch-all factory. It covers account context and switching, team members, invitations, roles, permission metadata, customer details, addresses, groups, mandates, payments, orders, invoices, and subscriptions.

The active customer is stored in an HttpOnly cookie. The browser never sends a customer ID for resource operations, so switching cannot leak data returned for a previously active account. The backend authorizes every operation again with the authenticated user's access token.

## Permissions

The UI uses `CUSTOMER_PERMISSIONS`, `accounts.can(...)`, and `useOminityCustomerQuery({ permission })` to hide or disable unavailable actions. These checks improve the interface; Ominity remains the authorization boundary. Owners inherit all customer permissions. Roles are the source of truth for other members.

The channel controls which roles are assignable. An empty channel role selection means every assignable role. There is no channel list of enabled permission keys, and customer permission registration remains separate from admin permissions.

## Invitations

Creating a customer user always creates an invitation using an email address. Ominity chooses the existing-user or new-account email template. The localized accept URL opens `account/invitations/{token}`.

The public inspection operation shows the account, role, expiry, and whether registration is required. Acceptance always needs a valid user session whose email matches the invitation. The starter uses the normal `/api/auth/login` or `/api/auth/register` endpoint first; it has no invitation-specific signup endpoint.

## Removing parts

Each branded section lives in a separate file under `src/components/account`. A project can remove resource cards, address management, team management, security activity, or the header switcher without replacing package behavior. To remove the entire capability, set `OMINITY_FEATURE_CUSTOMER_ACCOUNTS=false` and delete the customer account route, provider wrapper, invitation pages, and account components.
