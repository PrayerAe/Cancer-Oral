"""
PDF Report Generator for AI Oral Cancer Detection
Modern hospital-style PDF generation with medical compliance
"""

import os
import pickle
import asyncio
import logging
from datetime import datetime
from typing import Dict, Any
import tempfile

try:
    from reportlab.lib.pagesizes import A4
    from reportlab.lib import colors
    from reportlab.lib.units import inch, cm
    from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
    from reportlab.platypus import Image as RLImage, PageBreak, HRFlowable
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY
    REPORTLAB_AVAILABLE = True
except ImportError:
    REPORTLAB_AVAILABLE = False

logger = logging.getLogger(__name__)

class PDFReportGenerator:
    """Modern hospital-style PDF report generator"""
    
    def __init__(self):
        if not REPORTLAB_AVAILABLE:
            logger.warning("⚠️ ReportLab not available - PDF generation disabled")
            return
        
        self.styles = getSampleStyleSheet()
        self.setup_medical_styles()
        logger.info("✅ PDF Report Generator initialized")
    
    def setup_medical_styles(self):
        """Setup modern medical report styles"""
        
        # Hospital Title Style
        self.hospital_title_style = ParagraphStyle(
            'HospitalTitle',
            parent=self.styles['Title'],
            fontSize=20,
            spaceAfter=20,
            spaceBefore=15,
            alignment=TA_CENTER,
            textColor=colors.HexColor('#0B3954'),
            fontName='Helvetica-Bold',
            leading=24
        )
        
        # Section Header Style
        self.section_header_style = ParagraphStyle(
            'SectionHeader',
            parent=self.styles['Heading2'],
            fontSize=14,
            spaceAfter=10,
            spaceBefore=20,
            textColor=colors.HexColor('#0B3954'),
            fontName='Helvetica-Bold',
            borderWidth=1,
            borderColor=colors.HexColor('#BFD7EA'),
            borderPadding=8,
            backColor=colors.HexColor('#ECF0F1'),
            leftIndent=10
        )
        
        # Body Text Style
        self.body_style = ParagraphStyle(
            'ModernBody',
            parent=self.styles['Normal'],
            fontSize=11,
            spaceAfter=8,
            alignment=TA_JUSTIFY,
            textColor=colors.HexColor('#2C3E50'),
            fontName='Helvetica',
            leading=14
        )
        
        # Medical Info Style
        self.medical_info_style = ParagraphStyle(
            'MedicalInfo',
            parent=self.styles['Normal'],
            fontSize=10,
            spaceAfter=12,
            spaceBefore=8,
            alignment=TA_LEFT,
            textColor=colors.HexColor('#2C3E50'),
            fontName='Helvetica',
            backColor=colors.HexColor('#ECF0F1'),
            borderWidth=1,
            borderColor=colors.HexColor('#BFD7EA'),
            borderPadding=10
        )
        
        # Caption Style
        self.caption_style = ParagraphStyle(
            'ModernCaption',
            parent=self.styles['Normal'],
            fontSize=9,
            spaceAfter=15,
            spaceBefore=5,
            alignment=TA_CENTER,
            textColor=colors.HexColor('#7F8C8D'),
            fontName='Helvetica-Oblique',
            borderWidth=0.5,
            borderColor=colors.HexColor('#BDC3C7'),
            borderPadding=6
        )
        
        # Disclaimer Style
        self.disclaimer_style = ParagraphStyle(
            'Disclaimer',
            parent=self.styles['Normal'],
            fontSize=9,
            spaceAfter=10,
            alignment=TA_JUSTIFY,
            textColor=colors.HexColor('#7F8C8D'),
            fontName='Helvetica',
            backColor=colors.HexColor('#ECF0F1'),
            borderWidth=1,
            borderColor=colors.HexColor('#BDC3C7'),
            borderPadding=12,
            leftIndent=10,
            rightIndent=10
        )
    
    async def generate_report(self, analysis_data: Dict[str, Any], request_id: str) -> str:
        """Generate PDF report asynchronously"""
        
        if not REPORTLAB_AVAILABLE:
            raise RuntimeError("PDF generation not available - ReportLab not installed")
        
        try:
            logger.info(f"🔄 Generating PDF report for {request_id}")
            
            # Create PDF path
            pdf_filename = f"Laporan_AI_Kanker_Mulut_{request_id}.pdf"
            pdf_path = os.path.join("static/uploads", pdf_filename)
            
            # Generate PDF in thread pool to avoid blocking
            loop = asyncio.get_event_loop()
            await loop.run_in_executor(None, self._generate_pdf_sync, analysis_data, pdf_path)
            
            logger.info(f"✅ PDF report generated: {pdf_path}")
            return pdf_path
            
        except Exception as e:
            logger.error(f"❌ PDF generation failed for {request_id}: {e}")
            raise RuntimeError(f"PDF generation failed: {str(e)}")
    
    def _generate_pdf_sync(self, analysis_data: Dict[str, Any], output_path: str):
        """Synchronous PDF generation"""
        
        # Create PDF document
        doc = SimpleDocTemplate(
            output_path,
            pagesize=A4,
            rightMargin=2*cm,
            leftMargin=2*cm,
            topMargin=1.5*cm,
            bottomMargin=2*cm,
            title="Laporan AI Deteksi Kanker Mulut"
        )
        
        # Build content
        story = []
        
        # Header
        self.create_header(story)
        
        # Title
        title_text = "LAPORAN ANALISIS AI DETEKSI KANKER MULUT"
        story.append(Paragraph(title_text, self.hospital_title_style))
        
        subtitle_text = "Sistem Kecerdasan Buatan dengan Enhanced Grad-CAM Technology"
        story.append(Paragraph(subtitle_text, self.body_style))
        story.append(Spacer(1, 20))
        
        # Analysis Summary
        self.create_analysis_summary(story, analysis_data)
        
        # Patient Information
        self.create_patient_info(story, analysis_data.get('patient_data', {}))
        
        # Medical Interpretation
        self.create_medical_interpretation(story, analysis_data)
        
        # Disclaimer
        self.create_disclaimer(story)
        
        # Footer
        self.create_footer(story)
        
        # Build PDF
        doc.build(story)
    
    def create_header(self, story):
        """Create PDF header"""
        header_data = [[
            "🏥 AI ORAL CANCER DETECTION SYSTEM",
            f"📅 {datetime.now().strftime('%d %B %Y')}"
        ]]
        
        header_table = Table(header_data, colWidths=[4.5*inch, 2.5*inch])
        header_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#0B3954')),
            ('TEXTCOLOR', (0, 0), (-1, -1), colors.white),
            ('FONTNAME', (0, 0), (0, 0), 'Helvetica-Bold'),
            ('FONTNAME', (1, 0), (1, 0), 'Helvetica'),
            ('FONTSIZE', (0, 0), (0, 0), 12),
            ('FONTSIZE', (1, 0), (1, 0), 11),
            ('ALIGN', (0, 0), (0, 0), 'LEFT'),
            ('ALIGN', (1, 0), (1, 0), 'RIGHT'),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('TOPPADDING', (0, 0), (-1, -1), 12),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
            ('LEFTPADDING', (0, 0), (-1, -1), 15),
            ('RIGHTPADDING', (0, 0), (-1, -1), 15)
        ]))
        
        story.append(header_table)
        story.append(Spacer(1, 15))
        story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor('#BFD7EA')))
        story.append(Spacer(1, 20))
    
    def create_analysis_summary(self, story, analysis_data):
        """Create analysis summary section"""
        story.append(Paragraph("RINGKASAN ANALISIS", self.section_header_style))
        
        prediction = analysis_data.get('prediction', 'Unknown')
        confidence = analysis_data.get('confidence', 0)
        analysis_date = analysis_data.get('analysis_date', datetime.now().isoformat())
        
        # Determine status color
        status_color = colors.HexColor('#E74C3C') if prediction == 'Cancer' else colors.HexColor('#27AE60')
        status_text = '⚠️ PERLU PERHATIAN' if prediction == 'Cancer' else '✅ NORMAL'
        
        summary_data = [
            ['PARAMETER', 'HASIL', 'STATUS'],
            ['Prediksi AI', prediction.upper(), status_text],
            ['Tingkat Keyakinan', f'{confidence:.1f}%', 'Confidence Score'],
            ['Tanggal Analisis', analysis_date[:10], '✅ Selesai'],
            ['Model AI', 'MobileNetV2 + Grad-CAM', '🤖 Medical Grade']
        ]
        
        summary_table = Table(summary_data, colWidths=[2.2*inch, 2.3*inch, 2.5*inch])
        summary_table.setStyle(TableStyle([
            # Header
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#0B3954')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 11),
            ('ALIGN', (0, 0), (-1, 0), 'CENTER'),
            
            # Data rows
            ('BACKGROUND', (0, 1), (-1, -1), colors.white),
            ('TEXTCOLOR', (0, 1), (1, -1), colors.HexColor('#2C3E50')),
            ('FONTNAME', (0, 1), (0, -1), 'Helvetica-Bold'),
            ('FONTNAME', (1, 1), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 1), (-1, -1), 10),
            
            # Special styling for prediction result
            ('BACKGROUND', (1, 1), (2, 1), colors.HexColor('#fef2f2') if prediction == 'Cancer' else colors.HexColor('#f0fdf4')),
            ('TEXTCOLOR', (1, 1), (2, 1), status_color),
            ('FONTNAME', (1, 1), (2, 1), 'Helvetica-Bold'),
            
            # Grid
            ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#BDC3C7')),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('TOPPADDING', (0, 0), (-1, -1), 8),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
            ('LEFTPADDING', (0, 0), (-1, -1), 10),
            ('RIGHTPADDING', (0, 0), (-1, -1), 10)
        ]))
        
        story.append(summary_table)
        story.append(Spacer(1, 20))
    
    def create_patient_info(self, story, patient_data):
        """Create patient information section"""
        if not patient_data or not any(str(value).strip() for value in patient_data.values() if value):
            return
        
        story.append(Paragraph("INFORMASI PASIEN", self.section_header_style))
        
        patient_rows = [['INFORMASI PASIEN', 'DATA']]
        
        field_mapping = {
            'name': 'Nama Pasien',
            'age': 'Usia',
            'gender': 'Jenis Kelamin',
            'doctor_name': 'Dokter Perujuk',
            'hospital': 'Rumah Sakit',
            'medical_history': 'Riwayat Medis',
            'symptoms': 'Gejala'
        }
        
        for key, label in field_mapping.items():
            value = patient_data.get(key, '')
            if value and str(value).strip():
                patient_rows.append([label, str(value)])
        
        if len(patient_rows) > 1:
            patient_table = Table(patient_rows, colWidths=[2.5*inch, 4.5*inch])
            patient_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#4A90A4')),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 11),
                ('ALIGN', (0, 0), (-1, 0), 'CENTER'),
                
                ('BACKGROUND', (0, 1), (0, -1), colors.HexColor('#ECF0F1')),
                ('BACKGROUND', (1, 1), (1, -1), colors.white),
                ('TEXTCOLOR', (0, 1), (-1, -1), colors.HexColor('#2C3E50')),
                ('FONTNAME', (0, 1), (0, -1), 'Helvetica-Bold'),
                ('FONTNAME', (1, 1), (1, -1), 'Helvetica'),
                ('FONTSIZE', (0, 1), (-1, -1), 10),
                ('ALIGN', (0, 1), (-1, -1), 'LEFT'),
                
                ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#BDC3C7')),
                ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                ('TOPPADDING', (0, 0), (-1, -1), 8),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
                ('LEFTPADDING', (0, 0), (-1, -1), 10),
                ('RIGHTPADDING', (0, 0), (-1, -1), 10)
            ]))
            
            story.append(patient_table)
            story.append(Spacer(1, 20))
    
    def create_medical_interpretation(self, story, analysis_data):
        """Create medical interpretation section"""
        story.append(Paragraph("INTERPRETASI MEDIS", self.section_header_style))
        
        prediction = analysis_data.get('prediction', 'Unknown')
        confidence = analysis_data.get('confidence', 0)
        
        interpretation_text = f"""
        Berdasarkan analisis menggunakan teknologi AI MobileNetV2 dengan Enhanced Grad-CAM, 
        sistem telah menganalisis gambar medis dan memberikan prediksi <b>{prediction}</b> 
        dengan tingkat keyakinan <b>{confidence:.1f}%</b>.
        
        <br/><br/>
        
        {"Hasil ini menunjukkan kemungkinan adanya karakteristik yang perlu mendapat perhatian medis lebih lanjut. Disarankan untuk berkonsultasi dengan dokter spesialis untuk evaluasi dan pemeriksaan lanjutan." if prediction == "Cancer" else "Hasil analisis menunjukkan kemungkinan rendah adanya karakteristik abnormal. Namun, tetap disarankan untuk melakukan pemeriksaan rutin sesuai jadwal yang direkomendasikan."}
        """
        
        story.append(Paragraph(interpretation_text, self.body_style))
        story.append(Spacer(1, 20))
    
    def create_disclaimer(self, story):
        """Create medical disclaimer"""
        story.append(Paragraph("DISCLAIMER MEDIS", self.section_header_style))
        
        disclaimer_text = """
        Laporan ini dihasilkan oleh sistem kecerdasan buatan untuk tujuan penelitian dan 
        edukasi medis. Hasil analisis AI ini tidak dapat menggantikan diagnosis medis 
        profesional yang dilakukan oleh tenaga medis yang kompeten. Selalu konsultasikan 
        hasil ini dengan dokter spesialis untuk mendapatkan diagnosis dan penanganan yang tepat.
        """
        
        story.append(Paragraph(disclaimer_text, self.disclaimer_style))
        story.append(Spacer(1, 20))
    
    def create_footer(self, story):
        """Create PDF footer"""
        footer_text = f"""
        <para align="center">
        <b>AI Oral Cancer Detection System v2.0</b><br/>
        Laporan dibuat pada: {datetime.now().strftime('%d %B %Y, %H:%M:%S')}<br/>
        © 2025 AI Medical Solutions. All rights reserved.
        </para>
        """
        
        footer_style = ParagraphStyle(
            'Footer',
            parent=self.styles['Normal'],
            fontSize=9,
            alignment=TA_CENTER,
            textColor=colors.HexColor('#7F8C8D'),
            backColor=colors.HexColor('#ECF0F1'),
            borderWidth=1,
            borderColor=colors.HexColor('#BDC3C7'),
            borderPadding=10
        )
        
        story.append(Paragraph(footer_text, footer_style))
