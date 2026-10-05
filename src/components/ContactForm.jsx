// The contact form at the bottom of the main page.
//
// It only exists if `profile.formEndpoint` is set in content.js; with it empty
// the footer's email button stands in, so the site never shows a form that
// quietly drops what people type into it.
//
// There's no backend here — the site is static. The endpoint is a free form
// service (Formspree, Web3Forms) that emails the submission on. The fetch is
// plain JSON, so a failure can say so in place instead of throwing the visitor
// onto the service's own thank-you page.
import { useState } from "react";

export default function ContactForm({ endpoint, email }) {
  const [state, setState] = useState("idle");

  if (!endpoint) return null;

  async function submit(e) {
    e.preventDefault();
    const form = e.currentTarget;
    setState("sending");
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: new FormData(form),
      });
      if (!res.ok) throw new Error(res.status);
      form.reset();
      setState("sent");
    } catch {
      setState("error");
    }
  }

  if (state === "sent") {
    return (
      <p className="contact-done" role="status">
        Thanks — that's sent. I'll reply from {email}.
      </p>
    );
  }

  return (
    <form className="contact" onSubmit={submit}>
      <div className="contact-row">
        <label className="contact-field">
          <span>Your name</span>
          <input name="name" type="text" required autoComplete="name" />
        </label>
        <label className="contact-field">
          <span>Your email</span>
          <input name="email" type="email" required autoComplete="email" />
        </label>
      </div>
      <label className="contact-field">
        <span>Message</span>
        <textarea name="message" rows="4" required />
      </label>
      {/* Bots fill hidden fields in; people don't. Formspree and Web3Forms both
          read _gotcha as a honeypot and drop anything that arrives with it. */}
      <input type="text" name="_gotcha" tabIndex="-1" aria-hidden="true" className="contact-trap" />
      <div className="contact-actions">
        <button className="btn primary" type="submit" disabled={state === "sending"}>
          {state === "sending" ? "Sending…" : "Send"}
        </button>
        {state === "error" && (
          <span className="contact-error" role="alert">
            That didn't go through. Email me at {email} instead.
          </span>
        )}
      </div>
    </form>
  );
}
