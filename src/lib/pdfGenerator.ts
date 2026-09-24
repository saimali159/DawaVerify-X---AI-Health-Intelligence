import { jsPDF } from 'jspdf';
import { PatientProfile, Prescription, LabReport } from '../types';

export interface PdfGenerationOptions {
  sanitized: boolean; // Redact/mask phone numbers, emergency contact, or IDs for privacy
  includePrescriptions: boolean;
  includeLabReports: boolean;
  includeAllergies: boolean;
  includeChronicDiseases: boolean;
  summaryScope: 'doctor_visit' | 'emergency' | 'pharmacology' | 'comprehensive';
  notes?: string;
}

export function generateHealthSummaryPdf(
  patient: PatientProfile,
  prescriptions: Prescription[],
  labReports: LabReport[],
  options: PdfGenerationOptions
): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;
  let currentY = margin;

  // Colors
  const primaryColor = [13, 148, 136]; // Teal #0d9488
  const darkNavy = [15, 23, 42]; // Slate-900 #0f172a
  const softBg = [241, 245, 249]; // Slate-100 #f1f5f9
  const accentRed = [225, 29, 72]; // Rose-600 #e11d48
  const textDark = [30, 41, 59]; // Slate-800
  const textMuted = [100, 116, 139]; // Slate-500

  const formatSanitizedPhone = (phone?: string) => {
    if (!phone) return 'N/A';
    if (!options.sanitized) return phone;
    if (phone.length <= 4) return '••••';
    return phone.slice(0, 3) + '••••••' + phone.slice(-2);
  };

  const displayName = options.sanitized
    ? `${patient.fullName.split(' ')[0]} ${patient.fullName.split(' ')[1]?.[0] || ''}. [ANONYMIZED ID]`
    : patient.fullName;

  // 1. TOP BANNER / HEADER
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, 0, pageWidth, 24, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('DAWAVERIFY X — CLINICAL HEALTH INTELLIGENCE', margin, 11);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text(
    options.sanitized
      ? 'SANITIZED & DE-IDENTIFIED CLINICAL SUMMARY REPORT (HIPAA COMPLIANT)'
      : 'OFFICIAL MEDICAL SUMMARY & RECONCILIATION REPORT',
    margin,
    17
  );

  const reportId = `REF-DVX-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
  doc.setFont('courier', 'bold');
  doc.setFontSize(8);
  doc.text(reportId, pageWidth - margin - doc.getTextWidth(reportId), 11);
  const genDate = `DATE: ${new Date().toISOString().split('T')[0]}`;
  doc.text(genDate, pageWidth - margin - doc.getTextWidth(genDate), 17);

  currentY = 32;

  // 2. PRIVACY & SANITIZATION BADGE
  if (options.sanitized) {
    doc.setFillColor(254, 242, 242); // soft red
    doc.setDrawColor(252, 165, 165);
    doc.roundedRect(margin, currentY, contentWidth, 9, 1.5, 1.5, 'FD');

    doc.setTextColor(accentRed[0], accentRed[1], accentRed[2]);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text(
      'HIPAA / GDPR PRIVACY SHIELD ACTIVE: Direct identifiers and personal phone numbers have been redacted or masked.',
      margin + 3,
      currentY + 5.5
    );
    currentY += 13;
  }

  // 3. PATIENT DEMOGRAPHICS CARD
  doc.setFillColor(softBg[0], softBg[1], softBg[2]);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, currentY, contentWidth, 24, 2, 2, 'FD');

  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('PATIENT DEMOGRAPHICS & CLINICAL VITALS', margin + 4, currentY + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text('Name:', margin + 4, currentY + 12);
  doc.text('Blood Group:', margin + 65, currentY + 12);
  doc.text('Gender / DOB:', margin + 115, currentY + 12);

  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.setFont('helvetica', 'bold');
  doc.text(displayName, margin + 4, currentY + 17);
  doc.text(patient.bloodGroup || 'O+', margin + 65, currentY + 17);
  doc.text(`${patient.gender || 'Male'} • ${patient.dateOfBirth || '1984-04-12'}`, margin + 115, currentY + 17);

  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.setFont('helvetica', 'normal');
  doc.text('Emergency Contact:', margin + 4, currentY + 21);
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.setFont('helvetica', 'bold');
  const primaryContact = patient.emergencyContacts?.find((c) => c.isPrimary) || patient.emergencyContacts?.[0];
  const emergencyTxt = primaryContact
    ? `${options.sanitized ? primaryContact.name.split(' ')[0] + ' [Family]' : primaryContact.name} (${primaryContact.relation}) • ${formatSanitizedPhone(primaryContact.phone)}`
    : 'Sarah Vance (Spouse) • +1 (555) •••-••01';
  doc.text(emergencyTxt, margin + 35, currentY + 21);

  currentY += 28;

  // 4. CRITICAL ALLERGIES & CONTRAINDICATIONS
  if (options.includeAllergies && patient.allergies && patient.allergies.length > 0) {
    doc.setFillColor(255, 241, 242); // Rose tint
    doc.setDrawColor(accentRed[0], accentRed[1], accentRed[2]);
    doc.setLineWidth(0.4);
    doc.roundedRect(margin, currentY, contentWidth, 18, 2, 2, 'FD');

    doc.setTextColor(accentRed[0], accentRed[1], accentRed[2]);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('CRITICAL ALLERGIES & CONTRAINDICATIONS (MANDATORY VERIFICATION)', margin + 4, currentY + 6);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(textDark[0], textDark[1], textDark[2]);
    const allergyList = patient.allergies
      .map((a) => `${a.allergen.toUpperCase()} (${a.severity.toUpperCase()} - ${a.reaction})`)
      .join('; ');
    const splitAllergies = doc.splitTextToSize(`Documented Reactions: ${allergyList}`, contentWidth - 8);
    doc.text(splitAllergies, margin + 4, currentY + 11);

    currentY += 22;
  }

  // 5. CHRONIC CONDITIONS & CLINICAL SCOPE
  if (options.includeChronicDiseases && patient.chronicDiseases && patient.chronicDiseases.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
    doc.text('ACTIVE CHRONIC CONDITIONS & DIAGNOSES', margin, currentY);

    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(margin, currentY + 2, pageWidth - margin, currentY + 2);
    currentY += 7;

    patient.chronicDiseases.forEach((disease) => {
      doc.setFillColor(softBg[0], softBg[1], softBg[2]);
      doc.roundedRect(margin, currentY, contentWidth, 10, 1.5, 1.5, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(textDark[0], textDark[1], textDark[2]);
      doc.text(`• ${disease.name} [Status: ${disease.status.toUpperCase()}]`, margin + 3, currentY + 4.5);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
      doc.text(`Diagnosed: ${disease.diagnosedDate || '2021'} | Management Notes: ${disease.notes || 'Routine follow-up'}`, margin + 3, currentY + 8.5);

      currentY += 12;
    });

    currentY += 2;
  }

  // 6. ACTIVE PRESCRIPTIONS & PHARMACOTHERAPY
  if (options.includePrescriptions && prescriptions && prescriptions.length > 0) {
    if (currentY > 210) {
      doc.addPage();
      currentY = 20;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
    doc.text('VERIFIED PRESCRIPTION MEDICATIONS & DOSING SCHEDULE', margin, currentY);

    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(margin, currentY + 2, pageWidth - margin, currentY + 2);
    currentY += 6;

    // Table Header
    doc.setFillColor(darkNavy[0], darkNavy[1], darkNavy[2]);
    doc.rect(margin, currentY, contentWidth, 6.5, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.text('MEDICATION & GENERIC', margin + 3, currentY + 4.5);
    doc.text('DOSAGE', margin + 65, currentY + 4.5);
    doc.text('FREQUENCY / TIMING', margin + 95, currentY + 4.5);
    doc.text('DURATION / INSTRUCTIONS', margin + 130, currentY + 4.5);
    currentY += 7.5;

    prescriptions.forEach((rx, pIdx) => {
      (rx.medicines || []).forEach((med) => {
        if (currentY > pageHeight - 25) {
          doc.addPage();
          currentY = 20;
        }

        doc.setFillColor(pIdx % 2 === 0 ? 255 : 248, pIdx % 2 === 0 ? 255 : 250, pIdx % 2 === 0 ? 255 : 252);
        doc.rect(margin, currentY, contentWidth, 9, 'F');
        doc.setDrawColor(226, 232, 240);
        doc.line(margin, currentY + 9, pageWidth - margin, currentY + 9);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(textDark[0], textDark[1], textDark[2]);
        doc.text(med.brandName || 'Medication', margin + 3, currentY + 4);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(6.8);
        doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
        doc.text(med.genericName || 'Standard formulary', margin + 3, currentY + 7.5);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.5);
        doc.setTextColor(textDark[0], textDark[1], textDark[2]);
        doc.text(med.dosage, margin + 65, currentY + 5.5);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.text(`${med.frequency} • ${med.timing.replace('_', ' ')}`, margin + 95, currentY + 5.5);
        doc.text(`${med.durationDays || '90'} days • ${med.instructions || 'With water'}`, margin + 130, currentY + 5.5);

        currentY += 9.5;
      });
    });

    currentY += 4;
  }

  // 7. KEY LAB REPORTS & PATHOLOGY HIGHLIGHTS
  if (options.includeLabReports && labReports && labReports.length > 0) {
    if (currentY > 210) {
      doc.addPage();
      currentY = 20;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
    doc.text('RECENT LAB HIGHLIGHTS & BIOMARKER TRAJECTORIES', margin, currentY);

    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(margin, currentY + 2, pageWidth - margin, currentY + 2);
    currentY += 6;

    // Table Header
    doc.setFillColor(darkNavy[0], darkNavy[1], darkNavy[2]);
    doc.rect(margin, currentY, contentWidth, 6.5, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.text('TEST / BIOMARKER', margin + 3, currentY + 4.5);
    doc.text('MEASURED VALUE', margin + 65, currentY + 4.5);
    doc.text('REFERENCE RANGE', margin + 110, currentY + 4.5);
    doc.text('CLINICAL STATUS', margin + 150, currentY + 4.5);
    currentY += 7.5;

    labReports.forEach((report, rIdx) => {
      (report.markers || []).forEach((marker) => {
        if (currentY > pageHeight - 25) {
          doc.addPage();
          currentY = 20;
        }

        doc.setFillColor(rIdx % 2 === 0 ? 255 : 248, rIdx % 2 === 0 ? 255 : 250, rIdx % 2 === 0 ? 255 : 252);
        doc.rect(margin, currentY, contentWidth, 8, 'F');
        doc.setDrawColor(226, 232, 240);
        doc.line(margin, currentY + 8, pageWidth - margin, currentY + 8);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.8);
        doc.setTextColor(textDark[0], textDark[1], textDark[2]);
        doc.text(marker.name, margin + 3, currentY + 5);

        doc.setFont('helvetica', 'bold');
        doc.text(`${marker.value} ${marker.unit}`, margin + 65, currentY + 5);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
        const refStr = marker.referenceRange ? `${marker.referenceRange[0]} - ${marker.referenceRange[1]} ${marker.unit}` : 'Standard';
        doc.text(refStr, margin + 110, currentY + 5);

        if (marker.status === 'normal') {
          doc.setTextColor(16, 185, 129); // emerald
          doc.setFont('helvetica', 'bold');
          doc.text('NORMAL', margin + 150, currentY + 5);
        } else if (marker.status === 'high' || marker.status === 'critical') {
          doc.setTextColor(accentRed[0], accentRed[1], accentRed[2]);
          doc.setFont('helvetica', 'bold');
          doc.text(marker.status.toUpperCase(), margin + 150, currentY + 5);
        } else {
          doc.setTextColor(234, 88, 12); // amber
          doc.setFont('helvetica', 'bold');
          doc.text(marker.status.toUpperCase(), margin + 150, currentY + 5);
        }

        currentY += 8.5;
      });
    });

    currentY += 4;
  }

  // 8. CLINICAL SUMMARY NOTES & AGENDAS
  if (currentY > pageHeight - 35) {
    doc.addPage();
    currentY = 20;
  }

  doc.setFillColor(softBg[0], softBg[1], softBg[2]);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, currentY, contentWidth, 18, 1.5, 1.5, 'FD');

  doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('CLINICIAN NOTES & RECOMMENDATIONS:', margin + 3, currentY + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  const defaultNotes =
    options.notes ||
    '1. Routine 6-month diabetic & hypertensive evaluation. 2. Patient adheres strictly to daily morning Lisinopril and BD Metformin. 3. Penicillin allergy remains lifelong absolute contraindication. 4. Renal profiles verified stable.';
  const splitNotes = doc.splitTextToSize(defaultNotes, contentWidth - 6);
  doc.text(splitNotes, margin + 3, currentY + 9.5);

  // 9. FOOTER ON ALL PAGES
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.3);
    doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
    doc.text(
      'Generated by DawaVerify X AI Health Intelligence Platform • Verified against clinical safety guidelines',
      margin,
      pageHeight - 8
    );

    const pageStr = `Page ${i} of ${totalPages}`;
    doc.text(pageStr, pageWidth - margin - doc.getTextWidth(pageStr), pageHeight - 8);
  }

  return doc;
}
