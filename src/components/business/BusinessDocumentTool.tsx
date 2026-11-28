import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Download, Plus, Printer, Trash2 } from "lucide-react";
import { Button, Card, Field, Notice, Select, TextArea, TextInput } from "@/components/kit";
import { ToolPage } from "@/components/ToolPage";
import { getTool, type ToolSlug } from "@/data/tools";
import { calculateDocumentTotals } from "@/lib/business-calculations";
import { downloadDocumentPdf, type PrintableDocument } from "@/lib/document-pdf";
import { formatNumber, parseNumber } from "@/lib/format";

export type BusinessDocumentKind = "invoice" | "quotation" | "receipt" | "delivery";

type LineItem = {
  id: string;
  description: string;
  quantity: string;
  unitPrice: string;
  quantityOrdered: string;
  quantityDelivered: string;
};

type DocumentForm = {
  businessName: string;
  businessEmail: string;
  businessPhone: string;
  businessAddress: string;
  customerName: string;
  customerEmail: string;
  customerAddress: string;
  number: string;
  currency: string;
  customCurrency: string;
  issueDate: string;
  dueDate: string;
  validThrough: string;
  paymentDate: string;
  paymentDescription: string;
  paymentMethod: string;
  reference: string;
  amountReceived: string;
  deliveryDate: string;
  deliveryAddress: string;
  receivedBy: string;
  taxPercent: string;
  discountPercent: string;
  notes: string;
  paymentInstructions: string;
  terms: string;
  items: LineItem[];
};

const CONFIG: Record<BusinessDocumentKind, { slug: ToolSlug; title: string; related: ToolSlug[] }> = {
  invoice: {
    slug: "invoice-generator",
    title: "Invoice",
    related: ["quotation-generator", "receipt-generator", "business-expense-tracker"],
  },
  quotation: {
    slug: "quotation-generator",
    title: "Quotation",
    related: ["invoice-generator", "profit-margin-calculator", "receipt-generator"],
  },
  receipt: {
    slug: "receipt-generator",
    title: "Receipt",
    related: ["invoice-generator", "quotation-generator", "business-expense-tracker"],
  },
  delivery: {
    slug: "delivery-note-generator",
    title: "Delivery note",
    related: ["invoice-generator", "quotation-generator", "inventory-reorder-calculator"],
  },
};

const INITIAL_FORM: DocumentForm = {
  businessName: "",
  businessEmail: "",
  businessPhone: "",
  businessAddress: "",
  customerName: "",
  customerEmail: "",
  customerAddress: "",
  number: "",
  currency: "USD",
  customCurrency: "",
  issueDate: "",
  dueDate: "",
  validThrough: "",
  paymentDate: "",
  paymentDescription: "",
  paymentMethod: "Bank transfer",
  reference: "",
  amountReceived: "",
  deliveryDate: "",
  deliveryAddress: "",
  receivedBy: "",
  taxPercent: "0",
  discountPercent: "0",
  notes: "",
  paymentInstructions: "",
  terms: "",
  items: [
    {
      id: "item-1",
      description: "",
      quantity: "1",
      unitPrice: "",
      quantityOrdered: "1",
      quantityDelivered: "",
    },
  ],
};

const FAQS = [
  {
    q: "Are my document details uploaded or saved?",
    a: "No. The form and PDF are created in your browser. The details are not sent to AllTools or a document service.",
  },
  {
    q: "Can I save the preview as a PDF?",
    a: "Use Download PDF for a locally generated file, or Print and choose Save as PDF in your device's print options.",
  },
  {
    q: "Does a generated receipt prove a payment happened?",
    a: "No. A receipt is only a template containing details you entered. It does not verify a transfer, cash payment or card transaction.",
  },
];

function safeAmount(value: string): number | null {
  if (!value.trim()) return null;
  const parsed = parseNumber(value);
  return parsed !== null && parsed >= 0 ? parsed : null;
}

function currencyText(form: DocumentForm): string {
  return form.currency === "OTHER" ? form.customCurrency.trim() : form.currency;
}

function formatBusinessMoney(value: number, currency: string): string {
  const amount = formatNumber(value, 2);
  return currency ? `${currency} ${amount}` : amount;
}

function formatDate(value: string): string {
  if (!value) return "";
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isFinite(date.getTime())
    ? new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeZone: "UTC" }).format(date)
    : value;
}

function validationMessage(kind: BusinessDocumentKind, form: DocumentForm): string | null {
  if (!form.businessName.trim()) return "Add your business or sender name.";
  if (!form.customerName.trim()) return "Add the customer or recipient name.";
  if (!form.number.trim()) return `Add a ${CONFIG[kind].title.toLowerCase()} number.`;
  if (kind === "invoice" && !form.issueDate) return "Choose the invoice date.";
  if (kind === "quotation" && !form.issueDate) return "Choose the quotation issue date.";
  if (kind === "receipt" && !form.paymentDate) return "Choose the payment date.";
  if (kind === "delivery" && !form.deliveryDate) return "Choose the delivery date.";
  if (kind === "invoice" || kind === "quotation") {
    if (form.items.length === 0) return "Add at least one item or service.";
    for (const [index, item] of form.items.entries()) {
      const quantity = safeAmount(item.quantity);
      const price = safeAmount(item.unitPrice);
      if (!item.description.trim()) return `Add a description for line ${index + 1}.`;
      if (quantity === null || quantity <= 0) return `Enter a quantity above zero on line ${index + 1}.`;
      if (price === null) return `Enter a valid non-negative unit price on line ${index + 1}.`;
    }
    const tax = form.taxPercent.trim() ? parseNumber(form.taxPercent) : 0;
    const discount = form.discountPercent.trim() ? parseNumber(form.discountPercent) : 0;
    if (tax === null || tax < 0 || tax > 100) return "Tax must be between 0 and 100 percent.";
    if (discount === null || discount < 0 || discount > 100) return "Discount must be between 0 and 100 percent.";
    if (!currencyText(form)) return "Enter a currency label for your document.";
  }
  if (kind === "receipt") {
    if (!form.paymentDescription.trim()) return "Describe what the customer paid for.";
    if (safeAmount(form.amountReceived) === null) return "Enter a valid amount received.";
    if (!currencyText(form)) return "Enter a currency label for your receipt.";
  }
  if (kind === "delivery") {
    if (!form.deliveryAddress.trim()) return "Add the delivery address.";
    if (form.items.length === 0) return "Add at least one delivered item.";
    for (const [index, item] of form.items.entries()) {
      const ordered = safeAmount(item.quantityOrdered);
      const delivered = safeAmount(item.quantityDelivered);
      if (!item.description.trim()) return `Add a description for line ${index + 1}.`;
      if (ordered === null || delivered === null) return `Enter valid ordered and delivered quantities on line ${index + 1}.`;
    }
  }
  return null;
}

function makeLineItem(): LineItem {
  const id = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `item-${Date.now()}`;
  return { id, description: "", quantity: "1", unitPrice: "", quantityOrdered: "1", quantityDelivered: "" };
}

export function BusinessDocumentTool({ kind }: { kind: BusinessDocumentKind }) {
  const config = CONFIG[kind];
  const tool = getTool(config.slug);
  const [form, setForm] = useState<DocumentForm>(INITIAL_FORM);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const currency = currencyText(form);
  const issue = validationMessage(kind, form);
  const monetary = kind === "invoice" || kind === "quotation";

  const lineValues = useMemo(
    () =>
      form.items.map((item) => ({
        description: item.description.trim(),
        quantity: safeAmount(item.quantity),
        unitPrice: safeAmount(item.unitPrice),
        quantityOrdered: safeAmount(item.quantityOrdered),
        quantityDelivered: safeAmount(item.quantityDelivered),
      })),
    [form.items],
  );

  const totals = monetary && !issue
    ? calculateDocumentTotals(
        lineValues.map((item) => ({ quantity: item.quantity ?? 0, unitPrice: item.unitPrice ?? 0 })),
        parseNumber(form.discountPercent) ?? 0,
        parseNumber(form.taxPercent) ?? 0,
      )
    : null;

  const totalReceived = kind === "receipt" ? safeAmount(form.amountReceived) : null;

  const printableDocument = useMemo<PrintableDocument>(() => {
    const dates: PrintableDocument["dates"] = [];
    if (kind === "invoice" || kind === "quotation") {
      dates.push({ label: kind === "invoice" ? "Invoice date" : "Issue date", value: formatDate(form.issueDate) });
      if (kind === "invoice" && form.dueDate) dates.push({ label: "Due date", value: formatDate(form.dueDate) });
      if (kind === "quotation" && form.validThrough) dates.push({ label: "Valid through", value: formatDate(form.validThrough) });
    }
    if (kind === "receipt") dates.push({ label: "Payment date", value: formatDate(form.paymentDate) });
    if (kind === "delivery") dates.push({ label: "Delivery date", value: formatDate(form.deliveryDate) });

    let rows: PrintableDocument["items"] = [];
    let totalsRows: PrintableDocument["totals"] = [];
    if (monetary) {
      rows = lineValues.map((item, index) => {
        const quantity = item.quantity ?? 0;
        const price = item.unitPrice ?? 0;
        const amount = calculateDocumentTotals([{ quantity, unitPrice: price }], 0, 0)?.subtotal ?? 0;
        return {
          description: item.description || `Item ${index + 1}`,
          details: `${formatNumber(quantity, 3)} x ${formatBusinessMoney(price, currency)}`,
          amount: formatBusinessMoney(amount, currency),
        };
      });
      if (totals) {
        totalsRows = [
          { label: "Subtotal", value: formatBusinessMoney(totals.subtotal, currency) },
          ...(totals.discount > 0 ? [{ label: "Discount", value: `-${formatBusinessMoney(totals.discount, currency)}` }] : []),
          ...(totals.tax > 0 ? [{ label: "Tax", value: formatBusinessMoney(totals.tax, currency) }] : []),
          { label: "Total", value: formatBusinessMoney(totals.total, currency) },
        ];
      }
    } else if (kind === "receipt") {
      rows = [
        {
          description: form.paymentDescription || "Payment",
          details: form.paymentMethod,
          amount: formatBusinessMoney(totalReceived ?? 0, currency),
        },
      ];
      totalsRows = [{ label: "Total received", value: formatBusinessMoney(totalReceived ?? 0, currency) }];
    } else {
      rows = lineValues.map((item, index) => ({
        description: item.description || `Item ${index + 1}`,
        details: `${formatNumber(item.quantityDelivered ?? 0, 3)} delivered / ${formatNumber(item.quantityOrdered ?? 0, 3)} ordered`,
        amount: "",
      }));
    }

    const notes = [form.notes.trim()];
    if (kind === "invoice" && form.paymentInstructions.trim()) notes.push(`Payment instructions: ${form.paymentInstructions.trim()}`);
    if (kind === "quotation" && form.terms.trim()) notes.push(`Terms and conditions: ${form.terms.trim()}`);
    if (kind === "receipt") {
      if (form.reference.trim()) notes.push(`Payment reference: ${form.reference.trim()}`);
      notes.push("Template only: this receipt records details entered by the user and does not verify a payment.");
    }
    if (kind === "delivery" && form.deliveryAddress.trim()) notes.push(`Delivery address: ${form.deliveryAddress.trim()}`);

    return {
      title: config.title,
      number: form.number,
      currency,
      businessName: form.businessName,
      businessDetails: [form.businessAddress, form.businessEmail, form.businessPhone].filter(Boolean),
      customerName: form.customerName,
      customerDetails: [form.customerAddress, form.customerEmail].filter(Boolean),
      dates,
      items: rows,
      totals: totalsRows,
      notes,
      ...(kind === "delivery" ? { signatureLabel: "Received by - signature and date" } : {}),
    };
  }, [config.title, currency, form, kind, lineValues, monetary, totalReceived, totals]);

  function update<K extends keyof DocumentForm>(key: K, value: DocumentForm[K]) {
    setError(null);
    setForm((current) => ({ ...current, [key]: value }));
  }

  function updateItem(id: string, key: keyof LineItem, value: string) {
    setError(null);
    setForm((current) => ({
      ...current,
      items: current.items.map((item) => (item.id === id ? { ...item, [key]: value } : item)),
    }));
  }

  async function handlePdf() {
    if (issue) {
      setError(issue);
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await downloadDocumentPdf(printableDocument);
    } catch {
      setError("The PDF could not be created. Use Print and choose Save as PDF instead.");
    } finally {
      setBusy(false);
    }
  }

  function reset() {
    setForm(INITIAL_FORM);
    setError(null);
  }

  return (
    <ToolPage
      tool={tool}
      intro={`${tool.description} All details stay in this browser.`}
      howItWorks={
        <>
          <p>Enter the sender, recipient and document details. Totals update as you type; discounts are applied before tax, and amounts are rounded to two decimal places.</p>
          <p>Print preview uses your browser's print controls. Download PDF builds a separate file on this device. Review all names, dates, currency and legal requirements before sending the document.</p>
        </>
      }
      example={<p>Enter your business name, customer details and line items, then download a PDF or print the ready-to-review document.</p>}
      tips={[
        "Use a unique document number and confirm the dates before sharing.",
        "Choose a currency code or enter your own currency label; totals are shown to two decimal places.",
        "Check any local tax, record-keeping and invoice requirements with a qualified adviser.",
      ]}
      faqs={FAQS}
      related={config.related}
      disclaimer={kind === "receipt" ? "A generated receipt is a template, not proof that a payment occurred. It cannot verify a bank, cash, card or mobile-money transaction." : undefined}
    >
      <div className="space-y-5">
        <Card className="space-y-5 no-print">
          <div>
            <h2 className="text-lg font-semibold">Your details</h2>
            <p className="mt-1 text-sm text-muted-foreground">Prepared locally; nothing is sent to a document service.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Business or sender name" htmlFor="business-name">
              <TextInput id="business-name" value={form.businessName} onChange={(event) => update("businessName", event.target.value)} maxLength={100} autoComplete="organization" />
            </Field>
            <Field label="Business email (optional)" htmlFor="business-email">
              <TextInput id="business-email" type="email" value={form.businessEmail} onChange={(event) => update("businessEmail", event.target.value)} maxLength={160} autoComplete="email" />
            </Field>
            <Field label="Phone (optional)" htmlFor="business-phone">
              <TextInput id="business-phone" type="tel" value={form.businessPhone} onChange={(event) => update("businessPhone", event.target.value)} maxLength={50} autoComplete="tel" />
            </Field>
            <Field label="Address (optional)" htmlFor="business-address">
              <TextInput id="business-address" value={form.businessAddress} onChange={(event) => update("businessAddress", event.target.value)} maxLength={200} autoComplete="street-address" />
            </Field>
          </div>

          <div className="border-t border-border pt-5">
            <h2 className="text-lg font-semibold">Customer or recipient</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label="Name" htmlFor="customer-name">
                <TextInput id="customer-name" value={form.customerName} onChange={(event) => update("customerName", event.target.value)} maxLength={100} autoComplete="name" />
              </Field>
              <Field label="Email (optional)" htmlFor="customer-email">
                <TextInput id="customer-email" type="email" value={form.customerEmail} onChange={(event) => update("customerEmail", event.target.value)} maxLength={160} autoComplete="email" />
              </Field>
              <Field label="Address (optional)" htmlFor="customer-address">
                <TextInput id="customer-address" value={form.customerAddress} onChange={(event) => update("customerAddress", event.target.value)} maxLength={200} autoComplete="street-address" />
              </Field>
              <Field label={`${config.title} number`} htmlFor="document-number">
                <TextInput id="document-number" value={form.number} onChange={(event) => update("number", event.target.value)} placeholder="e.g. INV-1001" maxLength={50} />
              </Field>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {(kind === "invoice" || kind === "quotation") ? (
              <>
                <Field label={kind === "invoice" ? "Invoice date" : "Issue date"} htmlFor="issue-date">
                  <TextInput id="issue-date" type="date" value={form.issueDate} onChange={(event) => update("issueDate", event.target.value)} />
                </Field>
                {kind === "invoice" ? (
                  <Field label="Due date (optional)" htmlFor="due-date">
                    <TextInput id="due-date" type="date" value={form.dueDate} onChange={(event) => update("dueDate", event.target.value)} />
                  </Field>
                ) : (
                  <Field label="Valid through (optional)" htmlFor="valid-through">
                    <TextInput id="valid-through" type="date" value={form.validThrough} onChange={(event) => update("validThrough", event.target.value)} />
                  </Field>
                )}
              </>
            ) : null}
            {kind === "receipt" ? (
              <>
                <Field label="Payment date" htmlFor="payment-date">
                  <TextInput id="payment-date" type="date" value={form.paymentDate} onChange={(event) => update("paymentDate", event.target.value)} />
                </Field>
                <Field label="Payment method" htmlFor="payment-method">
                  <Select id="payment-method" value={form.paymentMethod} onChange={(event) => update("paymentMethod", event.target.value)}>
                    <option>Bank transfer</option><option>Cash</option><option>Card</option><option>Mobile payment</option><option>Other</option>
                  </Select>
                </Field>
              </>
            ) : null}
            {kind === "delivery" ? (
              <>
                <Field label="Delivery date" htmlFor="delivery-date">
                  <TextInput id="delivery-date" type="date" value={form.deliveryDate} onChange={(event) => update("deliveryDate", event.target.value)} />
                </Field>
                <Field label="Delivery address" htmlFor="delivery-address">
                  <TextInput id="delivery-address" value={form.deliveryAddress} onChange={(event) => update("deliveryAddress", event.target.value)} maxLength={200} />
                </Field>
              </>
            ) : null}
            {kind !== "delivery" ? (
              <Field label="Currency" htmlFor="currency">
                <Select id="currency" value={form.currency} onChange={(event) => update("currency", event.target.value)}>
                  <option value="USD">USD — US dollar</option><option value="EUR">EUR — euro</option><option value="GBP">GBP — pound sterling</option><option value="KES">KES — Kenyan shilling</option><option value="INR">INR — Indian rupee</option><option value="CAD">CAD — Canadian dollar</option><option value="AUD">AUD — Australian dollar</option><option value="JPY">JPY — Japanese yen</option><option value="OTHER">Other label</option>
                </Select>
              </Field>
            ) : null}
            {kind !== "delivery" && form.currency === "OTHER" ? (
              <Field label="Currency label" htmlFor="custom-currency" hint="For example, CHF or ₦">
                <TextInput id="custom-currency" value={form.customCurrency} onChange={(event) => update("customCurrency", event.target.value.slice(0, 12))} maxLength={12} />
              </Field>
            ) : null}
            {kind === "receipt" ? (
              <>
                <Field label="Payment description" htmlFor="payment-description">
                  <TextInput id="payment-description" value={form.paymentDescription} onChange={(event) => update("paymentDescription", event.target.value)} maxLength={160} />
                </Field>
                <Field label="Amount received" htmlFor="amount-received">
                  <TextInput id="amount-received" type="number" min="0" step="0.01" inputMode="decimal" value={form.amountReceived} onChange={(event) => update("amountReceived", event.target.value)} />
                </Field>
                <Field label="Reference (optional)" htmlFor="payment-reference">
                  <TextInput id="payment-reference" value={form.reference} onChange={(event) => update("reference", event.target.value)} maxLength={100} />
                </Field>
              </>
            ) : null}
            {kind === "delivery" ? (
              <Field label="Received by (optional)" htmlFor="received-by">
                <TextInput id="received-by" value={form.receivedBy} onChange={(event) => update("receivedBy", event.target.value)} maxLength={100} />
              </Field>
            ) : null}
          </div>

          {kind === "receipt" ? (
            <Notice tone="warning">This is a user-filled receipt template. It does not confirm or authenticate an actual payment.</Notice>
          ) : null}

          {kind === "invoice" || kind === "quotation" || kind === "delivery" ? (
            <div className="border-t border-border pt-5">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold">{kind === "delivery" ? "Items to deliver" : "Items and services"}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">{kind === "delivery" ? "Record ordered and delivered quantities." : "Line amounts and totals update as you type."}</p>
                </div>
                <Button variant="secondary" onClick={() => update("items", [...form.items, makeLineItem()])}>
                  <Plus className="size-4" aria-hidden /> Add item
                </Button>
              </div>
              <div className="mt-4 space-y-3">
                {form.items.map((item, index) => (
                  <div key={item.id} className="grid gap-3 rounded-lg border border-border p-3 sm:grid-cols-12">
                    <Field label={`Item ${index + 1} description`} htmlFor={`item-${item.id}-description`}>
                      <TextInput id={`item-${item.id}-description`} value={item.description} onChange={(event) => updateItem(item.id, "description", event.target.value)} maxLength={160} />
                    </Field>
                    {kind === "delivery" ? (
                      <>
                        <Field label="Qty ordered" htmlFor={`item-${item.id}-ordered`}>
                          <TextInput id={`item-${item.id}-ordered`} type="number" min="0" step="any" inputMode="decimal" value={item.quantityOrdered} onChange={(event) => updateItem(item.id, "quantityOrdered", event.target.value)} />
                        </Field>
                        <Field label="Qty delivered" htmlFor={`item-${item.id}-delivered`}>
                          <TextInput id={`item-${item.id}-delivered`} type="number" min="0" step="any" inputMode="decimal" value={item.quantityDelivered} onChange={(event) => updateItem(item.id, "quantityDelivered", event.target.value)} />
                        </Field>
                      </>
                    ) : (
                      <>
                        <Field label="Quantity" htmlFor={`item-${item.id}-quantity`}>
                          <TextInput id={`item-${item.id}-quantity`} type="number" min="0" step="any" inputMode="decimal" value={item.quantity} onChange={(event) => updateItem(item.id, "quantity", event.target.value)} />
                        </Field>
                        <Field label={`Unit price (${currency || "currency"})`} htmlFor={`item-${item.id}-price`}>
                          <TextInput id={`item-${item.id}-price`} type="number" min="0" step="0.01" inputMode="decimal" value={item.unitPrice} onChange={(event) => updateItem(item.id, "unitPrice", event.target.value)} />
                        </Field>
                        <p className="text-sm text-muted-foreground sm:self-end sm:pb-3">
                          Line total: {item.quantity && item.unitPrice && safeAmount(item.quantity) !== null && safeAmount(item.unitPrice) !== null
                            ? formatBusinessMoney(calculateDocumentTotals([{ quantity: safeAmount(item.quantity) ?? 0, unitPrice: safeAmount(item.unitPrice) ?? 0 }], 0, 0)?.subtotal ?? 0, currency)
                            : "—"}
                        </p>
                      </>
                    )}
                    <div className="sm:col-span-1 sm:self-end">
                      <Button variant="ghost" onClick={() => update("items", form.items.filter((line) => line.id !== item.id))} aria-label={`Remove item ${index + 1}`}>
                        <Trash2 className="size-4" aria-hidden />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {monetary ? (
            <div className="grid gap-4 border-t border-border pt-5 sm:grid-cols-2">
              <Field label="Discount (%)" htmlFor="discount-percent">
                <TextInput id="discount-percent" type="number" min="0" max="100" step="0.01" inputMode="decimal" value={form.discountPercent} onChange={(event) => update("discountPercent", event.target.value)} />
              </Field>
              <Field label="Tax (%)" htmlFor="tax-percent">
                <TextInput id="tax-percent" type="number" min="0" max="100" step="0.01" inputMode="decimal" value={form.taxPercent} onChange={(event) => update("taxPercent", event.target.value)} />
              </Field>
            </div>
          ) : null}

          {kind === "invoice" ? (
            <Field label="Payment instructions (optional)" htmlFor="payment-instructions">
              <TextArea id="payment-instructions" value={form.paymentInstructions} onChange={(event) => update("paymentInstructions", event.target.value)} maxLength={1000} />
            </Field>
          ) : null}
          {kind === "quotation" ? (
            <Field label="Terms and conditions (optional)" htmlFor="terms">
              <TextArea id="terms" value={form.terms} onChange={(event) => update("terms", event.target.value)} maxLength={1000} />
            </Field>
          ) : null}
          <Field label="Notes (optional)" htmlFor="notes">
            <TextArea id="notes" value={form.notes} onChange={(event) => update("notes", event.target.value)} maxLength={1000} />
          </Field>

          {error ? <Notice tone="warning">{error}</Notice> : issue ? <p className="text-sm text-muted-foreground" role="status">{issue}</p> : null}
          <div className="flex flex-wrap gap-2">
            <Button onClick={handlePdf} disabled={Boolean(issue) || busy}>
              <Download className="size-4" aria-hidden /> {busy ? "Preparing PDF…" : "Download PDF"}
            </Button>
            <Button variant="secondary" onClick={() => window.print()} disabled={Boolean(issue)}>
              <Printer className="size-4" aria-hidden /> Print / Save as PDF
            </Button>
            <Button variant="ghost" onClick={reset}>Reset</Button>
          </div>
        </Card>

        <section className="printable-document rounded-lg border border-border bg-card p-5 sm:p-8" aria-labelledby="document-preview-heading">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border pb-5">
            <div>
              <h2 id="document-preview-heading" className="text-xl font-bold text-foreground">{form.businessName || "Business name"}</h2>
              <div className="mt-1 space-y-0.5 text-sm text-muted-foreground">
                {[form.businessAddress, form.businessEmail, form.businessPhone].filter(Boolean).map((text) => <p key={text}>{text}</p>)}
              </div>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-sm font-bold uppercase text-primary">{config.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">No. {form.number || "—"}</p>
            </div>
          </div>
          <div className="grid gap-5 py-5 sm:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase text-muted-foreground">{kind === "delivery" ? "Recipient" : "Prepared for"}</p>
              <p className="mt-1 font-semibold text-foreground">{form.customerName || "Customer or recipient"}</p>
              <p className="text-sm text-muted-foreground">{form.customerAddress}</p>
              <p className="text-sm text-muted-foreground">{form.customerEmail}</p>
            </div>
            <dl className="grid grid-cols-2 gap-x-3 gap-y-1 text-sm">
              {(kind === "invoice" || kind === "quotation") ? <><dt className="text-muted-foreground">{kind === "invoice" ? "Invoice date" : "Issue date"}</dt><dd className="text-foreground">{formatDate(form.issueDate) || "—"}</dd></> : null}
              {kind === "invoice" && form.dueDate ? <><dt className="text-muted-foreground">Due date</dt><dd className="text-foreground">{formatDate(form.dueDate)}</dd></> : null}
              {kind === "quotation" && form.validThrough ? <><dt className="text-muted-foreground">Valid through</dt><dd className="text-foreground">{formatDate(form.validThrough)}</dd></> : null}
              {kind === "receipt" ? <><dt className="text-muted-foreground">Payment date</dt><dd className="text-foreground">{formatDate(form.paymentDate) || "—"}</dd><dt className="text-muted-foreground">Method</dt><dd className="text-foreground">{form.paymentMethod}</dd></> : null}
              {kind === "delivery" ? <><dt className="text-muted-foreground">Delivery date</dt><dd className="text-foreground">{formatDate(form.deliveryDate) || "—"}</dd><dt className="text-muted-foreground">Address</dt><dd className="text-foreground">{form.deliveryAddress || "—"}</dd></> : null}
            </dl>
          </div>
          {(kind === "invoice" || kind === "quotation" || kind === "delivery") ? (
            <div className="overflow-x-auto border-y border-border">
              <table className="w-full min-w-[32rem] text-left text-sm">
                <thead className="text-xs uppercase text-muted-foreground">
                  <tr><th className="py-3 pr-3">Description</th>{kind === "delivery" ? <><th className="px-3 py-3">Ordered</th><th className="px-3 py-3">Delivered</th></> : <><th className="px-3 py-3">Qty</th><th className="px-3 py-3">Unit price</th><th className="px-3 py-3 text-right">Amount</th></>}</tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {form.items.length ? form.items.map((item, index) => {
                    const values = lineValues[index];
                    const qty = values?.quantity ?? 0;
                    const price = values?.unitPrice ?? 0;
                    const amount = calculateDocumentTotals([{ quantity: qty, unitPrice: price }], 0, 0)?.subtotal ?? 0;
                    return <tr key={item.id}><td className="py-3 pr-3 font-medium text-foreground">{item.description || `Item ${index + 1}`}</td>{kind === "delivery" ? <><td className="px-3 py-3 text-muted-foreground">{item.quantityOrdered || "—"}</td><td className="px-3 py-3 text-muted-foreground">{item.quantityDelivered || "—"}</td></> : <><td className="px-3 py-3 text-muted-foreground">{item.quantity || "—"}</td><td className="px-3 py-3 text-muted-foreground">{item.unitPrice ? formatBusinessMoney(price, currency) : "—"}</td><td className="px-3 py-3 text-right text-foreground">{item.unitPrice ? formatBusinessMoney(amount, currency) : "—"}</td></>}</tr>;
                  }) : <tr><td colSpan={kind === "delivery" ? 3 : 4} className="py-5 text-center text-sm text-muted-foreground">No items have been added.</td></tr>}
                </tbody>
              </table>
            </div>
          ) : null}
          {kind === "receipt" ? (
            <div className="flex flex-wrap justify-between gap-3 border-y border-border py-4 text-sm">
              <p className="font-medium text-foreground">{form.paymentDescription || "Payment description"}</p>
              <p className="font-bold text-foreground">{totalReceived === null ? "—" : formatBusinessMoney(totalReceived, currency)}</p>
            </div>
          ) : null}
          {totals && (kind === "invoice" || kind === "quotation") ? (
            <dl className="ml-auto mt-4 max-w-xs space-y-2 text-sm">
              <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Subtotal</dt><dd className="font-medium text-foreground">{formatBusinessMoney(totals.subtotal, currency)}</dd></div>
              {totals.discount > 0 ? <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Discount</dt><dd className="font-medium text-foreground">-{formatBusinessMoney(totals.discount, currency)}</dd></div> : null}
              {totals.tax > 0 ? <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Tax</dt><dd className="font-medium text-foreground">{formatBusinessMoney(totals.tax, currency)}</dd></div> : null}
              <div className="flex justify-between gap-4 border-t border-border pt-2"><dt className="font-bold text-foreground">Total</dt><dd className="font-bold text-primary">{formatBusinessMoney(totals.total, currency)}</dd></div>
            </dl>
          ) : null}
          {kind === "receipt" ? (
            <p className="mt-4 rounded-md border border-warning-border bg-warning-soft p-3 text-xs leading-relaxed text-warning-foreground">Template only: this receipt records information entered by the user and does not prove or verify an actual payment.</p>
          ) : null}
          {(form.notes || form.paymentInstructions || form.terms || form.reference || kind === "delivery") ? (
            <div className="mt-6 space-y-2 text-sm text-muted-foreground">
              {kind === "delivery" ? <p><strong className="text-foreground">Delivery address:</strong> {form.deliveryAddress || "—"}</p> : null}
              {form.paymentInstructions ? <p><strong className="text-foreground">Payment instructions:</strong> {form.paymentInstructions}</p> : null}
              {form.terms ? <p><strong className="text-foreground">Terms and conditions:</strong> {form.terms}</p> : null}
              {form.reference ? <p><strong className="text-foreground">Payment reference:</strong> {form.reference}</p> : null}
              {form.notes ? <p><strong className="text-foreground">Notes:</strong> {form.notes}</p> : null}
            </div>
          ) : null}
          {kind === "delivery" ? (
            <div className="mt-12 grid gap-8 sm:grid-cols-2">
              <div className="border-t border-border pt-2 text-xs text-muted-foreground">Received by: {form.receivedBy || "____________________________"}</div>
              <div className="border-t border-border pt-2 text-xs text-muted-foreground">Signature and date: ____________________________</div>
            </div>
          ) : null}
          <p className="mt-8 border-t border-border pt-3 text-xs text-muted-foreground">Created with AllTools. Review this document before sharing.</p>
        </section>
      </div>
    </ToolPage>
  );
}