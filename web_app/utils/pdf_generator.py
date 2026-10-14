"""
Modern Simple Premium PDF Report Generator for AI Oral Cancer Detection
HOSPITAL STYLE VERSION - Clean, Professional and Modern
Simplified layout with premium medical aesthetics similar to standard hospital reports
"""

import os
import base64
import tempfile
from io import BytesIO
from datetime import datetime

try:
    from reportlab.lib.pagesizes import A4
    from reportlab.lib import colors
    from reportlab.lib.units import inch, cm
    from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
    from reportlab.platypus import Image as RLImage, PageBreak, HRFlowable
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY
    REPORTLAB_AVAILABLE = True
    print("Modern Simple PDF Generator: ReportLab loaded successfully")
except ImportError as e:
    REPORTLAB_AVAILABLE = False
    print(f"Modern Simple PDF Generator: ReportLab not available: {e}")

class ModernSimplePremiumPDFGenerator:
    """Modern Simple Premium PDF Generator - Hospital Style"""
    
    def __init__(self):
        if not REPORTLAB_AVAILABLE:
            raise ImportError("ReportLab is required for PDF generation")
        
        # Modern Hospital Color Palette
        self.colors = {
            'primary_blue': colors.HexColor('#0B3954'),        # Deep Professional Blue
            'light_blue': colors.HexColor('#BFD7EA'),          # Light Blue Accent  
            'medical_teal': colors.HexColor('#4A90A4'),        # Medical Teal
            'dark_gray': colors.HexColor('#2C3E50'),           # Professional Dark Gray
            'medium_gray': colors.HexColor('#7F8C8D'),         # Medium Gray
            'light_gray': colors.HexColor('#ECF0F1'),          # Very Light Gray
            'white': colors.white,                             # Pure White
            'table_border': colors.HexColor('#BDC3C7'),        # Table Border
            'success_green': colors.HexColor('#27AE60'),       # Success Green
            'warning_orange': colors.HexColor('#F39C12'),      # Warning Orange
            'danger_red': colors.HexColor('#E74C3C'),          # Danger Red
        }
        
        self.styles = getSampleStyleSheet()
        self.temp_files = []
        self.setup_modern_styles()
        
        print("Modern Simple PDF Generator: Hospital-style generator initialized")
        
    def setup_modern_styles(self):
        """Setup modern hospital-style typography"""
        
        # Hospital Report Title
        self.hospital_title_style = ParagraphStyle(
            'HospitalTitle',
            parent=self.styles['Title'],
            fontSize=22,
            spaceAfter=20,
            spaceBefore=15,
            alignment=TA_CENTER,
            textColor=self.colors['primary_blue'],
            fontName='Helvetica-Bold',
            leading=26
        )
        
        # Hospital Subtitle  
        self.hospital_subtitle_style = ParagraphStyle(
            'HospitalSubtitle',
            parent=self.styles['Normal'],
            fontSize=12,
            spaceAfter=25,
            spaceBefore=5,
            alignment=TA_CENTER,
            textColor=self.colors['medium_gray'],
            fontName='Helvetica-Oblique',
            leading=15
        )
        
        # Section Headers (Clean)
        self.section_header_style = ParagraphStyle(
            'SectionHeader',
            parent=self.styles['Heading2'],
            fontSize=14,
            spaceAfter=10,
            spaceBefore=20,
            textColor=self.colors['primary_blue'],
            fontName='Helvetica-Bold',
            borderWidth=1,
            borderColor=self.colors['light_blue'],
            borderPadding=8,
            backColor=self.colors['light_gray'],
            leftIndent=10,
            leading=18
        )
        
        # Clean Body Text
        self.clean_body_style = ParagraphStyle(
            'CleanBody',
            parent=self.styles['Normal'],
            fontSize=11,
            spaceAfter=8,
            alignment=TA_JUSTIFY,
            textColor=self.colors['dark_gray'],
            fontName='Helvetica',
            leading=14,
            leftIndent=0,
            rightIndent=0
        )
        
        # Modern Caption
        self.modern_caption_style = ParagraphStyle(
            'ModernCaption',
            parent=self.styles['Normal'],
            fontSize=9,
            spaceAfter=15,
            spaceBefore=5,
            alignment=TA_CENTER,
            textColor=self.colors['medium_gray'],
            fontName='Helvetica-Oblique',
            backColor=self.colors['white'],
            borderWidth=0.5,
            borderColor=self.colors['table_border'],
            borderPadding=6
        )
        
        # Medical Info Box
        self.medical_info_style = ParagraphStyle(
            'MedicalInfo',
            parent=self.styles['Normal'],
            fontSize=10,
            spaceAfter=12,
            spaceBefore=8,
            alignment=TA_LEFT,
            textColor=self.colors['dark_gray'],
            fontName='Helvetica',
            backColor=self.colors['light_gray'],
            borderWidth=1,
            borderColor=self.colors['light_blue'],
            borderPadding=10,
            leftIndent=5,
            rightIndent=5
        )
        
        # Simple Disclaimer
        self.simple_disclaimer_style = ParagraphStyle(
            'SimpleDisclaimer',
            parent=self.styles['Normal'],
            fontSize=9,
            spaceAfter=10,
            alignment=TA_JUSTIFY,
            textColor=self.colors['medium_gray'],
            fontName='Helvetica',
            backColor=self.colors['light_gray'],
            borderWidth=1,
            borderColor=self.colors['table_border'],
            borderPadding=12,
            leftIndent=10,
            rightIndent=10
        )

    def create_hospital_header(self, story):
        """Create clean hospital-style header"""
        
        # Simple Header Table
        header_data = [[
            "AI ORAL CANCER DETECTION SYSTEM",
            f"{datetime.now().strftime('%d %B %Y')}"
        ]]
        
        header_table = Table(header_data, colWidths=[4.5*inch, 2.5*inch])
        header_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), self.colors['primary_blue']),
            ('TEXTCOLOR', (0, 0), (-1, -1), self.colors['white']),
            ('FONTNAME', (0, 0), (0, 0), 'Helvetica-Bold'),
            ('FONTNAME', (1, 0), (1, 0), 'Helvetica'),
            ('FONTSIZE', (0, 0), (0, 0), 14),
            ('FONTSIZE', (1, 0), (1, 0), 12),
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
        
        # Simple Divider Line
        story.append(HRFlowable(width="100%", thickness=1, color=self.colors['light_blue']))
        story.append(Spacer(1, 20))

    def create_summary_section(self, result_data):
        """Create clean summary section"""
        
        # Extract data
        prediction = str(result_data.get('prediction', 'Tidak diketahui'))
        confidence = result_data.get('confidence', 0)
        analysis_date = str(result_data.get('analysis_date', datetime.now().strftime('%d-%m-%Y %H:%M')))
        
        try:
            confidence_num = float(confidence)
        except (ValueError, TypeError):
            confidence_num = 0.0
        
        # Determine status color
        status_color = self.colors['danger_red'] if prediction.lower() == 'cancer' else self.colors['success_green']
        status_text = 'PERLU PERHATIAN' if prediction.lower() == 'cancer' else 'NORMAL'
        
        # Clean Summary Table
        summary_data = [
            ['PARAMETER', 'HASIL', 'STATUS'],
            [
                'Prediksi AI',
                prediction.upper(),
                status_text
            ],
            [
                'Tingkat Keyakinan',
                f'{confidence_num:.1f}%',
                f'{"Tinggi" if confidence_num > 75 else "Sedang" if confidence_num > 50 else "Rendah"}'
            ],
            [
                'Tanggal Analisis',
                analysis_date,
                'Selesai'
            ],
            [
                'Model AI',
                'MobileNetV2 + Grad-CAM',
                'Medical Grade'
            ]
        ]
        
        summary_table = Table(summary_data, colWidths=[2.2*inch, 2.3*inch, 2.5*inch])
        summary_table.setStyle(TableStyle([
            # Header styling
            ('BACKGROUND', (0, 0), (-1, 0), self.colors['primary_blue']),
            ('TEXTCOLOR', (0, 0), (-1, 0), self.colors['white']),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 11),
            ('ALIGN', (0, 0), (-1, 0), 'CENTER'),
            
            # Data rows
            ('BACKGROUND', (0, 1), (-1, -1), self.colors['white']),
            ('TEXTCOLOR', (0, 1), (1, -1), self.colors['dark_gray']),
            ('FONTNAME', (0, 1), (0, -1), 'Helvetica-Bold'),
            ('FONTNAME', (1, 1), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 1), (-1, -1), 10),
            ('ALIGN', (0, 1), (0, -1), 'LEFT'),
            ('ALIGN', (1, 1), (1, -1), 'CENTER'),
            ('ALIGN', (2, 1), (2, -1), 'CENTER'),
            
            # Special styling for prediction result
            ('BACKGROUND', (1, 1), (2, 1), colors.HexColor('#fef2f2') if prediction.lower() == 'cancer' else colors.HexColor('#f0fdf4')),
            ('TEXTCOLOR', (1, 1), (2, 1), status_color),
            ('FONTNAME', (1, 1), (2, 1), 'Helvetica-Bold'),
            
            # Grid and borders
            ('GRID', (0, 0), (-1, -1), 1, self.colors['table_border']),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('TOPPADDING', (0, 0), (-1, -1), 8),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
            ('LEFTPADDING', (0, 0), (-1, -1), 10),
            ('RIGHTPADDING', (0, 0), (-1, -1), 10)
        ]))
        
        return summary_table

    def create_patient_section(self, patient_data):
        """Create simple patient information section"""
        
        if not patient_data or not any(str(value).strip() for value in patient_data.values() if value):
            return None
        
        patient_rows = [['INFORMASI PASIEN', 'DATA']]
        
        # Simple field mapping
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
        
        if len(patient_rows) <= 1:
            return None
        
        patient_table = Table(patient_rows, colWidths=[2.5*inch, 4.5*inch])
        patient_table.setStyle(TableStyle([
            # Header
            ('BACKGROUND', (0, 0), (-1, 0), self.colors['medical_teal']),
            ('TEXTCOLOR', (0, 0), (-1, 0), self.colors['white']),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 11),
            ('ALIGN', (0, 0), (-1, 0), 'CENTER'),
            
            # Data rows
            ('BACKGROUND', (0, 1), (0, -1), self.colors['light_gray']),
            ('BACKGROUND', (1, 1), (1, -1), self.colors['white']),
            ('TEXTCOLOR', (0, 1), (-1, -1), self.colors['dark_gray']),
            ('FONTNAME', (0, 1), (0, -1), 'Helvetica-Bold'),
            ('FONTNAME', (1, 1), (1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 1), (-1, -1), 10),
            ('ALIGN', (0, 1), (-1, -1), 'LEFT'),
            
            # Grid and borders
            ('GRID', (0, 0), (-1, -1), 1, self.colors['table_border']),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('TOPPADDING', (0, 0), (-1, -1), 8),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
            ('LEFTPADDING', (0, 0), (-1, -1), 10),
            ('RIGHTPADDING', (0, 0), (-1, -1), 10)
        ]))
        
        return patient_table

    def create_probability_section(self, probabilities):
        """Create simple probability section"""
        
        if not probabilities:
            return None
        
        non_cancer_prob = probabilities.get('non_cancer', 0)
        cancer_prob = probabilities.get('cancer', 0)
        
        try:
            if isinstance(non_cancer_prob, str):
                non_cancer_prob = float(non_cancer_prob)
            if isinstance(cancer_prob, str):
                cancer_prob = float(cancer_prob)
        except (ValueError, TypeError):
            non_cancer_prob = 0.0
            cancer_prob = 0.0
        
        # Simple probability table
        prob_data = [
            ['KATEGORI', 'PROBABILITAS', 'INTERPRETASI'],
            [
                'Non-Cancer',
                f'{non_cancer_prob:.1f}%',
                'Kemungkinan jaringan sehat'
            ],
            [
                'Cancer',
                f'{cancer_prob:.1f}%',
                'Kemungkinan jaringan abnormal'
            ]
        ]
        
        prob_table = Table(prob_data, colWidths=[2.2*inch, 1.8*inch, 3*inch])
        prob_table.setStyle(TableStyle([
            # Header
            ('BACKGROUND', (0, 0), (-1, 0), self.colors['primary_blue']),
            ('TEXTCOLOR', (0, 0), (-1, 0), self.colors['white']),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 11),
            ('ALIGN', (0, 0), (-1, 0), 'CENTER'),
            
            # Data rows
            ('BACKGROUND', (0, 1), (-1, -1), self.colors['white']),
            ('TEXTCOLOR', (0, 1), (-1, -1), self.colors['dark_gray']),
            ('FONTNAME', (0, 1), (1, -1), 'Helvetica-Bold'),
            ('FONTNAME', (2, 1), (2, -1), 'Helvetica'),
            ('FONTSIZE', (0, 1), (-1, -1), 10),
            ('ALIGN', (0, 1), (0, -1), 'LEFT'),
            ('ALIGN', (1, 1), (1, -1), 'CENTER'),
            ('ALIGN', (2, 1), (2, -1), 'LEFT'),
            
            # Grid and borders
            ('GRID', (0, 0), (-1, -1), 1, self.colors['table_border']),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('TOPPADDING', (0, 0), (-1, -1), 8),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
            ('LEFTPADDING', (0, 0), (-1, -1), 10),
            ('RIGHTPADDING', (0, 0), (-1, -1), 10)
        ]))
        
        return prob_table

    def base64_to_image_file(self, base64_string, filename_prefix="modern_image"):
        """Convert base64 to temporary image file"""
        try:
            if not base64_string:
                return None
                
            if ',' in base64_string:
                base64_string = base64_string.split(',')[1]
            
            image_data = base64.b64decode(base64_string)
            
            temp_file = tempfile.NamedTemporaryFile(
                delete=False, 
                suffix='.png', 
                prefix=f"{filename_prefix}_"
            )
            temp_file.write(image_data)
            temp_file.close()
            
            self.temp_files.append(temp_file.name)
            
            print(f"Modern image decoded: {temp_file.name} ({len(image_data)} bytes)")
            return temp_file.name
            
        except Exception as e:
            print(f"Error converting base64 to image: {e}")
            return None

    def create_image_section(self, story, title, base64_image, description):
        """Create clean image section"""
        
        try:
            if base64_image:
                image_file = self.base64_to_image_file(base64_image, title.lower().replace(' ', '_'))
                
                if image_file and os.path.exists(image_file):
                    try:
                        # Clean image with simple border
                        img = RLImage(image_file, width=5*inch, height=3.8*inch)
                        img.hAlign = 'CENTER'
                        
                        # Simple image container
                        image_data = [[img]]
                        image_container = Table(image_data, colWidths=[5.2*inch])
                        image_container.setStyle(TableStyle([
                            ('BACKGROUND', (0, 0), (-1, -1), self.colors['white']),
                            ('GRID', (0, 0), (-1, -1), 1, self.colors['table_border']),
                            ('TOPPADDING', (0, 0), (-1, -1), 8),
                            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
                            ('LEFTPADDING', (0, 0), (-1, -1), 8),
                            ('RIGHTPADDING', (0, 0), (-1, -1), 8),
                            ('ALIGN', (0, 0), (-1, -1), 'CENTER')
                        ]))
                        
                        story.append(image_container)
                        story.append(Spacer(1, 8))
                        
                        # Simple caption
                        caption_text = f"<b>{title}</b><br/>{description}"
                        story.append(Paragraph(caption_text, self.modern_caption_style))
                        story.append(Spacer(1, 20))
                        
                        print(f"Modern image section added: {title}")
                        return True
                        
                    except Exception as img_error:
                        print(f"Error adding image {title}: {img_error}")
                        return False
                else:
                    print(f"Image file not created for {title}")
                    return False
            else:
                print(f"No base64 data for {title}")
                return False
                
        except Exception as e:
            print(f"Error creating image section for {title}: {e}")
            return False

    def generate_professional_pdf(self, result_data, output_path):
        """Generate modern simple premium medical PDF"""
        
        try:
            print(f"Modern Simple PDF Generator: Creating hospital-style PDF at {output_path}")
            
            # Create clean document
            doc = SimpleDocTemplate(
                output_path,
                pagesize=A4,
                rightMargin=2*cm,
                leftMargin=2*cm,
                topMargin=1.5*cm,
                bottomMargin=2*cm,
                title="Laporan Analisis AI Deteksi Kanker Mulut",
                author="AI Medical Solutions",
                subject="Modern Medical AI Analysis Report"
            )
            
            # Build clean content
            story = []
            
            # ==================== HOSPITAL HEADER ====================
            self.create_hospital_header(story)
            
            # ==================== CLEAN TITLE ====================
            title_text = "LAPORAN ANALISIS DETEKSI KANKER MULUT"
            story.append(Paragraph(title_text, self.hospital_title_style))
            
            subtitle_text = "Sistem Kecerdasan Buatan dengan Teknologi MobileNetV2 dan Grad-CAM"
            story.append(Paragraph(subtitle_text, self.hospital_subtitle_style))
            
            # ==================== SUMMARY SECTION ====================
            story.append(Paragraph("RINGKASAN ANALISIS", self.section_header_style))
            summary_table = self.create_summary_section(result_data)
            story.append(summary_table)
            story.append(Spacer(1, 20))
            
            # ==================== PATIENT INFORMATION ====================
            patient_data = result_data.get('patient_data', {})
            patient_table = self.create_patient_section(patient_data)
            
            if patient_table:
                story.append(Paragraph("INFORMASI PASIEN", self.section_header_style))
                story.append(patient_table)
                story.append(Spacer(1, 20))
            
            # ==================== PROBABILITY ANALYSIS ====================
            probabilities = result_data.get('probabilities', {})
            prob_table = self.create_probability_section(probabilities)
            
            if prob_table:
                story.append(Paragraph("ANALISIS PROBABILITAS", self.section_header_style))
                story.append(prob_table)
                story.append(Spacer(1, 20))
            
            # ==================== PAGE BREAK FOR IMAGES ====================
            story.append(PageBreak())
            
            # ==================== VISUALISASI MEDIS ====================
            story.append(Paragraph("VISUALISASI MEDIS", self.section_header_style))
            
            # Clean introduction
            intro_text = (
                "Berikut adalah visualisasi hasil analisis AI menggunakan teknologi Grad-CAM "
                "yang menampilkan gambar asli, peta panas AI, dan analisis overlay."
            )
            story.append(Paragraph(intro_text, self.clean_body_style))
            story.append(Spacer(1, 15))
            
            # Medical Images
            self.create_image_section(
                story, 
                "1. Gambar Medis Asli", 
                result_data.get('original_img'), 
                "Citra medis asli yang dianalisis oleh sistem AI."
            )
            
            self.create_image_section(
                story, 
                "2. Peta Panas AI (Grad-CAM)", 
                result_data.get('heatmap_img'), 
                "Visualisasi area fokus AI menggunakan teknologi Grad-CAM."
            )
            
            self.create_image_section(
                story, 
                "3. Analisis Overlay", 
                result_data.get('overlay_img'), 
                "Gabungan gambar asli dengan peta panas untuk analisis lengkap."
            )
            
            # ==================== INTERPRETASI ====================
            story.append(Spacer(1, 25))
            story.append(Paragraph("INTERPRETASI HASIL", self.section_header_style))
            
            prediction = str(result_data.get('prediction', 'Tidak diketahui'))
            confidence = result_data.get('confidence', 0)
            
            try:
                confidence_num = float(confidence)
            except (ValueError, TypeError):
                confidence_num = 0.0
            
            interpretation_text = f"""
            Berdasarkan analisis menggunakan teknologi AI MobileNetV2 dengan Enhanced Grad-CAM, 
            sistem telah menganalisis gambar medis dan memberikan prediksi <b>{prediction}</b> 
            dengan tingkat keyakinan <b>{confidence_num:.1f}%</b>.
            
            <br/><br/>
            
            {"Hasil ini menunjukkan kemungkinan adanya karakteristik yang perlu mendapat perhatian medis lebih lanjut. Disarankan untuk berkonsultasi dengan dokter spesialis untuk evaluasi dan pemeriksaan lanjutan." if prediction.lower() == "cancer" else "Hasil analisis menunjukkan kemungkinan rendah adanya karakteristik abnormal. Namun, tetap disarankan untuk melakukan pemeriksaan rutin sesuai jadwal yang direkomendasikan."}
            """
            
            story.append(Paragraph(interpretation_text, self.clean_body_style))
            story.append(Spacer(1, 25))
            
            # ==================== DISCLAIMER ====================
            story.append(Paragraph("DISCLAIMER MEDIS", self.section_header_style))
            
            disclaimer_text = """
            Laporan ini dihasilkan oleh sistem kecerdasan buatan untuk tujuan penelitian dan 
            edukasi medis. Hasil analisis AI ini tidak dapat menggantikan diagnosis medis 
            profesional yang dilakukan oleh tenaga medis yang kompeten. Selalu konsultasikan 
            hasil ini dengan dokter spesialis untuk mendapatkan diagnosis dan penanganan yang tepat.
            """
            
            story.append(Paragraph(disclaimer_text, self.simple_disclaimer_style))
            story.append(Spacer(1, 25))
            
            # ==================== SIMPLE FOOTER ====================
            footer_text = f"""
            <para align="center">
            <b>AI Oral Cancer Detection System</b><br/>
            Laporan dibuat pada: {datetime.now().strftime('%d %B %Y, %H:%M:%S')}<br/>
            © 2025 AI Medical Solutions. All rights reserved.
            </para>
            """
            
            footer_style = ParagraphStyle(
                'SimpleFooter',
                parent=self.styles['Normal'],
                fontSize=9,
                alignment=TA_CENTER,
                textColor=self.colors['medium_gray'],
                backColor=self.colors['light_gray'],
                borderWidth=1,
                borderColor=self.colors['table_border'],
                borderPadding=10
            )
            
            story.append(Paragraph(footer_text, footer_style))
            
            # ==================== BUILD PDF ====================
            
            try:
                doc.build(story)
                print(f"Modern simple PDF built successfully")
            except Exception as build_error:
                print(f"PDF build error: {build_error}")
                raise build_error
            
            # Verify PDF creation
            if os.path.exists(output_path):
                file_size = os.path.getsize(output_path)
                print(f"Modern PDF file size: {file_size} bytes")
                
                if file_size > 0:
                    print(f"Modern Simple PDF generated: {output_path} ({file_size} bytes)")
                    return True
                else:
                    print(f"PDF file is empty")
                    return False
            else:
                print(f"PDF file not created")
                return False
                
        except Exception as e:
            print(f"Modern PDF generation error: {e}")
            import traceback
            traceback.print_exc()
            return False
        
        finally:
            # Cleanup temporary files
            self.cleanup_temp_files()

    def cleanup_temp_files(self):
        """Clean up temporary image files"""
        for temp_file in self.temp_files:
            try:
                if os.path.exists(temp_file):
                    os.remove(temp_file)
                    print(f"Modern temp file cleaned: {temp_file}")
            except Exception as e:
                print(f"Could not remove temp file {temp_file}: {e}")
        
        self.temp_files.clear()

# Modern Global Instance
try:
    if REPORTLAB_AVAILABLE:
        modern_simple_premium_pdf_generator = ModernSimplePremiumPDFGenerator()
        print("Modern Simple PDF Generator: Hospital-style generator ready")
    else:
        modern_simple_premium_pdf_generator = None
        print("Modern Simple PDF Generator: ReportLab not available")
except Exception as e:
    modern_simple_premium_pdf_generator = None
    print(f"Modern Simple PDF Generator initialization failed: {e}")

# Backward compatibility
premium_medical_pdf_generator = modern_simple_premium_pdf_generator
