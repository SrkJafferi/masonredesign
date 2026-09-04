"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircleIcon, Loader2Icon, SendIcon } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

import { submitDonation } from "../actions";
import {
  DONATION_PURPOSES,
  QUICK_AMOUNTS,
  donationFormSchema,
  type DonationFormValues,
} from "../schema";

export function DonationForm() {
  const [pending, setPending] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<DonationFormValues>({
    resolver: zodResolver(donationFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      amount: "",
      purpose: "",
      message: "",
      company: "",
    },
  });

  const amount = watch("amount");

  const chooseAmount = (value: string) => {
    setValue("amount", value, { shouldValidate: true });
  };

  const onSubmit = async (values: DonationFormValues) => {
    setPending(true);
    setErrorMessage(null);

    const formData = new FormData();
    formData.set("name", values.name);
    formData.set("email", values.email);
    formData.set("phone", values.phone ?? "");
    formData.set("amount", values.amount);
    formData.set("purpose", values.purpose ?? "");
    formData.set("message", values.message ?? "");
    formData.set("company", values.company ?? "");

    const result = await submitDonation(formData);

    setPending(false);
    if (result.ok) {
      setSubmitted(true);
    } else {
      setErrorMessage(result.message);
    }
  };

  if (submitted) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="flex flex-col items-center rounded-2xl border border-brand-500/30 bg-brand-500/5 px-8 py-12 text-center"
      >
        <span className="flex size-14 items-center justify-center rounded-full bg-brand-500/10 text-brand-600">
          <CheckCircleIcon className="size-7" aria-hidden="true" />
        </span>
        <h3 className="mt-5 font-heading text-xl font-bold text-foreground">Thank you.</h3>
        <p className="mt-2 max-w-sm text-base leading-relaxed text-muted-foreground">
          Your donation information has been sent to MASOM. Someone from the community will be in
          touch if needed.
        </p>
        <Button
          type="button"
          variant="outline"
          size="pill"
          className="mt-7"
          onClick={() => {
            reset();
            setSubmitted(false);
          }}
        >
          Send another submission
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      {errorMessage ? (
        <p
          role="alert"
          aria-live="assertive"
          className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          {errorMessage}
        </p>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="donation-name">Full Name</Label>
        <Input
          id="donation-name"
          type="text"
          autoComplete="name"
          placeholder="Your full name"
          aria-invalid={errors.name ? true : undefined}
          aria-describedby={errors.name ? "donation-name-error" : undefined}
          className="h-11 rounded-xl px-4"
          {...register("name")}
        />
        {errors.name ? (
          <p id="donation-name-error" role="alert" className="text-sm text-destructive">
            {errors.name.message}
          </p>
        ) : null}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="donation-email">Email</Label>
          <Input
            id="donation-email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            aria-invalid={errors.email ? true : undefined}
            aria-describedby={errors.email ? "donation-email-error" : undefined}
            className="h-11 rounded-xl px-4"
            {...register("email")}
          />
          {errors.email ? (
            <p id="donation-email-error" role="alert" className="text-sm text-destructive">
              {errors.email.message}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="donation-phone">
            Phone <span className="font-normal text-muted-foreground">(optional)</span>
          </Label>
          <Input
            id="donation-phone"
            type="tel"
            autoComplete="tel"
            placeholder="(312) 555-0199"
            aria-invalid={errors.phone ? true : undefined}
            aria-describedby={errors.phone ? "donation-phone-error" : undefined}
            className="h-11 rounded-xl px-4"
            {...register("phone")}
          />
          {errors.phone ? (
            <p id="donation-phone-error" role="alert" className="text-sm text-destructive">
              {errors.phone.message}
            </p>
          ) : null}
        </div>
      </div>

      {/* Amount */}
      <div className="space-y-2">
        <Label htmlFor="donation-amount">Donation Amount</Label>
        <div
          className="grid grid-cols-4 gap-2"
          role="group"
          aria-label="Quick donation amounts"
        >
          {QUICK_AMOUNTS.map((value) => {
            const active = amount === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => chooseAmount(value)}
                aria-pressed={active}
                className={cn(
                  "h-10 rounded-xl border text-sm font-bold transition-all focus:outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                  active
                    ? "border-brand-500 bg-brand-500 text-white shadow-sm"
                    : "border-border/70 bg-card text-foreground hover:border-brand-500/50 hover:text-brand-600",
                )}
              >
                ${value}
              </button>
            );
          })}
        </div>
        <div className="relative mt-2">
          <span
            className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-sm font-semibold text-muted-foreground"
            aria-hidden="true"
          >
            $
          </span>
          <Input
            id="donation-amount"
            type="text"
            inputMode="decimal"
            autoComplete="off"
            placeholder="Custom amount (e.g. 75)"
            aria-invalid={errors.amount ? true : undefined}
            aria-describedby={errors.amount ? "donation-amount-error" : undefined}
            className="h-11 rounded-xl pr-4 pl-8"
            {...register("amount")}
          />
        </div>
        {errors.amount ? (
          <p id="donation-amount-error" role="alert" className="text-sm text-destructive">
            {errors.amount.message}
          </p>
        ) : null}
      </div>

      {/* Purpose */}
      <div className="space-y-2">
        <Label htmlFor="donation-purpose">
          Donation Purpose <span className="font-normal text-muted-foreground">(optional)</span>
        </Label>
        <select
          id="donation-purpose"
          className="h-11 w-full rounded-xl border border-input bg-transparent px-4 text-base transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30 md:text-sm"
          aria-invalid={errors.purpose ? true : undefined}
          aria-describedby={errors.purpose ? "donation-purpose-error" : undefined}
          {...register("purpose")}
        >
          <option value="">Select a purpose…</option>
          {DONATION_PURPOSES.map((purpose) => (
            <option key={purpose.value} value={purpose.value}>
              {purpose.label}
            </option>
          ))}
        </select>
        {errors.purpose ? (
          <p id="donation-purpose-error" role="alert" className="text-sm text-destructive">
            {errors.purpose.message}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="donation-message">
          Message / Notes <span className="font-normal text-muted-foreground">(optional)</span>
        </Label>
        <Textarea
          id="donation-message"
          rows={4}
          placeholder="Anything you'd like MASOM to know…"
          aria-invalid={errors.message ? true : undefined}
          aria-describedby={errors.message ? "donation-message-error" : undefined}
          className="min-h-28 rounded-xl px-4 py-3"
          {...register("message")}
        />
        {errors.message ? (
          <p id="donation-message-error" role="alert" className="text-sm text-destructive">
            {errors.message.message}
          </p>
        ) : null}
      </div>

      {/* Honeypot — hidden from humans, tempting for bots. */}
      <div className="absolute -left-[9999px] top-auto h-px w-px overflow-hidden" aria-hidden="true">
        <Label htmlFor="donation-company" className="sr-only">
          Company
        </Label>
        <Input
          id="donation-company"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          {...register("company")}
        />
      </div>

      <Button
        type="submit"
        variant="cta"
        className="h-12 w-full rounded-xl px-7 text-sm font-bold tracking-wide"
        disabled={pending}
      >
        {pending ? (
          <>
            <Loader2Icon className="size-4 animate-spin" aria-hidden="true" />
            Sending…
          </>
        ) : (
          <>
            Submit Donation Information
            <SendIcon className="size-4" aria-hidden="true" />
          </>
        )}
      </Button>

      <p className="text-xs leading-relaxed text-muted-foreground">
        This form shares your donation information with MASOM by email — no payment is processed
        on this page. Please use Zelle/Quickpay or regular mail to complete your donation.
      </p>
    </form>
  );
}