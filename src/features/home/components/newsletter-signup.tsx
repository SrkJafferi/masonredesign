"use client";

import { CheckCircle2Icon, SendIcon } from "lucide-react";
import { useId, useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";

export function NewsletterSignup() {
  const emailId = useId();
  const agreeId = useId();
  const [email, setEmail] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Visual only: nothing is sent to any service or stored in this phase.
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div
        role="status"
        className="mx-auto flex w-full max-w-xl items-center justify-center gap-3 rounded-xl border border-brand-400/40 bg-brand-500/15 px-5 py-4 text-center text-white"
      >
        <CheckCircle2Icon className="size-5 shrink-0 text-brand-400" />
        <span className="font-medium">Thank you — you&apos;re on the list.</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto w-full max-w-xl">
      <div className="flex flex-col gap-3 sm:flex-row">
        <label htmlFor={emailId} className="sr-only">
          Email address
        </label>
        <input
          id={emailId}
          name="email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Enter your email address"
          className="h-12 w-full flex-1 rounded-lg border border-white/20 bg-white/10 px-4 text-white backdrop-blur-sm transition-colors placeholder:text-white/50 focus:border-brand-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/60"
        />
        <Button
          type="submit"
          className="h-12 shrink-0 bg-brand-500 px-6 text-sm font-bold hover:bg-brand-600 sm:px-7"
        >
          Subscribe
          <SendIcon className="size-4" />
        </Button>
      </div>

      <label
        htmlFor={agreeId}
        className="mt-4 flex cursor-pointer items-start gap-2.5 text-sm text-white/70"
      >
        <input
          id={agreeId}
          name="agree"
          type="checkbox"
          required
          checked={agreed}
          onChange={(event) => setAgreed(event.target.checked)}
          className="mt-0.5 size-4 shrink-0 rounded border-white/30 bg-white/10 accent-brand-500"
        />
        <span>I agree that my submitted data is being collected and stored.</span>
      </label>
    </form>
  );
}
