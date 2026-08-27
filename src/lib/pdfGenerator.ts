export interface PrescriptionData {
  clinicName: string;
  clinicCrmv?: string;
  clinicAddress?: string;
  clinicPhone?: string;
  tutorName: string;
  petName: string;
  petSpecies: string;
  vetName: string;
  crmv: string;
  date: string;
  medications: Array<{
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    notes?: string;
  }>;
  observations?: string;
}

export const generatePrescriptionPDF = (data: PrescriptionData) => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const medsHTML = data.medications.map((m, idx) => `
    <div style="margin-bottom: 16px; padding-bottom: 12px; border-bottom: 1px dashed #e2e8f0;">
      <div style="font-weight: 700; font-size: 15px; color: #1e293b;">${idx + 1}. ${m.name}</div>
      <div style="font-size: 13px; color: #475569; margin-top: 4px;">
        <strong>Dose:</strong> ${m.dosage} | <strong>Frequência:</strong> ${m.frequency} | <strong>Duração:</strong> ${m.duration}
      </div>
      ${m.notes ? `<div style="font-size: 12px; color: #64748b; margin-top: 4px; font-style: italic;">* ${m.notes}</div>` : ''}
    </div>
  `).join('');

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Receita Médica Veterinária - ${data.petName}</title>
        <meta charset="utf-8" />
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
          body {
            font-family: 'Inter', sans-serif;
            margin: 0;
            padding: 40px;
            color: #0f172a;
            background: #ffffff;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 2px solid #57534e;
            padding-bottom: 20px;
            margin-bottom: 24px;
          }
          .title {
            font-size: 22px;
            font-weight: 700;
            color: #44403c;
            letter-spacing: -0.5px;
          }
          .subtitle {
            font-size: 12px;
            color: #78716c;
            margin-top: 4px;
          }
          .patient-box {
            background: #f5f5f4;
            border-radius: 8px;
            padding: 16px 20px;
            margin-bottom: 28px;
            display: flex;
            justify-content: space-between;
            font-size: 13px;
          }
          .prescription-title {
            font-size: 16px;
            font-weight: 700;
            color: #292524;
            margin-bottom: 16px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .meds-container {
            min-height: 320px;
          }
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e7e5e4;
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
          }
          .signature-box {
            text-align: center;
            width: 240px;
          }
          .signature-line {
            border-top: 1px solid #44403c;
            margin-bottom: 8px;
          }
          @media print {
            body { padding: 20px; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="no-print" style="margin-bottom: 20px; text-align: right;">
          <button onclick="window.print()" style="background: #57534e; color: white; border: none; padding: 10px 20px; font-weight: 600; border-radius: 6px; cursor: pointer;">
            🖨️ Imprimir / Salvar PDF
          </button>
        </div>

        <div class="header">
          <div>
            <div class="title">🐾 ${data.clinicName}</div>
            <div class="subtitle">${data.clinicAddress || 'Clínica Veterinária & Estética Pet'} ${data.clinicPhone ? ' • Tel: ' + data.clinicPhone : ''}</div>
          </div>
          <div style="text-align: right;">
            <div style="font-weight: 600; font-size: 14px; color: #57534e;">RECEITUÁRIO VETERINÁRIO</div>
            <div style="font-size: 12px; color: #a8a29e; margin-top: 2px;">Data: ${data.date}</div>
          </div>
        </div>

        <div class="patient-box">
          <div>
            <strong>Paciente (Pet):</strong> ${data.petName} (${data.petSpecies})
          </div>
          <div>
            <strong>Tutor:</strong> ${data.tutorName}
          </div>
        </div>

        <div class="prescription-title">💊 Prescrição Médica</div>

        <div class="meds-container">
          ${medsHTML}
          ${data.observations ? `
            <div style="margin-top: 24px; padding: 12px; background: #fffbeb; border-left: 4px solid #f59e0b; border-radius: 4px; font-size: 12px; color: #92400e;">
              <strong>Observações Veterinárias:</strong> ${data.observations}
            </div>
          ` : ''}
        </div>

        <div class="footer">
          <div style="font-size: 11px; color: #a8a29e;">
            Documento gerado eletronicamente via PetSanny System.<br/>
            Autenticidade garantida pelo profissional assinante.
          </div>
          <div class="signature-box">
            <div class="signature-line"></div>
            <div style="font-weight: 600; font-size: 13px; color: #292524;">${data.vetName}</div>
            <div style="font-size: 11px; color: #78716c;">CRMV: ${data.crmv}</div>
          </div>
        </div>
      </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
};
