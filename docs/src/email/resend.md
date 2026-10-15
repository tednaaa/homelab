# Resend

[Resend](https://resend.com) sends app emails over SMTP - free for 3,000 emails per month, 100 per day.

- no postal address in every email, unlike Brevo
- has SDKs, but plain SMTP is enough - any app with SMTP settings sends through it

## DNS records

Without them Gmail and others put the mail in spam - they can't tell the email really came from your domain.

- SPF - which servers may send mail for the domain, here Resend
- DKIM - Resend signs every email, the public key in DNS proves it wasn't forged
- DMARC - what receivers do when SPF or DKIM fails, `p=none` delivers anyway and sends reports

### Add the domain

In the Resend dashboard, `Domains` → `Add Domain`, enter the app's own subdomain, e.g. `app.example.com`, never the root domain.

> a damaged sending reputation then stays on the subdomain

### Copy the records

The Resend domain page lists the records with their values. At the DNS provider of the root domain, `Create Record` for each:

#### DKIM

| Type  | Name             | Content          | TTL    |
| ----- | ---------------- | ---------------- | ------ |
| `TXT` | copy from Resend | copy from Resend | `3600` |

#### SPF

| Type    | Name             | Content          | TTL    |
| ------- | ---------------- | ---------------- | ------ |
| `CNAME` | copy from Resend | copy from Resend | `3600` |
| `CNAME` | copy from Resend | copy from Resend | `3600` |

#### DMARC

Marked optional - add it anyway, Gmail and Yahoo expect it.

| Type  | Name             | Content          | TTL    |
| ----- | ---------------- | ---------------- | ------ |
| `TXT` | copy from Resend | copy from Resend | `3600` |

#### Pasting

- `Name` goes into DigitalOcean's `Hostname` as is - it appends the root domain
- `Content` copied with Resend's copy button - the dashboard shortens it with `[...]`
- `TXT` content pasted without quotes
- Resend has changed these records before - if its list differs, follow it

> if the DNS provider wants the full name, append the root domain to the `Name`

> after some weeks without delivery problems, tighten DMARC to `p=quarantine`

### Verify

Click `Verify` in Resend - records take minutes to hours to show up.

> until then Resend sends only from `onboarding@resend.dev` to the account's own email

## Tracking

In the Resend domain settings turn off click and open tracking.

- click tracking rewrites links through Resend's domain - spam filters dislike the mismatch
- open tracking adds a hidden pixel - useless for transactional mail

## SMTP

The API key from `API keys` in the Resend dashboard is the SMTP password - Resend shows it once:

```toml
host = "smtp.resend.com"
port = 465 # implicit TLS, or 587 with STARTTLS
username = "resend"
password = "re_..."
from = "app <noreply@app.example.com>"
```

> `from` must be on the verified domain

## Check

Send a real email to Gmail, open `Show original` - all three must say `PASS`:

```
SPF:   PASS
DKIM:  PASS
DMARC: PASS
```
