const BRAND = {
  navy: '#0f172a',
  gold: '#6366f1',
  coral: '#10b981',
  white: '#FFFFFF',
  lightGray: '#F4F6F8',
  textDark: '#1A1A2E',
  textMuted: '#6B7280',
}

function baseTemplate(content: string): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>Inmoxil</title>
</head>
<body style="margin:0;padding:0;background-color:${BRAND.lightGray};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${BRAND.lightGray};">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
          <!-- Logo -->
          <tr>
            <td align="center" style="padding-bottom:24px;">
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background-color:${BRAND.navy};border-radius:12px;padding:8px 16px;">
                    <span style="font-size:28px;font-weight:800;color:${BRAND.gold};letter-spacing:-1px;">Ix</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Card -->
          <tr>
            <td>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${BRAND.white};border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(15,43,70,0.08);">
                <!-- Accent Bar -->
                <tr>
                  <td style="height:4px;background:linear-gradient(90deg,${BRAND.navy},${BRAND.gold},${BRAND.coral});"></td>
                </tr>
                <!-- Content -->
                <tr>
                  <td style="padding:40px 40px 32px;">
                    ${content}
                  </td>
                </tr>
                <!-- Footer -->
                <tr>
                  <td style="padding:24px 40px;background-color:${BRAND.lightGray};border-top:1px solid #E5E7EB;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td>
                          <p style="margin:0;font-size:12px;color:${BRAND.textMuted};line-height:1.6;">
                            &copy; ${new Date().getFullYear()} Inmoxil. Todos los derechos reservados.<br/>
                            <a href="https://inmoxil.com" style="color:${BRAND.gold};text-decoration:none;">inmoxil.com</a>
                            &nbsp;&bull;&nbsp;
                            <a href="https://inmoxil.com/privacidad" style="color:${BRAND.textMuted};text-decoration:none;">Privacidad</a>
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

function btn(href: string, label: string): string {
  return `<a href="${href}" style="display:inline-block;background-color:${BRAND.gold};color:${BRAND.navy};font-weight:700;font-size:15px;padding:14px 32px;border-radius:10px;text-decoration:none;text-align:center;">
    ${label}
  </a>`
}

function stepRow(num: number, text: string): string {
  return `<tr>
    <td style="padding:10px 0;vertical-align:top;">
      <table role="presentation" cellpadding="0" cellspacing="0">
        <tr>
          <td style="background-color:${BRAND.navy};color:${BRAND.white};font-weight:700;font-size:13px;width:28px;height:28px;border-radius:50%;text-align:center;line-height:28px;">${num}</td>
          <td style="padding-left:12px;font-size:14px;color:${BRAND.textDark};line-height:28px;">${text}</td>
        </tr>
      </table>
    </td>
  </tr>`
}

export function welcomeEmailTemplate(name: string): string {
  const content = `
    <h1 style="margin:0 0 8px;font-size:24px;font-weight:800;color:${BRAND.navy};">
      Bienvenido a Inmoxil 👋
    </h1>
    <p style="margin:0 0 24px;font-size:15px;color:${BRAND.textMuted};line-height:1.6;">
      Hola <strong style="color:${BRAND.textDark};">${name}</strong>, tu cuenta ya está activa. Potenciá tu negocio inmobiliario con nuestra plataforma de scraping, ads y gestión de propiedades.
    </p>

    <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;margin-bottom:28px;">
      <tr><td style="padding:0 0 4px;font-size:13px;font-weight:700;color:${BRAND.navy};text-transform:uppercase;letter-spacing:1px;">Primeros pasos</td></tr>
      ${stepRow(1, 'Completá tu brand kit con colores y logo')}
      ${stepRow(2, 'Scrapeá propiedades de portales inmobiliarios')}
      ${stepRow(3, 'Generá anuncios profesionales con IA')}
    </table>

    <div style="text-align:center;margin:32px 0;">
      ${btn('https://inmoxil.com/dashboard', 'Ir al Dashboard →')}
    </div>

    <p style="margin:0;font-size:13px;color:${BRAND.textMuted};line-height:1.6;">
      Si tenés alguna consulta, respondé este email o escribinos a <a href="mailto:hola@inmoxil.com" style="color:${BRAND.coral};text-decoration:none;">hola@inmoxil.com</a>
    </p>
  `
  return baseTemplate(content)
}

export function paymentConfirmationTemplate(name: string, plan: string, amount: number): string {
  const content = `
    <h1 style="margin:0 0 8px;font-size:24px;font-weight:800;color:${BRAND.navy};">
      Pago confirmado ✅
    </h1>
    <p style="margin:0 0 24px;font-size:15px;color:${BRAND.textMuted};line-height:1.6;">
      Hola <strong style="color:${BRAND.textDark};">${name}</strong>, procesamos tu pago exitosamente. Tu plan ya está activo.
    </p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${BRAND.lightGray};border-radius:12px;margin-bottom:24px;">
      <tr>
        <td style="padding:24px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding:0 0 12px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="font-size:13px;color:${BRAND.textMuted};">Plan</td>
                    <td align="right" style="font-size:15px;font-weight:700;color:${BRAND.textDark};">${plan}</td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:0 0 12px;border-top:1px solid #E5E7EB;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding-top:12px;font-size:13px;color:${BRAND.textMuted};">Monto</td>
                    <td align="right" style="padding-top:12px;font-size:22px;font-weight:800;color:${BRAND.gold};">$${amount} USD</td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:0;border-top:1px solid #E5E7EB;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding-top:12px;font-size:13px;color:${BRAND.textMuted};">Próxima facturación</td>
                    <td align="right" style="padding-top:12px;font-size:14px;font-weight:600;color:${BRAND.textDark};">En 30 días</td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <div style="text-align:center;margin:32px 0;">
      ${btn('https://inmoxil.com/dashboard/billing', 'Ver Facturación →')}
    </div>

    <p style="margin:0;font-size:13px;color:${BRAND.textMuted};line-height:1.6;">
      Tu recibo está disponible en tu panel de facturación. Si tenés dudas, contactanos.
    </p>
  `
  return baseTemplate(content)
}

export function passwordResetTemplate(name: string, resetUrl: string): string {
  const content = `
    <h1 style="margin:0 0 8px;font-size:24px;font-weight:800;color:${BRAND.navy};">
      Restablecer contraseña
    </h1>
    <p style="margin:0 0 24px;font-size:15px;color:${BRAND.textMuted};line-height:1.6;">
      Hola <strong style="color:${BRAND.textDark};">${name}</strong>, recibimos un pedido para restablecer tu contraseña.
    </p>

    <div style="text-align:center;margin:32px 0;">
      ${btn(resetUrl, 'Restablecer contraseña →')}
    </div>

    <p style="margin:0 0 16px;font-size:13px;color:${BRAND.textMuted};line-height:1.6;">
      Este enlace expira en <strong>1 hora</strong>. Si no pediste este cambio, ignorá este email.
    </p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${BRAND.lightGray};border-radius:8px;margin-top:24px;">
      <tr>
        <td style="padding:16px;">
          <p style="margin:0;font-size:12px;color:${BRAND.textMuted};word-break:break-all;">
            Si el botón no funciona, copiá y pegá este enlace en tu navegador:<br/>
            <a href="${resetUrl}" style="color:${BRAND.coral};text-decoration:none;">${resetUrl}</a>
          </p>
        </td>
      </tr>
    </table>
  `
  return baseTemplate(content)
}

export function lowCreditsTemplate(name: string, creditsRemaining: number): string {
  const content = `
    <h1 style="margin:0 0 8px;font-size:24px;font-weight:800;color:${BRAND.navy};">
      Créditos bajos ⚠️
    </h1>
    <p style="margin:0 0 24px;font-size:15px;color:${BRAND.textMuted};line-height:1.6;">
      Hola <strong style="color:${BRAND.textDark};">${name}</strong>, te informamos que tu saldo de créditos es bajo.
    </p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#FEF3E0;border-radius:12px;margin-bottom:24px;">
      <tr>
        <td style="padding:24px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td>
                <p style="margin:0 0 4px;font-size:13px;color:${BRAND.textMuted};">Créditos restantes</p>
                <p style="margin:0;font-size:36px;font-weight:800;color:${BRAND.coral};line-height:1;">${creditsRemaining}</p>
              </td>
              <td align="right" style="vertical-align:bottom;">
                <p style="margin:0;font-size:12px;color:${BRAND.textMuted};">Actualizá tu plan para seguir generando propiedades y anuncios</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <div style="text-align:center;margin:32px 0;">
      ${btn('https://inmoxil.com/dashboard/billing', 'Mejorar Plan →')}
    </div>

    <p style="margin:0;font-size:13px;color:${BRAND.textMuted};line-height:1.6;">
      Los créditos se renuevan automáticamente cada mes según tu plan actual.
    </p>
  `
  return baseTemplate(content)
}
