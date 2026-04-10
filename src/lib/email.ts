import nodemailer from "nodemailer";
import { prisma } from "./prisma";

interface FormField {
  name: string;
  label: string;
  type: string;
}

export async function sendFormNotification(
  formName: string,
  formDescription: string | null,
  fields: FormField[],
  data: Record<string, string>,
  submittedAt: Date
) {
  // Fetch SMTP settings
  const settings = await prisma.setting.findMany({
    where: {
      key: {
        in: [
          "smtp_host",
          "smtp_port",
          "smtp_user",
          "smtp_pass",
          "smtp_from",
          "notification_email",
          "site_name",
        ],
      },
    },
  });

  const cfg: Record<string, string> = {};
  for (const s of settings) cfg[s.key] = s.value;

  if (!cfg.smtp_host || !cfg.notification_email) return;

  const transporter = nodemailer.createTransport({
    host: cfg.smtp_host,
    port: parseInt(cfg.smtp_port || "587", 10),
    secure: (cfg.smtp_port || "587") === "465",
    auth: cfg.smtp_user ? { user: cfg.smtp_user, pass: cfg.smtp_pass || "" } : undefined,
  });

  const siteName = cfg.site_name || "Nagarathar Sangam KSA";
  const fromEmail = cfg.smtp_from || cfg.smtp_user || "noreply@ksanagaratharsangam.com";
  const dateStr = submittedAt.toLocaleString("en-IN", { dateStyle: "full", timeStyle: "short" });

  // Build field rows
  const fieldRows = fields
    .map((f) => {
      const val = data[f.name] || "—";
      const displayVal = f.type === "textarea" ? val.replace(/\n/g, "<br/>") : val;
      return `
        <tr>
          <td style="padding:12px 16px;border-bottom:1px solid #f0e4cc;font-weight:600;color:#8B6914;font-size:13px;width:35%;vertical-align:top;font-family:'Georgia',serif;">${f.label}</td>
          <td style="padding:12px 16px;border-bottom:1px solid #f0e4cc;color:#2a1f14;font-size:14px;font-family:'Georgia',serif;">${displayVal}</td>
        </tr>`;
    })
    .join("");

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#faf5ea;font-family:'Georgia','Times New Roman',serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#faf5ea;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
          
          <!-- Header Banner -->
          <tr>
            <td style="background:linear-gradient(135deg,#1a1832 0%,#0f0d1a 50%,#1a1832 100%);padding:40px 30px;text-align:center;border-radius:16px 16px 0 0;">
              <div style="font-size:28px;color:#d4af37;font-family:'Georgia',serif;font-weight:bold;letter-spacing:2px;">${siteName}</div>
              <div style="width:80px;height:2px;background:linear-gradient(90deg,transparent,#d4af37,transparent);margin:16px auto;"></div>
              <div style="font-size:12px;color:#d4af3799;letter-spacing:4px;text-transform:uppercase;">New Form Submission</div>
            </td>
          </tr>

          <!-- Form Title Section -->
          <tr>
            <td style="background:#ffffff;padding:30px;border-left:1px solid #f0e4cc;border-right:1px solid #f0e4cc;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:16px 20px;background:linear-gradient(135deg,#fdf6e8,#f5e8c4);border-radius:12px;border-left:4px solid #d4af37;">
                    <div style="font-size:18px;font-weight:bold;color:#8B6914;font-family:'Georgia',serif;">📋 ${formName}</div>
                    ${formDescription ? `<div style="font-size:13px;color:#8B691488;margin-top:6px;">${formDescription}</div>` : ""}
                    <div style="font-size:11px;color:#8B691466;margin-top:8px;letter-spacing:1px;">🕐 ${dateStr}</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Submission Details -->
          <tr>
            <td style="background:#ffffff;padding:0 30px 30px;border-left:1px solid #f0e4cc;border-right:1px solid #f0e4cc;">
              <div style="font-size:11px;color:#c8962e;letter-spacing:3px;text-transform:uppercase;margin-bottom:16px;font-weight:bold;">Submission Details</div>
              <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #f0e4cc;border-radius:12px;overflow:hidden;">
                <tr>
                  <td colspan="2" style="height:3px;background:linear-gradient(90deg,#d4af37,#c8962e,#d4af37);"></td>
                </tr>
                ${fieldRows}
              </table>
            </td>
          </tr>

          <!-- Action Button -->
          <tr>
            <td style="background:#ffffff;padding:0 30px 30px;border-left:1px solid #f0e4cc;border-right:1px solid #f0e4cc;text-align:center;">
              <a href="#" style="display:inline-block;padding:14px 40px;background:linear-gradient(135deg,#d4af37,#c8962e);color:#ffffff;text-decoration:none;border-radius:50px;font-size:14px;font-weight:bold;letter-spacing:1px;font-family:'Georgia',serif;">View in Admin Panel</a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:linear-gradient(135deg,#1a1832 0%,#0f0d1a 100%);padding:24px 30px;text-align:center;border-radius:0 0 16px 16px;">
              <div style="font-size:11px;color:#d4af3766;letter-spacing:2px;">© ${new Date().getFullYear()} ${siteName}</div>
              <div style="font-size:10px;color:#d4af3744;margin-top:4px;">This is an automated notification. Please do not reply.</div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  try {
    await transporter.sendMail({
      from: `"${siteName}" <${fromEmail}>`,
      to: cfg.notification_email,
      subject: `📋 New ${formName} Submission — ${siteName}`,
      html,
    });
  } catch (err) {
    console.error("Email notification failed:", err);
  }
}
