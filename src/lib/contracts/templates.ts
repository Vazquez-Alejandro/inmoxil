import type { ContractData, ContractType } from './types'
import { formatCurrency, formatDateLong } from '@/lib/ipc-icl/formulas'

function baseHtml(title: string, subtitle: string, content: string, documentId: string): string {
  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><title>${title}</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Georgia','Times New Roman',serif;font-size:12pt;line-height:1.6;color:#1a1a1a;max-width:210mm;margin:0 auto;padding:30mm 25mm;background:#fff}
.header{text-align:center;border-bottom:3px solid #0f172a;padding-bottom:20px;margin-bottom:30px}
.header h1{font-size:20pt;font-weight:bold;color:#0f172a;margin-bottom:8px;text-transform:uppercase;letter-spacing:1px}
.header .subtitle{font-size:13pt;color:#6366f1;font-style:italic}
.section{margin-bottom:24px}
.section-title{font-size:13pt;font-weight:bold;color:#0f172a;text-transform:uppercase;border-bottom:1px solid #e2e8f0;padding-bottom:6px;margin-bottom:14px;letter-spacing:.5px}
.clause{margin-bottom:14px;text-align:justify}
.clause-number{font-weight:bold;color:#334155;margin-right:8px}
.field{display:inline-block;border-bottom:1px solid #0f172a;min-width:180px;padding:2px 4px;margin:0 4px;font-weight:500;color:#0f172a}
.field-small{min-width:100px}
.field-large{min-width:300px}
.two-column{display:flex;gap:40px;margin-bottom:16px}
.two-column>div{flex:1}
.signature-block{margin-top:50px;display:flex;justify-content:space-between;gap:40px}
.signature-line{flex:1;text-align:center}
.signature-line .line{border-top:1px solid #0f172a;height:40px;margin-bottom:6px}
.signature-line .label{font-size:10pt;color:#64748b;text-transform:uppercase;letter-spacing:.5px}
.signature-line .name{font-weight:bold;font-size:11pt;color:#0f172a;margin-top:4px}
.footer-note{margin-top:40px;padding-top:20px;border-top:1px dashed #cbd5e1;font-size:9pt;color:#64748b;text-align:center}
.highlight-box{background:#f8fafc;border:1px solid #e2e8f0;border-left:4px solid #6366f1;padding:14px;margin:16px 0;border-radius:0 4px 4px 0}
.amount-box{background:#f0fdf4;border:1px solid #86efac;border-left:4px solid #10b981;padding:14px;margin:16px 0;border-radius:0 4px 4px 0;text-align:center}
.amount-box .label{font-size:10pt;color:#065f46;text-transform:uppercase;letter-spacing:.5px;margin-bottom:4px}
.amount-box .value{font-size:18pt;font-weight:bold;color:#065f46}
table{width:100%;border-collapse:collapse;margin:16px 0}
th,td{border:1px solid #e2e8f0;padding:10px 12px;text-align:left}
th{background:#f1f5f9;font-weight:bold;color:#0f172a;font-size:10pt}
td{font-size:11pt}
@media print{body{padding:0;max-width:none}}
</style></head><body>
<div class="header"><h1>${title}</h1><div class="subtitle">${subtitle}</div></div>
${content}
<div class="footer-note">Documento generado por Inmoxil \u00b7 ${new Date().toLocaleDateString('es-AR')} \u00b7 ID: ${documentId}</div>
</body></html>`
}

function field(value: string | number | null | undefined, cls = ''): string {
  return `<span class="field ${cls}">${value ?? '....................'}</span>`
}

function signatureBlock(label: string, name: string, doc: string): string {
  return `<div class="signature-line"><div class="line"></div><div class="label">${label}</div><div class="name">${name}</div><div class="dni">${doc}</div></div>`
}

export function renderContractHtml(data: ContractData): string {
  const renderers: Record<ContractType, () => string> = {
    alquiler: () => renderAlquiler(data),
    garantia_propietaria: () => renderGarantiaPropietaria(data),
    seguro_caucion: () => renderSeguroCaucion(data),
    renuncia_derechos: () => renderRenunciaDerechos(data),
    comodato_precario: () => renderComodatoPrecario(data),
  }
  const render = renderers[data.type] || renderers.alquiler
  return baseHtml(data.title, getSubtitle(data.type), render(), data.id || 'draft')
}

function getSubtitle(type: ContractType): string {
  const map: Record<ContractType, string> = {
    alquiler: 'Contrato de Locación de Inmueble',
    garantia_propietaria: 'Garantía Propietaria',
    seguro_caucion: 'Seguro de Caución',
    renuncia_derechos: 'Renuncia de Derechos',
    comodato_precario: 'Contrato de Comodato Precario',
  }
  return map[type]
}

function renderParties(data: ContractData): string {
  const { lessor, lessee, property } = data
  return `
  <div class="section">
    <div class="section-title">Comparecientes</div>
    <div class="clause"><span class="clause-number">Locador:</span> ${lessor.fullName}, ${lessor.documentType} N° ${lessor.documentNumber}, con domicilio en ${lessor.address || property.address}.</div>
    <div class="clause"><span class="clause-number">Locatario:</span> ${lessee.fullName}, ${lessee.documentType} N° ${lessee.documentNumber}, con domicilio en ${lessee.address || 'constituido en el inmueble'}.</div>
    <div class="clause"><span class="clause-number">Inmueble:</span> ${property.address}, ${property.city}, ${property.province}${property.cpa ? ` (CPA: ${property.cpa})` : ''}.</div>
  </div>`
}

function renderFinancialBox(data: ContractData): string {
  const { financial } = data
  const adjLabel = financial.adjustmentIndex === 'NONE' ? 'Sin ajuste' : financial.adjustmentIndex
  return `
  <div class="amount-box">
    <div class="label">Precio del contrato</div>
    <div class="value">${formatCurrency(financial.amount, financial.currency)}/${financial.currency === 'ARS' ? 'mes' : 'mes'}</div>
    ${financial.adjustmentIndex !== 'NONE' ? `<div style="margin-top:8px;font-size:10pt;color:#065f46">Ajuste por ${adjLabel} cada ${financial.adjustmentFrequencyMonths} meses</div>` : ''}
    ${financial.depositAmount ? `<div style="margin-top:4px;font-size:10pt;color:#065f46">Depósito: ${formatCurrency(financial.depositAmount, financial.currency)}</div>` : ''}
    ${financial.expensesIncluded ? `<div style="margin-top:4px;font-size:10pt;color:#065f46">Expensas incluidas${financial.expensesAmount ? ` (${formatCurrency(financial.expensesAmount, financial.currency)})` : ''}</div>` : '<div style="margin-top:4px;font-size:10pt;color:#ea580c">Expensas NO incluidas</div>'}
  </div>`
}

function renderAlquiler(data: ContractData): string {
  const { lessor, lessee, property, financial } = data
  const start = formatDateLong(data.startDate)
  const end = formatDateLong(data.endDate)

  return `
  ${renderParties(data)}
  ${renderFinancialBox(data)}

  <div class="section">
    <div class="section-title">Cláusulas</div>

    <div class="clause">
      <span class="clause-number">PRIMERA:</span> El locador da en locación al locatario, quien acepta, el inmueuble sito en ${property.address}, ${property.city}, ${property.province}, para ser destinado exclusivamente a vivienda familiar. El plazo de locación se establece en ${data.durationMonths} meses, desde el ${start} hasta el ${end}.
    </div>

    <div class="clause">
      <span class="clause-number">SEGUNDA:</span> El locatario se obliga a pagar como contraprestación la suma de ${formatCurrency(financial.amount, financial.currency)} mensuales, en efectivo, mediante depósito/transferencia bancaria en la cuenta que el locador indique, dentro de los primeros cinco (5) días de cada mes.
    </div>

    ${financial.adjustmentIndex !== 'NONE' ? `
    <div class="clause">
      <span class="clause-number">TERCERA:</span> El precio del alquiler se ajustará cada ${financial.adjustmentFrequencyMonths} meses conforme al Índice de ${financial.adjustmentIndex === 'IPC' ? 'Precios al Consumidor (IPC)' : 'Contratos de Locación (ICL)'} publicado por el INDEC/BCRA. La variación se calculará aplicando la fórmula oficial: Nuevo Valor = Valor Anterior × (Índice Actual / Índice Anterior). El locador deberá notificar fehacientemente el nuevo valor al locatario con al menos 30 días de anticipación.
    </div>
    <div class="clause">
      <span class="clause-number">CUARTA:</span> Las partes acuerdan que el primer ajuste operará a los ${financial.adjustmentFrequencyMonths} meses contados desde la fecha de inicio del contrato, y los sucesivos cada igual período.
    </div>` : ''}

    <div class="clause">
      <span class="clause-number">${financial.adjustmentIndex !== 'NONE' ? 'QUINTA' : 'TERCERA'}:</span> El locatario deposita en este acto la suma de ${formatCurrency(financial.depositAmount || 0, financial.currency)} en concepto de depósito en garantía, que será devuelto al finalizar el contrato, previa constatación del buen estado del inmueble y previa deducción de los gastos que correspondan.
    </div>

    <div class="clause">
      <span class="clause-number">${financial.adjustmentIndex !== 'NONE' ? 'SEXTA' : 'CUARTA'}:</span> El locatario se obliga a: a) Destinar el inmueble exclusivamente a vivienda familiar; b) Pagar puntualmente el canon locativo; c) Pagar las expensas ordinarias ${financial.expensesIncluded ? '(incluidas en el canon)' : '(adicionales al canon)'}; d) Conservar el inmueble en buen estado; e) Permitir la revisión del inmueble previa notificación; f) No introducir modificaciones sin autorización escrita del locador.
    </div>

    <div class="clause">
      <span class="clause-number">${financial.adjustmentIndex !== 'NONE' ? 'SÉPTIMA' : 'QUINTA'}:</span> El locador será responsable de: a) Mantener el inmueble en condiciones de habitabilidad; b) Realizar las reparaciones estructurales necesarias; c) Garantizar el uso pacífico del inmueble; d) Abonar las expensas extraordinarias.
    </div>

    <div class="clause">
      <span class="clause-number">${financial.adjustmentIndex !== 'NONE' ? 'OCTAVA' : 'SEXTA'}:</span> En caso de mora en el pago del canon, se aplicará un interés equivalente al que cobra el Banco de la Nación Argentina para operaciones de descuento de documentos, más un 2% mensual punitorio. La falta de pago de DOS (2) meses consecutivos dará derecho al locador a resolver el contrato.
    </div>

    <div class="clause">
      <span class="clause-number">${financial.adjustmentIndex !== 'NONE' ? 'NOVENA' : 'SÉPTIMA'}:</span> Cualquier controversia será sometida a los Tribunales Ordinarios de la Ciudad de ${property.city}, renunciando las partes a cualquier otro fuero o jurisdicción.
    </div>
  </div>

  <div class="section">
    <div class="section-title">Firmas</div>
    <p style="margin-bottom:20px;text-align:justify">Las partes firman el presente contrato en ${data.property.city} a los ${new Date().getDate()} días del mes de ${new Date().toLocaleDateString('es-AR', { month: 'long' })} de ${new Date().getFullYear()}.</p>
    <div class="signature-block">
      ${signatureBlock('Locador', lessor.fullName, lessor.documentType + ' ' + lessor.documentNumber)}
      ${signatureBlock('Locatario', lessee.fullName, lessee.documentType + ' ' + lessee.documentNumber)}
    </div>
  </div>`
}

function renderGarantiaPropietaria(data: ContractData): string {
  const { lessor, lessee, property, financial } = data
  return `
  <div class="section">
    <div class="section-title">Comparecientes</div>
    <div class="clause">${lessor.fullName}, ${lessor.documentType} N° ${lessor.documentNumber}, en adelante "el Garante", constituye garantía propietaria a favor de ${lessee.fullName}, ${lessee.documentType} N° ${lessee.documentNumber}, en relación al inmueble sito en ${property.address}, ${property.city}.</div>
  </div>
  ${renderFinancialBox(data)}
  <div class="section">
    <div class="section-title">Cláusulas</div>
    <div class="clause"><span class="clause-number">PRIMERA:</span> El Garante garantiza con el inmueble de su propiedad sito en ${data.guarantor?.address || property.address} el cumplimiento de las obligaciones del contrato de locación.</div>
    <div class="clause"><span class="clause-number">SEGUNDA:</span> Esta garantía se mantendrá vigente durante todo el plazo locativo y sus renovaciones.</div>
    <div class="clause"><span class="clause-number">TERCERA:</span> El Garante se obliga solidariamente al pago de cánones locativos y daños.</div>
  </div>
  <div class="signature-block">
    ${signatureBlock('Garante', lessor.fullName, lessor.documentType + ' ' + lessor.documentNumber)}
    ${signatureBlock('Locatario', lessee.fullName, lessee.documentType + ' ' + lessee.documentNumber)}
  </div>`
}

function renderSeguroCaucion(data: ContractData): string {
  const { lessor, lessee, property, financial } = data
  return `
  <div class="section">
    <div class="section-title">Partes</div>
    <div class="clause">Tomador: ${lessee.fullName}, ${lessee.documentType} N° ${lessee.documentNumber}.</div>
    <div class="clause">Asegurado: ${lessor.fullName}, ${lessor.documentType} N° ${lessor.documentNumber}.</div>
    <div class="clause">Inmueble: ${property.address}, ${property.city}.</div>
  </div>
  ${renderFinancialBox(data)}
  <div class="section">
    <div class="section-title">Cláusulas</div>
    <div class="clause"><span class="clause-number">PRIMERA:</span> El Tomador contrata un seguro de caución a favor del Asegurado por la suma equivalente a ${formatCurrency(financial.amount * (financial.depositAmount ? 1 : 1), financial.currency)}.</div>
    <div class="clause"><span class="clause-number">SEGUNDA:</span> La póliza cubre el impago de alquileres y daños al inmueble.</div>
  </div>
  <div class="signature-block">
    ${signatureBlock('Tomador', lessee.fullName, lessee.documentType + ' ' + lessee.documentNumber)}
    ${signatureBlock('Asegurado', lessor.fullName, lessor.documentType + ' ' + lessor.documentNumber)}
  </div>`
}

function renderRenunciaDerechos(data: ContractData): string {
  const { lessee, property } = data
  return `
  <div class="section">
    <div class="section-title">Compareciente</div>
    <div class="clause">${lessee.fullName}, ${lessee.documentType} N° ${lessee.documentNumber}, en adelante "el Renunciante", manifiesta su voluntad de desocupar el inmueble sito en ${property.address}, ${property.city}.</div>
  </div>
  <div class="section">
    <div class="section-title">Cláusulas</div>
    <div class="clause"><span class="clause-number">PRIMERA:</span> El Renunciante renuncia voluntariamente a todo derecho sobre el inmueble.</div>
    <div class="clause"><span class="clause-number">SEGUNDA:</span> Se compromete a desocupar y entregar el inmueble libre de personas y cosas en un plazo máximo de 30 días corridos.</div>
    <div class="clause"><span class="clause-number">TERCERA:</span> Renuncia a cualquier reclamo judicial o extrajudicial.</div>
  </div>
  <div class="signature-block">
    ${signatureBlock('Renunciante', lessee.fullName, lessee.documentType + ' ' + lessee.documentNumber)}
  </div>`
}

function renderComodatoPrecario(data: ContractData): string {
  const { lessor, lessee, property } = data
  return `
  <div class="section">
    <div class="section-title">Comparecientes</div>
    <div class="clause">Comodante: ${lessor.fullName}, ${lessor.documentType} N° ${lessor.documentNumber}.</div>
    <div class="clause">Comodatario: ${lessee.fullName}, ${lessee.documentType} N° ${lessee.documentNumber}.</div>
    <div class="clause">Inmueble: ${property.address}, ${property.city}, ${property.province}.</div>
  </div>
  <div class="section">
    <div class="section-title">Cláusulas</div>
    <div class="clause"><span class="clause-number">PRIMERA:</span> El Comodante entrega en comodato el inmueble al Comodatario para su uso gratuito como vivienda.</div>
    <div class="clause"><span class="clause-number">SEGUNDA:</span> El comodato es precario, pudiendo el Comodante solicitarlo en cualquier momento.</div>
    <div class="clause"><span class="clause-number">TERCERA:</span> El Comodatario se obliga a conservar el inmueble y devolverlo en el mismo estado.</div>
  </div>
  <div class="signature-block">
    ${signatureBlock('Comodante', lessor.fullName, lessor.documentType + ' ' + lessor.documentNumber)}
    ${signatureBlock('Comodatario', lessee.fullName, lessee.documentType + ' ' + lessee.documentNumber)}
  </div>`
}