"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Route } from "next";
import type { Address } from "@ominity/api-typescript/models/commerce/address";

import { useCommerce } from "@/components/commerce/commerce-provider";
import {
  commerceOrderId,
  commerceCartItemId,
  commerceCartItemQuantity,
  commerceCartItemTitle,
  commerceCartItemTotalPrice,
} from "@ominity/next/commerce";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { formatMoney } from "@/lib/ominity/commerce";
import { emitCommerceEvent } from "@/lib/ominity/commerce/events";
import { useAuth } from "@/components/auth";

type CheckoutAddressDraft = {
  firstName: string;
  lastName: string;
  street: string;
  number: string;
  additional: string;
  city: string;
  postalCode: string;
  region: string;
  country: string;
  phone: string;
};

type CheckoutStep = 1 | 2 | 3;
type CheckoutMode = "guest" | "authenticated";

function normalizeCountryCodes(countries: ReadonlyArray<string>): ReadonlyArray<string> {
  return Array.from(new Set(countries
    .map((country) => country.trim().toUpperCase())
    .filter((country) => /^[A-Z]{2}$/.test(country))));
}

function resolveAddressCountry(
  country: string | undefined,
  countries: ReadonlyArray<string>,
): string {
  const normalized = country?.trim().toUpperCase();
  return normalized && countries.includes(normalized)
    ? normalized
    : countries[0] ?? "";
}

function createAddressDraft(country: string): CheckoutAddressDraft {
  return {
    firstName: "",
    lastName: "",
    street: "",
    number: "",
    additional: "",
    city: "",
    postalCode: "",
    region: "",
    country,
    phone: "",
  };
}

function isAddressComplete(
  address: CheckoutAddressDraft,
  countries: ReadonlyArray<string>,
): boolean {
  return address.firstName.trim().length >= 2
    && address.lastName.trim().length >= 2
    && address.street.trim().length >= 2
    && address.number.trim().length >= 1
    && address.city.trim().length >= 2
    && address.postalCode.trim().length >= 2
    && countries.includes(address.country.trim().toUpperCase());
}

function toOrderAddress(address: CheckoutAddressDraft): Address {
  return {
    firstName: address.firstName.trim(),
    lastName: address.lastName.trim(),
    street: address.street.trim(),
    number: address.number.trim(),
    additional: address.additional.trim(),
    city: address.city.trim(),
    postalCode: address.postalCode.trim(),
    region: address.region.trim(),
    country: address.country.trim().toUpperCase(),
  };
}

function addressHasEnteredDetails(address: CheckoutAddressDraft): boolean {
  return [
    address.firstName,
    address.lastName,
    address.street,
    address.number,
    address.additional,
    address.city,
    address.postalCode,
    address.region,
    address.phone,
  ].some((value) => value.trim().length > 0);
}

function CheckoutAddressFields(props: {
  readonly address: CheckoutAddressDraft;
  readonly countries: ReadonlyArray<string>;
  readonly idPrefix: string;
  readonly onChange: (address: CheckoutAddressDraft) => void;
}) {
  const update = (field: keyof CheckoutAddressDraft, value: string) => {
    props.onChange({ ...props.address, [field]: value });
  };

  return (
    <div className="space-y-3">
      <div className="grid gap-3 md:grid-cols-2">
        <Input
          value={props.address.firstName}
          onChange={(event) => update("firstName", event.target.value)}
          placeholder="First name"
          autoComplete={`${props.idPrefix} given-name`}
        />
        <Input
          value={props.address.lastName}
          onChange={(event) => update("lastName", event.target.value)}
          placeholder="Last name"
          autoComplete={`${props.idPrefix} family-name`}
        />
      </div>
      <div className="grid gap-3 md:grid-cols-[1fr_10rem]">
        <Input
          value={props.address.street}
          onChange={(event) => update("street", event.target.value)}
          placeholder="Street"
          autoComplete={`${props.idPrefix} address-line1`}
        />
        <Input
          value={props.address.number}
          onChange={(event) => update("number", event.target.value)}
          placeholder="House number"
        />
      </div>
      <Input
        value={props.address.additional}
        onChange={(event) => update("additional", event.target.value)}
        placeholder="Address addition (optional)"
        autoComplete={`${props.idPrefix} address-line2`}
      />
      <div className="grid gap-3 md:grid-cols-3">
        <Input
          value={props.address.postalCode}
          onChange={(event) => update("postalCode", event.target.value)}
          placeholder="Postal code"
          autoComplete={`${props.idPrefix} postal-code`}
        />
        <Input
          value={props.address.city}
          onChange={(event) => update("city", event.target.value)}
          placeholder="City"
          autoComplete={`${props.idPrefix} address-level2`}
        />
        <label className="grid gap-1">
          <span className="sr-only">Country</span>
          <select
            aria-label={`${props.idPrefix === "billing" ? "Billing" : "Shipping"} country`}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm text-foreground shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            value={props.address.country}
            disabled={props.countries.length === 0}
            autoComplete={`${props.idPrefix} country`}
            onChange={(event) => update("country", event.currentTarget.value)}
          >
            <option value="" disabled>
              {props.countries.length > 0 ? "Select country" : "No countries available"}
            </option>
            {props.countries.map((country) => (
              <option key={country} value={country}>{country}</option>
            ))}
          </select>
        </label>
      </div>
      <Input
        value={props.address.region}
        onChange={(event) => update("region", event.target.value)}
        placeholder="Region (optional)"
        autoComplete={`${props.idPrefix} address-level1`}
      />
      <Input
        value={props.address.phone}
        onChange={(event) => update("phone", event.target.value)}
        placeholder="Phone (optional)"
        autoComplete={`${props.idPrefix} tel`}
      />
    </div>
  );
}

function CheckoutAddressSummary(props: {
  readonly address: CheckoutAddressDraft;
}) {
  return (
    <div>
      <p className="font-medium">{props.address.firstName} {props.address.lastName}</p>
      <p>{props.address.street} {props.address.number}</p>
      {props.address.additional.trim().length > 0 && <p>{props.address.additional.trim()}</p>}
      <p>{props.address.postalCode} {props.address.city}</p>
      {props.address.region.trim().length > 0 && <p>{props.address.region.trim()}</p>}
      <p>{props.address.country}</p>
      {props.address.phone.trim().length > 0 && <p>{props.address.phone.trim()}</p>}
    </div>
  );
}

export interface CommerceCheckoutPageProps {
  readonly countries: ReadonlyArray<string>;
  readonly defaultCountry?: string;
  readonly paths: {
    readonly checkout: string;
    readonly cart: string;
    readonly payment: string;
    readonly login: string;
    readonly account: string;
  };
  readonly features: {
    readonly payment: boolean;
    readonly auth: boolean;
    readonly guestCheckout: boolean;
  };
}

export function CommerceCheckoutPage(props: CommerceCheckoutPageProps) {
  const router = useRouter();
  const commerce = useCommerce();
  const auth = useAuth();
  const countries = useMemo(() => normalizeCountryCodes(props.countries), [props.countries]);
  const initialCountry = resolveAddressCountry(props.defaultCountry, countries);

  const [step, setStep] = useState<CheckoutStep>(1);
  const [modeOverride, setMode] = useState<CheckoutMode | null>(null);
  const [email, setEmail] = useState("");
  const [selectedSavedAddressId, setSelectedSavedAddressId] = useState<string | "new">("new");
  const [billingAddress, setBillingAddress] = useState<CheckoutAddressDraft>(() => (
    createAddressDraft(initialCountry)
  ));
  const [separateShippingAddress, setSeparateShippingAddress] = useState(false);
  const [shippingAddress, setShippingAddress] = useState<CheckoutAddressDraft>(() => (
    createAddressDraft(initialCountry)
  ));
  const [notes, setNotes] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const hasEmittedCheckoutStarted = useRef(false);

  const hasSession = auth.session !== null;
  const checkoutBlockedByAuth = props.features.auth && !props.features.guestCheckout && !hasSession;
  const mode: CheckoutMode = modeOverride
    ?? (hasSession && props.features.auth ? "authenticated" : "guest");

  const cartCurrency = commerce.cartCurrency;

  const resolvedEmail = useMemo(() => {
    if (mode === "authenticated" && hasSession) {
      return auth.session?.email ?? email.trim();
    }
    return email.trim();
  }, [auth.session?.email, email, hasSession, mode]);

  useEffect(() => {
    if (!commerce.ready || !auth.ready || commerce.cart.length === 0 || hasEmittedCheckoutStarted.current) {
      return;
    }

    hasEmittedCheckoutStarted.current = true;
    emitCommerceEvent("checkout_started", {
      mode: hasSession ? "authenticated" : "guest",
      cartCount: commerce.cartCount,
      cartSubtotal: commerce.cartSubtotal,
      ...(commerce.cartCurrency ? { currency: commerce.cartCurrency } : {}),
      ...(commerce.promotionCodes.length > 0 ? { promotionCodes: commerce.promotionCodes } : {}),
    });
  }, [
    auth.ready,
    commerce.cart,
    commerce.cartCount,
    commerce.cartCurrency,
    commerce.cartSubtotal,
    commerce.promotionCodes,
    commerce.ready,
    hasSession,
  ]);

  if (!commerce.ready || !auth.ready) {
    return (
      <Card>
        <CardContent className="pt-6 text-sm text-muted-foreground">Loading checkout…</CardContent>
      </Card>
    );
  }

  if (checkoutBlockedByAuth) {
    const loginPath = `${props.paths.login}?returnTo=${encodeURIComponent(props.paths.checkout ?? "/checkout")}`;

    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Checkout requires sign in</CardTitle>
          <CardDescription>Guest checkout is disabled in this project configuration.</CardDescription>
        </CardHeader>
        <CardContent>
          <Link href={loginPath as Route} className="text-sm font-medium text-primary hover:underline">
            Login to continue
          </Link>
        </CardContent>
      </Card>
    );
  }

  if (commerce.cart.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Checkout</CardTitle>
          <CardDescription>Your cart is empty.</CardDescription>
        </CardHeader>
        <CardContent>
          <Link href={props.paths.cart as Route} className="text-sm font-medium text-primary hover:underline">
            Open cart
          </Link>
        </CardContent>
      </Card>
    );
  }

  const normalizedMode: CheckoutMode = hasSession && mode === "authenticated"
    ? "authenticated"
    : "guest";

  const applySavedAddress = (addressId: string) => {
    const selected = auth.savedAddresses.find((entry) => entry.id === addressId);
    if (!selected) {
      return;
    }

    setBillingAddress({
      firstName: selected.firstName,
      lastName: selected.lastName,
      street: selected.street,
      number: selected.number,
      additional: selected.additional,
      city: selected.city,
      postalCode: selected.postalCode,
      region: selected.region,
      country: resolveAddressCountry(selected.country, countries),
      phone: selected.phone ?? "",
    });
  };

  const nextStep = () => {
    if (step === 1) {
      if (resolvedEmail.length < 3 || !resolvedEmail.includes("@")) {
        setMessage("A valid email address is required.");
        return;
      }

      setMessage(null);
      setStep(2);
      return;
    }

    if (step === 2) {
      if (countries.length === 0) {
        setMessage("Checkout is unavailable because this channel has no active countries.");
        return;
      }

      if (!isAddressComplete(billingAddress, countries)) {
        setMessage("Please complete all required billing address fields.");
        return;
      }

      if (separateShippingAddress && !isAddressComplete(shippingAddress, countries)) {
        setMessage("Please complete all required shipping address fields.");
        return;
      }

      setMessage(null);
      setStep(3);
    }
  };

  const onSubmit = async () => {
    const finalEmail = resolvedEmail;
    if (finalEmail.length < 3 || !finalEmail.includes("@")) {
      setMessage("A valid email address is required.");
      return;
    }

    if (
      !isAddressComplete(billingAddress, countries)
      || (separateShippingAddress && !isAddressComplete(shippingAddress, countries))
    ) {
      setMessage("Please review the billing and shipping addresses.");
      setStep(2);
      return;
    }

    setSubmitting(true);
    try {
      const orderBillingAddress = toOrderAddress(billingAddress);
      const orderShippingAddress = separateShippingAddress
        ? toOrderAddress(shippingAddress)
        : orderBillingAddress;
      const order = await commerce.createOrder({
        email: finalEmail,
        shippingAddress: orderShippingAddress,
        billingAddress: orderBillingAddress,
        ...(notes.trim().length > 0 ? { notes: notes.trim() } : {}),
      });

      if (!order) {
        setMessage("Could not create order from current cart.");
        return;
      }

      if (normalizedMode === "authenticated" && hasSession) {
        auth.saveAddress({
          label: `${billingAddress.street.trim()} ${billingAddress.number.trim()}, ${billingAddress.city.trim()}`,
          firstName: billingAddress.firstName.trim(),
          lastName: billingAddress.lastName.trim(),
          street: billingAddress.street.trim(),
          number: billingAddress.number.trim(),
          additional: billingAddress.additional.trim(),
          city: billingAddress.city.trim(),
          postalCode: billingAddress.postalCode.trim(),
          region: billingAddress.region.trim(),
          country: billingAddress.country.trim().toUpperCase(),
          ...(billingAddress.phone.trim().length > 0 ? { phone: billingAddress.phone.trim() } : {}),
        });
      }

      if (props.features.payment) {
        router.push(`${props.paths.payment}?order=${encodeURIComponent(commerceOrderId(order))}` as Route);
        return;
      }

      setMessage(`Order placed: ${commerceOrderId(order)}`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not create order.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Checkout</CardTitle>
          <CardDescription>
            Step {step} of 3 · {normalizedMode === "authenticated" ? "Authenticated checkout" : "Guest checkout"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {props.features.auth && (
            <div className="flex flex-wrap gap-2">
              {hasSession && (
                <Button
                  size="sm"
                  variant={normalizedMode === "authenticated" ? "default" : "outline"}
                  onClick={() => setMode("authenticated")}
                >
                  Authenticated
                </Button>
              )}
              {(props.features.guestCheckout || !hasSession) && (
                <Button
                  size="sm"
                  variant={normalizedMode === "guest" ? "default" : "outline"}
                  onClick={() => setMode("guest")}
                >
                  Guest
                </Button>
              )}
            </div>
          )}

          {step === 1 && (
            <div className="space-y-3">
              {normalizedMode === "authenticated" && hasSession ? (
                <p className="text-sm text-muted-foreground">
                  Logged in as {auth.session?.email}
                </p>
              ) : (
                <Input
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="Email"
                  type="email"
                />
              )}
              <Button onClick={nextStep}>Continue to address</Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-3">
              {normalizedMode === "authenticated" && auth.savedAddresses.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Saved billing addresses</p>
                  <div className="flex flex-wrap gap-2">
                    {auth.savedAddresses.map((entry) => (
                      <Button
                        key={entry.id}
                        size="sm"
                        variant={selectedSavedAddressId === entry.id ? "default" : "outline"}
                        onClick={() => {
                          setSelectedSavedAddressId(entry.id);
                          applySavedAddress(entry.id);
                        }}
                      >
                        {entry.label}
                      </Button>
                    ))}
                    <Button
                      size="sm"
                      variant={selectedSavedAddressId === "new" ? "default" : "outline"}
                      onClick={() => setSelectedSavedAddressId("new")}
                    >
                      New address
                    </Button>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <p className="text-sm font-medium">Billing address</p>
                <CheckoutAddressFields
                  address={billingAddress}
                  countries={countries}
                  idPrefix="billing"
                  onChange={setBillingAddress}
                />
              </div>

              <div className="flex items-center gap-3 rounded-md border p-3">
                <Switch
                  id="separate-shipping-address"
                  checked={separateShippingAddress}
                  onCheckedChange={(checked) => {
                    if (checked && !addressHasEnteredDetails(shippingAddress)) {
                      setShippingAddress({ ...billingAddress });
                    }
                    setSeparateShippingAddress(checked);
                  }}
                />
                <Label htmlFor="separate-shipping-address">Use a separate shipping address</Label>
              </div>

              {separateShippingAddress && (
                <div className="space-y-3">
                  <p className="text-sm font-medium">Shipping address</p>
                  <CheckoutAddressFields
                    address={shippingAddress}
                    countries={countries}
                    idPrefix="shipping"
                    onChange={setShippingAddress}
                  />
                </div>
              )}

              {countries.length === 0 && (
                <p className="text-sm text-destructive">
                  Checkout is unavailable because this channel has no active countries.
                </p>
              )}
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button onClick={nextStep}>Continue to review</Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-3">
              <div className="space-y-4 rounded-md border p-3 text-sm">
                <div>
                  <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Billing address
                  </p>
                  <CheckoutAddressSummary address={billingAddress} />
                </div>
                {separateShippingAddress && (
                  <div className="border-t pt-3">
                    <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Shipping address
                    </p>
                    <CheckoutAddressSummary address={shippingAddress} />
                  </div>
                )}
                <p className="border-t pt-3 text-muted-foreground">{resolvedEmail}</p>
              </div>
              <Textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Order notes (optional)"
              />
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={() => setStep(2)}>
                  Back
                </Button>
                <Button disabled={submitting} onClick={() => { void onSubmit(); }}>
                  {submitting
                    ? "Submitting…"
                    : props.features.payment
                      ? "Continue to payment"
                      : "Place order"}
                </Button>
              </div>
            </div>
          )}

          {message && <p className="text-sm text-muted-foreground">{message}</p>}

          <Link href={props.paths.cart as Route} className="text-sm font-medium text-primary hover:underline">
            Back to cart
          </Link>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Order summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {commerce.cart.map((item) => (
            <div key={commerceCartItemId(item)} className="flex items-center justify-between text-sm">
              <span>{commerceCartItemTitle(item)} × {commerceCartItemQuantity(item)}</span>
              <span>{formatMoney(commerceCartItemTotalPrice(item), cartCurrency)}</span>
            </div>
          ))}
          <div className="flex items-center justify-between border-t pt-2 text-sm font-semibold">
            <span>Total</span>
            <span>{formatMoney(commerce.cartTotal, cartCurrency)}</span>
          </div>
          {props.features.auth && hasSession && (
            <Link href={props.paths.account as Route} className="text-xs text-muted-foreground hover:underline">
              Logged in as {auth.session?.email}
            </Link>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
