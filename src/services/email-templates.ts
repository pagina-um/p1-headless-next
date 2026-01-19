interface EmailTemplate {
  subject: string;
  htmlBody: string;
  textBody: string;
}

function isProduction(): boolean {
  return process.env.VERCEL_ENV === "production" ||
    (process.env.NODE_ENV === "production" && !process.env.VERCEL_ENV);
}

function formatSubject(subject: string): string {
  return isProduction() ? subject : `[TESTE] ${subject}`;
}

export function getSingleDonationTemplate(
  donorName: string,
  amount: number
): EmailTemplate {
  const subject = formatSubject("Obrigado pela sua contribuição - Página UM");

  const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Georgia, serif; font-size: 18px; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; margin-bottom: 30px;">
    <img src="https://paginaum.pt/icon.png" alt="Página UM" width="80" style="display: block; margin: 0 auto 15px;" />
  </div>

  <p>Caro/a ${donorName},</p>

  <p>Muito obrigado pela sua contribuição de <strong>${amount}€</strong>.</p>

  <p>O seu apoio é fundamental para mantermos o nosso trabalho de jornalismo independente. Cada contribuição faz diferença e permite-nos continuar a fazer jornalismo sem fretes.</p>

  <p>Guardamos este apoio na nossa memória e continuaremos a trabalhar para merecer a sua confiança.</p>

  <p style="margin-top: 30px;">Com os melhores cumprimentos,<br>
  <strong>A equipa da Página UM</strong></p>

  <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">

  <p style="font-size: 12px; color: #666;">
    Se precisar de fatura, envie email para <a href="mailto:facturas@paginaum.pt">facturas@paginaum.pt</a>.<br>
    Questões? Contacte-nos em <a href="mailto:geral@paginaum.pt">geral@paginaum.pt</a>
  </p>
</body>
</html>`;

  const textBody = `Caro/a ${donorName},

Muito obrigado pela sua contribuição de ${amount}€.

O seu apoio é fundamental para mantermos o nosso trabalho de jornalismo independente. Cada contribuição faz diferença e permite-nos continuar a fazer jornalismo sem fretes.

Guardamos este apoio na nossa memória e continuaremos a trabalhar para merecer a sua confiança.

Com os melhores cumprimentos,
A equipa da Página UM

---
Se precisar de fatura, envie email para facturas@paginaum.pt.
Questões? Contacte-nos em geral@paginaum.pt`;

  return { subject, htmlBody, textBody };
}

export function getSubscriptionWelcomeTemplate(
  donorName: string,
  amount: number
): EmailTemplate {
  const subject = formatSubject("Bem-vindo/a à comunidade de apoiantes - Página UM");

  const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Georgia, serif; font-size: 18px; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; margin-bottom: 30px;">
    <img src="https://paginaum.pt/icon.png" alt="Página UM" width="80" style="display: block; margin: 0 auto 15px;" />
  </div>

  <p>Caro/a ${donorName},</p>

  <p>Muito obrigado por se tornar apoiante mensal da Página UM!</p>

  <p>A sua subscrição de <strong>${amount}€/mês</strong> foi ativada com sucesso. Este compromisso regular é extremamente valioso para nós — permite-nos planear e investir no jornalismo que fazemos.</p>

  <p>A partir de agora, será debitado automaticamente todos os meses. Pode gerir ou cancelar a sua subscrição a qualquer momento contactando-nos.</p>

  <p style="margin-top: 30px;">Com os melhores cumprimentos,<br>
  <strong>A equipa da Página UM</strong></p>

  <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">

  <p style="font-size: 12px; color: #666;">
    Para gerir a sua subscrição ou pedir fatura: <a href="mailto:geral@paginaum.pt">geral@paginaum.pt</a>
  </p>
</body>
</html>`;

  const textBody = `Caro/a ${donorName},

Muito obrigado por se tornar apoiante mensal da Página UM!

A sua subscrição de ${amount}€/mês foi ativada com sucesso. Este compromisso regular é extremamente valioso para nós — permite-nos planear e investir no jornalismo que fazemos.

A partir de agora, será debitado automaticamente todos os meses. Pode gerir ou cancelar a sua subscrição a qualquer momento contactando-nos.

Com os melhores cumprimentos,
A equipa da Página UM

---
Para gerir a sua subscrição ou pedir fatura: geral@paginaum.pt`;

  return { subject, htmlBody, textBody };
}

export function getMultibancoPaymentTemplate(
  donorName: string,
  amount: number,
  entity: string,
  reference: string,
  expiresAt: string
): EmailTemplate {
  const subject = formatSubject("Dados para pagamento Multibanco - Página UM");

  const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Georgia, serif; font-size: 18px; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; margin-bottom: 30px;">
    <img src="https://paginaum.pt/icon.png" alt="Página UM" width="80" style="display: block; margin: 0 auto 15px;" />
  </div>

  <p>Caro/a ${donorName},</p>

  <p>Obrigado por escolher apoiar a Página UM. Para completar a sua contribuição de <strong>${amount}€</strong>, utilize os seguintes dados num Multibanco ou no seu homebanking:</p>

  <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
    <p style="margin: 10px 0;"><strong>Entidade:</strong> ${entity}</p>
    <p style="margin: 10px 0;"><strong>Referência:</strong> ${reference}</p>
    <p style="margin: 10px 0;"><strong>Valor:</strong> ${amount}€</p>
  </div>

  <p style="font-size: 14px; color: #666;">Esta referência é válida até ${expiresAt}.</p>

  <p>Assim que o pagamento for processado, receberá um email de confirmação.</p>

  <p style="margin-top: 30px;">Com os melhores cumprimentos,<br>
  <strong>A equipa da Página UM</strong></p>

  <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">

  <p style="font-size: 12px; color: #666;">
    Questões? Contacte-nos em <a href="mailto:geral@paginaum.pt">geral@paginaum.pt</a>
  </p>
</body>
</html>`;

  const textBody = `Caro/a ${donorName},

Obrigado por escolher apoiar a Página UM. Para completar a sua contribuição de ${amount}€, utilize os seguintes dados num Multibanco ou no seu homebanking:

Entidade: ${entity}
Referência: ${reference}
Valor: ${amount}€

Esta referência é válida até ${expiresAt}.

Assim que o pagamento for processado, receberá um email de confirmação.

Com os melhores cumprimentos,
A equipa da Página UM

---
Questões? Contacte-nos em geral@paginaum.pt`;

  return { subject, htmlBody, textBody };
}

export function getRecurringPaymentTemplate(
  donorName: string,
  amount: number
): EmailTemplate {
  const subject = formatSubject("Pagamento mensal processado - Página UM");

  const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Georgia, serif; font-size: 18px; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; margin-bottom: 30px;">
    <img src="https://paginaum.pt/icon.png" alt="Página UM" width="80" style="display: block; margin: 0 auto 15px;" />
  </div>

  <p>Caro/a ${donorName},</p>

  <p>Informamos que o seu pagamento mensal de <strong>${amount}€</strong> foi processado com sucesso.</p>

  <p>Obrigado por continuar a apoiar o jornalismo independente.</p>

  <p style="margin-top: 30px;">Com os melhores cumprimentos,<br>
  <strong>A equipa da Página UM</strong></p>

  <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">

  <p style="font-size: 12px; color: #666;">
    Para gerir a sua subscrição: <a href="mailto:geral@paginaum.pt">geral@paginaum.pt</a>
  </p>
</body>
</html>`;

  const textBody = `Caro/a ${donorName},

Informamos que o seu pagamento mensal de ${amount}€ foi processado com sucesso.

Obrigado por continuar a apoiar o jornalismo independente.

Com os melhores cumprimentos,
A equipa da Página UM

---
Para gerir a sua subscrição: geral@paginaum.pt`;

  return { subject, htmlBody, textBody };
}
