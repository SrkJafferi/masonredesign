"use client";

import { MailIcon, SendIcon } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { siteConfig } from "@/config/site";

const contactFormSchema = z.object({
  name: z.string().trim().min(1, "Please enter your name.").max(120),
  email: z.email("Please enter a valid email address."),
  message: z.string().trim().min(1, "Please enter a message.").max(2000),
  consent: z
    .boolean()
    .refine((value) => value === true, {
      message: "Please agree that your submitted data is being collected and stored.",
    }),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

/**
 * Honest contact form: there is no submission backend on this site, so a valid
 * submission composes a pre-filled email to the MASOM secretary in the user's
 * own email app. We never claim the message was "sent" — nothing is stored or
 * transmitted by this website.
 */
export function ContactForm() {
  const [composed, setComposed] = useState(false);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<ContactFormValues>({
    defaultValues: { name: "", email: "", message: "", consent: false },
  });

  const onSubmit = (values: ContactFormValues) => {
    const parsed = contactFormSchema.safeParse(values);
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const field = issue.path[0] as keyof ContactFormValues;
        setError(field, { type: "manual", message: issue.message });
      }
      return;
    }

    const subject = `Website contact message from ${values.name}`;
    const body = [`Name: ${values.name}`, `Email: ${values.email}`, "", values.message].join("\n");
    window.location.href = `mailto:${siteConfig.contact.email}?subject=${encodeURIComponent(
      subject,
    )}&body=${encodeURIComponent(body)}`;
    setComposed(true);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-8 space-y-5">
      <div className="space-y-2">
        <Label htmlFor="contact-name">Your Name</Label>
        <Input
          id="contact-name"
          type="text"
          autoComplete="name"
          placeholder="Your full name"
          aria-invalid={errors.name ? true : undefined}
          aria-describedby={errors.name ? "contact-name-error" : undefined}
          className="h-11 rounded-xl px-4"
          {...register("name")}
        />
        {errors.name ? (
          <p id="contact-name-error" role="alert" className="text-sm text-destructive">
            {errors.name.message}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="contact-email">Your E-mail</Label>
        <Input
          id="contact-email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          aria-invalid={errors.email ? true : undefined}
          aria-describedby={errors.email ? "contact-email-error" : undefined}
          className="h-11 rounded-xl px-4"
          {...register("email")}
        />
        {errors.email ? (
          <p id="contact-email-error" role="alert" className="text-sm text-destructive">
            {errors.email.message}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="contact-message">Message</Label>
        <Textarea
          id="contact-message"
          rows={5}
          placeholder="Write your message…"
          aria-invalid={errors.message ? true : undefined}
          aria-describedby={errors.message ? "contact-message-error" : undefined}
          className="min-h-32 rounded-xl px-4 py-3"
          {...register("message")}
        />
        {errors.message ? (
          <p id="contact-message-error" role="alert" className="text-sm text-destructive">
            {errors.message.message}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <label
          htmlFor="contact-consent"
          className="flex cursor-pointer items-start gap-2.5 text-sm text-muted-foreground"
        >
          <input
            id="contact-consent"
            type="checkbox"
            className="mt-0.5 size-4 shrink-0 rounded accent-brand-500"
            aria-invalid={errors.consent ? true : undefined}
            aria-describedby={errors.consent ? "contact-consent-error" : undefined}
            {...register("consent")}
          />
          <span>I agree that my submitted data is being collected and stored.</span>
        </label>
        {errors.consent ? (
          <p id="contact-consent-error" role="alert" className="text-sm text-destructive">
            {errors.consent.message}
          </p>
        ) : null}
      </div>

      {composed ? (
        <p
          role="status"
          className="flex items-start gap-2.5 rounded-xl border border-brand-500/30 bg-brand-500/10 px-4 py-3 text-sm text-brand-700"
        >
          <MailIcon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>
            Your email app has been opened with your message ready to send to{" "}
            <strong>{siteConfig.contact.email}</strong>.
          </span>
        </p>
      ) : null}

      <Button
        type="submit"
        variant="cta"
        size="pill"
        className="h-11 w-full rounded-xl px-7 text-sm font-bold sm:w-auto"
      >
        Send Message
        <SendIcon className="size-4" aria-hidden="true" />
      </Button>

      <p className="text-xs leading-relaxed text-muted-foreground">
        Submitting opens your email app so your message goes directly to{" "}
        {siteConfig.contact.email}. Nothing you type here is stored on this website.
      </p>
    </form>
  );
}
