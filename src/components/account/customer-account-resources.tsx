"use client";

import type { ReactNode } from "react";
import type { CurrencyAmount } from "@ominity/api-typescript/models";
import { CUSTOMER_PERMISSIONS } from "@ominity/next/customer-accounts";
import type { UseOminityQueryResult } from "@ominity/next/actions/react";
import {
  useOminityCustomerAccounts,
  useOminityCustomerQuery,
} from "@ominity/next/customer-accounts/react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

function formatAmount(amount: CurrencyAmount): string {
  const raw = amount.value ?? amount.amount ?? "0";
  const value = Number.parseFloat(raw);
  if (!Number.isFinite(value)) return `${raw} ${amount.currency}`;
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: amount.currency,
    }).format(value);
  } catch {
    return `${raw} ${amount.currency}`;
  }
}

function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString();
}

interface ResourceCardProps<TData> {
  readonly title: string;
  readonly description: string;
  readonly query: UseOminityQueryResult<TData>;
  readonly count: number;
  readonly empty: string;
  readonly children: ReactNode;
}

function ResourceCard<TData>(props: ResourceCardProps<TData>) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle>{props.title}</CardTitle>
            <CardDescription>{props.description}</CardDescription>
          </div>
          <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium">{props.count}</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {props.query.loading && <p className="text-sm text-muted-foreground">Loading…</p>}
        {props.query.error && <p className="text-sm text-destructive">{props.query.error.message}</p>}
        {!props.query.loading && !props.query.error && props.count === 0
          ? <p className="text-sm text-muted-foreground">{props.empty}</p>
          : props.children}
      </CardContent>
    </Card>
  );
}

export function CustomerAccountResources() {
  const accounts = useOminityCustomerAccounts();
  const orders = useOminityCustomerQuery(
    ({ client, signal }) => client.orders.list({ page: 1, limit: 10, sort: "-createdAt" }, { signal }),
    { permission: CUSTOMER_PERMISSIONS.ordersView },
  );
  const invoices = useOminityCustomerQuery(
    ({ client, signal }) => client.invoices.list({ page: 1, limit: 10, sort: "-createdAt" }, { signal }),
    { permission: CUSTOMER_PERMISSIONS.invoicesView },
  );
  const payments = useOminityCustomerQuery(
    ({ client, signal }) => client.payments.list({ page: 1, limit: 10, sort: "-createdAt" }, { signal }),
    { permission: CUSTOMER_PERMISSIONS.paymentsView },
  );
  const subscriptions = useOminityCustomerQuery(
    ({ client, signal }) => client.subscriptions.list({ page: 1, limit: 10, sort: "-createdAt" }, { signal }),
    { permission: CUSTOMER_PERMISSIONS.subscriptionsView },
  );
  const mandates = useOminityCustomerQuery(
    ({ client, signal }) => client.mandates.list({ page: 1, limit: 10, sort: "-createdAt" }, { signal }),
    { permission: CUSTOMER_PERMISSIONS.mandatesView },
  );
  const groups = useOminityCustomerQuery(
    ({ client, signal }) => client.groups.list({ page: 1, limit: 20, sort: "name" }, { signal }),
    { permission: CUSTOMER_PERMISSIONS.customerView },
  );

  const downloadInvoice = async (invoiceId: number, number: string) => {
    const bytes = await accounts.client.invoices.downloadPdf(invoiceId);
    const url = URL.createObjectURL(new Blob([bytes.slice().buffer], { type: "application/pdf" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${number || `invoice-${invoiceId}`}.pdf`;
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 0);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {accounts.can(CUSTOMER_PERMISSIONS.ordersView) && (
        <ResourceCard title="Orders" description="Orders placed for the active customer." query={orders} count={orders.data?.count ?? 0} empty="No orders yet.">
          {orders.data?.items.map((order) => (
            <div key={order.id} className="flex items-center justify-between gap-3 rounded-lg border p-3 text-sm">
              <div>
                <p className="font-medium">{order.number || `Order #${order.id}`}</p>
                <p className="text-xs text-muted-foreground">{formatDate(order.createdAt)} · {order.status}</p>
              </div>
              <span className="font-medium">{formatAmount(order.totalAmount)}</span>
            </div>
          ))}
        </ResourceCard>
      )}

      {accounts.can(CUSTOMER_PERMISSIONS.invoicesView) && (
        <ResourceCard title="Invoices" description="Invoices and PDF downloads." query={invoices} count={invoices.data?.count ?? 0} empty="No invoices yet.">
          {invoices.data?.items.map((invoice) => (
            <div key={invoice.id} className="flex items-center justify-between gap-3 rounded-lg border p-3 text-sm">
              <div>
                <p className="font-medium">{invoice.number || `Invoice #${invoice.id}`}</p>
                <p className="text-xs text-muted-foreground">{formatDate(invoice.invoicedAt ?? invoice.createdAt)} · {invoice.status}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-medium">{formatAmount(invoice.totalAmount)}</span>
                <Button type="button" size="sm" variant="outline" onClick={() => { void downloadInvoice(invoice.id, invoice.number); }}>PDF</Button>
              </div>
            </div>
          ))}
        </ResourceCard>
      )}

      {accounts.can(CUSTOMER_PERMISSIONS.subscriptionsView) && (
        <ResourceCard title="Subscriptions" description="Recurring products and their current period." query={subscriptions} count={subscriptions.data?.count ?? 0} empty="No subscriptions yet.">
          {subscriptions.data?.items.map((subscription) => (
            <div key={subscription.id} className="flex items-center justify-between gap-3 rounded-lg border p-3 text-sm">
              <div>
                <p className="font-medium">{subscription.product?.title ?? `Subscription #${subscription.id}`}</p>
                <p className="text-xs text-muted-foreground">
                  {subscription.status} · through {formatDate(subscription.currentPeriod.endsAt)} · {subscription.currentPeriod.daysLeft ?? "—"} days left
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-medium">{formatAmount(subscription.recurringAmount)}</span>
                {accounts.can(CUSTOMER_PERMISSIONS.subscriptionsManage) && subscription.status !== "cancelled" && (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      if (!window.confirm("Cancel this subscription?")) return;
                      void accounts.client.subscriptions.remove(subscription.id).then(() => subscriptions.refresh());
                    }}
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </div>
          ))}
        </ResourceCard>
      )}

      {accounts.can(CUSTOMER_PERMISSIONS.paymentsView) && (
        <ResourceCard title="Payments" description="Payment attempts and completed transactions." query={payments} count={payments.data?.count ?? 0} empty="No payments yet.">
          {payments.data?.items.map((payment) => (
            <div key={payment.id} className="flex items-center justify-between gap-3 rounded-lg border p-3 text-sm">
              <div>
                <p className="font-medium">{payment.description || `Payment #${payment.id}`}</p>
                <p className="text-xs text-muted-foreground">{formatDate(payment.createdAt)} · {payment.status}</p>
              </div>
              <span className="font-medium">{formatAmount(payment.amount)}</span>
            </div>
          ))}
        </ResourceCard>
      )}

      {accounts.can(CUSTOMER_PERMISSIONS.mandatesView) && (
        <ResourceCard title="Mandates" description="Saved payment authorizations." query={mandates} count={mandates.data?.count ?? 0} empty="No mandates yet.">
          {mandates.data?.items.map((mandate) => (
            <div key={mandate.id} className="flex items-center justify-between gap-3 rounded-lg border p-3 text-sm">
              <div>
                <p className="font-medium">{mandate.details.holderName ?? mandate.details.cardType ?? `Mandate #${mandate.id}`}</p>
                <p className="text-xs text-muted-foreground">{mandate.details.cardNumber ?? mandate.details.accountNumber ?? "Payment authorization"}</p>
              </div>
              <span className="rounded-full bg-muted px-2 py-1 text-xs">{mandate.status}</span>
            </div>
          ))}
        </ResourceCard>
      )}

      {accounts.can(CUSTOMER_PERMISSIONS.customerView) && (
        <ResourceCard title="Customer groups" description="Segments assigned by commerce rules." query={groups} count={groups.data?.count ?? 0} empty="No customer groups assigned.">
          <div className="flex flex-wrap gap-2">
            {groups.data?.items.map((group) => (
              <span key={group.id} className="rounded-full border px-3 py-1 text-xs font-medium" title={group.description ?? undefined}>
                {group.name}
              </span>
            ))}
          </div>
        </ResourceCard>
      )}
    </div>
  );
}
