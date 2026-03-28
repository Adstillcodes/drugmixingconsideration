import html2pdf from 'html2pdf.js';

const getRiskLabel = (level) => {
  const labels = {
    safe: 'Safe',
    low: 'Low Risk',
    moderate: 'Moderate Risk',
    high: 'High Risk',
    critical: 'Critical Risk',
  };
  return labels[level] || 'Unknown';
};

const getRiskColor = (level) => {
  const colors = {
    safe: '#2ECC71',
    low: '#2ECC71',
    moderate: '#E9C46A',
    high: '#F97316',
    critical: '#D32F2F',
  };
  return colors[level] || '#2ECC71';
};

const getSeverityBadgeColor = (severity) => {
  const colors = {
    contraindicated: { bg: '#FFEBEE', text: '#D32F2F', border: '#D32F2F' },
    major: { bg: '#FFCDD2', text: '#C62828', border: '#EF5350' },
    moderate: { bg: '#FFF8E1', text: '#F57F17', border: '#FFB74D' },
    minor: { bg: '#E8F5E9', text: '#2E7D32', border: '#81C784' },
    unknown: { bg: '#ECEFF1', text: '#546E7A', border: '#90A4AE' },
  };
  return colors[severity] || colors.unknown;
};

export function generateReportHTML(analysisResults, aiAnalysis, userData) {
  const { summary, interactions } = analysisResults;
  const riskPercentage = summary?.riskPercentage || 0;
  
  const interactionsHTML = interactions.length > 0 
    ? interactions.map(interaction => {
        const severityColors = getSeverityBadgeColor(interaction.severity);
        const recommendationsHTML = interaction.recommendations?.length > 0
          ? `<div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid ${severityColors.border}20;">
              <p style="font-size: 12px; font-weight: 700; color: #888; margin-bottom: 8px;">SAFETY RECOMMENDATIONS:</p>
              ${interaction.recommendations.map(rec => `
                <p style="color: #555; font-size: 13px; margin-bottom: 6px; padding-left: 12px; border-left: 3px solid ${severityColors.text};">
                  ${rec}
                </p>
              `).join('')}
            </div>`
          : '';
        
        return `
          <div style="background: ${severityColors.bg}; border: 2px solid ${severityColors.border}; border-radius: 16px; padding: 20px; margin-bottom: 16px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
              <h4 style="font-size: 20px; font-weight: 700; color: #1a1a1a; margin: 0;">
                ${interaction.drugs.join(' + ')}
              </h4>
              <span style="background: ${severityColors.text}; color: white; padding: 6px 16px; border-radius: 20px; font-weight: 700; font-size: 12px; text-transform: uppercase;">
                ${interaction.severity}
              </span>
            </div>
            <p style="color: ${severityColors.text}; font-weight: 600; margin: 0 0 8px 0;">
              ${interaction.risk}
            </p>
            <p style="color: #555; line-height: 1.6; margin: 0 0 8px 0;">
              ${interaction.description}
            </p>
            ${recommendationsHTML}
          </div>
        `;
      }).join('')
    : `
      <div style="background: #E8F5E9; border: 2px solid #81C784; border-radius: 16px; padding: 32px; text-align: center;">
        <span style="font-size: 48px;">✓</span>
        <h3 style="color: #2E7D32; margin: 16px 0 8px 0;">No Interactions Found</h3>
        <p style="color: #555; margin: 0;">Your medication combination appears to be safe based on our analysis.</p>
      </div>
    `;

  const medicationsHTML = (analysisResults.medications || []).map(med => `
    <div style="background: #f8f9fa; border-radius: 12px; padding: 16px; display: flex; align-items: center; gap: 12px;">
      <div style="width: 40px; height: 40px; background: ${med.fromOCR ? '#E8F5E9' : '#E3F2FD'}; border-radius: 10px; display: flex; align-items: center; justify-content: center;">
        <span style="font-size: 20px;">${med.fromOCR ? '📄' : '💊'}</span>
      </div>
      <div style="flex: 1;">
        <p style="font-weight: 700; color: #1a1a1a; margin: 0;">${med.name}</p>
        <p style="color: #666; font-size: 13px; margin: 0;">
          ${med.category || 'Medication'} • ${med.dosage || 'As directed'}
          ${med.fromOCR ? ' • <span style="color: #2E7D32; font-weight: 600;">From Prescription</span>' : ''}
        </p>
        ${med.timing ? `<p style="color: #E76F51; font-size: 12px; font-weight: 600; margin: 4px 0 0 0;">⏰ ${med.timing}</p>` : ''}
      </div>
    </div>
  `).join('');

  const conditionsHTML = userData.conditions && userData.conditions.length > 0
    ? `
      <div style="margin-top: 16px;">
        <p style="font-size: 12px; font-weight: 700; color: #888; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 8px 0;">
          Health Context
        </p>
        <div style="display: flex; flex-wrap: wrap; gap: 8px;">
          ${userData.conditions.map(c => `
            <span style="background: #FFF3E0; color: #E65100; padding: 6px 14px; border-radius: 20px; font-size: 13px; font-weight: 600;">
              ${c}
            </span>
          `).join('')}
        </div>
      </div>
    `
    : '';

  const aiAnalysisSection = aiAnalysis ? `
    <div style="padding: 32px 40px; background: linear-gradient(135deg, #E3F2FD 0%, #F3E5F5 100%);">
      <h3 style="font-size: 18px; font-weight: 700; margin-bottom: 16px; display: flex; align-items: center; gap: 8px;">
        <span>🤖</span> AI Analysis Summary
      </h3>
      <p style="color: #333; margin-bottom: 16px; line-height: 1.6;">${aiAnalysis.overview || aiAnalysis.summary || ''}</p>
      ${aiAnalysis.keyConcerns?.length > 0 ? `
        <div style="background: white; border-radius: 12px; padding: 16px;">
          <p style="font-weight: 700; color: #666; margin-bottom: 12px;">Key Concerns:</p>
          ${aiAnalysis.keyConcerns.map(c => `
            <p style="color: #333; padding-left: 16px; margin-bottom: 8px; border-left: 3px solid #E76F51;">${c}</p>
          `).join('')}
        </div>
      ` : ''}
      ${aiAnalysis.personalizedAdvice?.length > 0 ? `
        <div style="background: white; border-radius: 12px; padding: 16px; margin-top: 16px;">
          <p style="font-weight: 700; color: #666; margin-bottom: 12px;">Recommendations:</p>
          ${aiAnalysis.personalizedAdvice.map(advice => `
            <p style="color: #333; padding-left: 16px; margin-bottom: 8px; border-left: 3px solid #2ECC71;">${advice}</p>
          `).join('')}
        </div>
      ` : ''}
    </div>
  ` : '';

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Dose-Wise Analysis Report</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1a1a1a; line-height: 1.5; }
    @media print { body { print-color-adjust: exact; -webkit-print-color-adjust: exact; } }
  </style>
</head>
<body style="background: #f5f5f5; padding: 40px 20px;">
  <div id="report-content" style="max-width: 800px; margin: 0 auto; background: white; border-radius: 24px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.1);">
    
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #E76F51 0%, #F4A261 100%); padding: 32px 40px;">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <div>
          <h1 style="color: white; font-size: 28px; font-weight: 800; margin-bottom: 4px;">Dose-Wise</h1>
          <p style="color: rgba(255,255,255,0.9); font-size: 14px;">Drug Interaction Analysis Report</p>
        </div>
        <div style="background: rgba(255,255,255,0.2); padding: 12px 20px; border-radius: 12px; text-align: center;">
          <p style="color: white; font-size: 32px; font-weight: 800;">${riskPercentage}%</p>
          <p style="color: rgba(255,255,255,0.9); font-size: 12px; font-weight: 600;">Risk Score</p>
        </div>
      </div>
    </div>

    <!-- Summary Section -->
    <div style="padding: 32px 40px; border-bottom: 1px solid #eee;">
      <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 16px;">
        <div style="width: 60px; height: 60px; border-radius: 50%; background: ${getRiskColor(summary?.riskLevel)}20; display: flex; align-items: center; justify-content: center;">
          ${summary?.riskLevel === 'safe' || summary?.riskLevel === 'low' 
            ? '<span style="font-size: 28px;">✓</span>' 
            : '<span style="font-size: 28px;">⚠️</span>'}
        </div>
        <div>
          <h2 style="font-size: 24px; font-weight: 700; color: ${getRiskColor(summary?.riskLevel)};">${getRiskLabel(summary?.riskLevel)}</h2>
          <p style="color: #666; font-size: 14px;">${summary?.message || 'Analysis complete'}</p>
        </div>
      </div>
      
      <div style="background: #f8f9fa; border-radius: 12px; padding: 20px;">
        <p style="font-size: 13px; color: #888; font-weight: 600; margin-bottom: 12px;">PATIENT INFO</p>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 16px;">
          <div>
            <p style="font-size: 12px; color: #888;">Gender</p>
            <p style="font-weight: 600;">${userData.gender ? userData.gender.charAt(0).toUpperCase() + userData.gender.slice(1) : 'Not specified'}</p>
          </div>
          <div>
            <p style="font-size: 12px; color: #888;">Age</p>
            <p style="font-weight: 600;">${userData.age || 'Not specified'}</p>
          </div>
          <div>
            <p style="font-size: 12px; color: #888;">Medications</p>
            <p style="font-weight: 600;">${analysisResults.medications?.length || 0} analyzed</p>
          </div>
          <div>
            <p style="font-size: 12px; color: #888;">Interactions</p>
            <p style="font-weight: 600;">${interactions.length} found</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Medications Section -->
    <div style="padding: 32px 40px; border-bottom: 1px solid #eee;">
      <h3 style="font-size: 18px; font-weight: 700; margin-bottom: 16px; display: flex; align-items: center; gap: 8px;">
        <span>💊</span> Analyzed Medications
      </h3>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px;">
        ${medicationsHTML}
      </div>
      ${conditionsHTML}
    </div>

    <!-- Interactions Section -->
    <div style="padding: 32px 40px;">
      <h3 style="font-size: 18px; font-weight: 700; margin-bottom: 16px; display: flex; align-items: center; gap: 8px;">
        <span>⚠️</span> Detected Interactions
      </h3>
      ${interactionsHTML}
    </div>

    ${aiAnalysisSection}

    <!-- Disclaimer -->
    <div style="padding: 24px 40px; background: #fff3cd; border-top: 1px solid #ffc107;">
      <p style="font-size: 12px; color: #856404; line-height: 1.6;">
        <strong>Important Disclaimer:</strong> This analysis is for informational purposes only and does not replace professional medical advice. 
        Always consult with a qualified healthcare provider before making any changes to your medication regimen. 
        If you are experiencing any adverse effects, seek medical attention immediately.
      </p>
    </div>

    <!-- Footer -->
    <div style="padding: 20px 40px; background: #f5f5f5; text-align: center;">
      <p style="font-size: 12px; color: #888;">Generated by Dose-Wise • ${new Date().toLocaleDateString()} • For medical emergencies, call 911</p>
    </div>

  </div>
</body>
</html>
  `;

  return html;
}

export async function downloadReport(analysisResults, aiAnalysis, userData) {
  const html = generateReportHTML(analysisResults, aiAnalysis, userData);
  
  const container = document.createElement('div');
  container.innerHTML = html;
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  document.body.appendChild(container);
  
  const element = container.querySelector('#report-content');
  
  const options = {
    margin: 0,
    filename: `Dose-Wise_Report_${new Date().toISOString().split('T')[0]}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };

  try {
    await html2pdf().set(options).from(element).save();
  } finally {
    document.body.removeChild(container);
  }
}

export function printReport(analysisResults, aiAnalysis, userData) {
  const html = generateReportHTML(analysisResults, aiAnalysis, userData);
  const printWindow = window.open('', '_blank');
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => {
    printWindow.print();
  }, 250);
}
