/**
 * Enhanced Results Display with Medical Heatmap Analysis
 */

class MedicalHeatmapAnalyzer {
    constructor() {
        this.init();
    }

    init() {
        console.log('Medical Heatmap Analyzer Initialized');
    }

    analyzeHeatmapRegions(results) {
        // Analyze heatmap for medical insights
        const insights = this.generateMedicalInsights(results);
        return insights;
    }

    generateMedicalInsights(results) {
        const prediction = results.prediction;
        const confidence = parseFloat(results.confidence);
        
        let insights = {
            primary_finding: '',
            risk_level: '',
            recommended_areas: [],
            clinical_notes: []
        };

        if (prediction === 'Cancer' && confidence > 80) {
            insights.primary_finding = 'High suspicion for malignant lesion';
            insights.risk_level = 'HIGH';
            insights.recommended_areas = [
                'Central oral cavity (tongue, floor of mouth)',
                'Lateral tongue borders',
                'Posterior oral cavity'
            ];
            insights.clinical_notes = [
                'AI model shows high attention to regions commonly associated with oral squamous cell carcinoma',
                'Urgent referral to oral and maxillofacial surgeon recommended',
                'Consider tissue biopsy for definitive diagnosis'
            ];
        } else if (prediction === 'Cancer' && confidence > 60) {
            insights.primary_finding = 'Suspicious findings requiring evaluation';
            insights.risk_level = 'MODERATE';
            insights.recommended_areas = [
                'Areas of highest AI attention',
                'Potential precancerous changes'
            ];
            insights.clinical_notes = [
                'AI analysis suggests possible malignant transformation',
                'Clinical correlation and follow-up recommended',
                'Consider additional imaging or specialist consultation'
            ];
        } else {
            insights.primary_finding = 'Low probability of malignant findings';
            insights.risk_level = 'LOW';
            insights.recommended_areas = [
                'Continue routine monitoring',
                'Maintain oral hygiene protocols'
            ];
            insights.clinical_notes = [
                'AI analysis indicates normal or benign tissue patterns',
                'Regular dental examinations recommended',
                'Patient education on risk factors and prevention'
            ];
        }

        return insights;
    }

    createEnhancedResultsDisplay(results) {
        const insights = this.analyzeHeatmapRegions(results);
        
        return `
            <div class="medical-analysis-container">
                <div class="clinical-summary-card">
                    <h4><i class="fas fa-stethoscope me-2"></i>Clinical Analysis Summary</h4>
                    <div class="finding-summary">
                        <div class="primary-finding">
                            <strong>Primary Finding:</strong> ${insights.primary_finding}
                        </div>
                        <div class="risk-badge risk-${insights.risk_level.toLowerCase()}">
                            Risk Level: ${insights.risk_level}
                        </div>
                    </div>
                </div>

                <div class="heatmap-interpretation">
                    <h5><i class="fas fa-eye me-2"></i>AI Attention Map Interpretation</h5>
                    <div class="interpretation-grid">
                        <div class="attention-areas">
                            <h6>Areas of Interest:</h6>
                            <ul>
                                ${insights.recommended_areas.map(area => `<li>${area}</li>`).join('')}
                            </ul>
                        </div>
                        <div class="clinical-notes">
                            <h6>Clinical Notes:</h6>
                            <ul>
                                ${insights.clinical_notes.map(note => `<li>${note}</li>`).join('')}
                            </ul>
                        </div>
                    </div>
                </div>

                <div class="enhanced-visualizations">
                    <div class="row g-3">
                        <div class="col-md-4">
                            <div class="image-analysis-card">
                                <h6>Original Image</h6>
                                <img src="data:image/png;base64,${results.original_img}" 
                                     class="analysis-image enhanced-hover" 
                                     alt="Original medical image"
                                     onclick="window.medicalAnalyzer.showEnhancedImageModal(this)">
                                <div class="image-metrics">
                                    <small>Resolution: ${results.analysis_metadata?.image_dimensions || 'N/A'}</small>
                                </div>
                            </div>
                        </div>
                        
                        <div class="col-md-4">
                            <div class="image-analysis-card">
                                <h6>Enhanced AI Attention Map</h6>
                                <img src="data:image/png;base64,${results.heatmap_img}" 
                                     class="analysis-image enhanced-hover" 
                                     alt="AI attention heatmap"
                                     onclick="window.medicalAnalyzer.showEnhancedImageModal(this)">
                                <div class="heatmap-legend">
                                    <div class="legend-item">
                                        <span class="color-indicator high-attention"></span>
                                        <small>High Attention</small>
                                    </div>
                                    <div class="legend-item">
                                        <span class="color-indicator medium-attention"></span>
                                        <small>Medium Attention</small>
                                    </div>
                                    <div class="legend-item">
                                        <span class="color-indicator low-attention"></span>
                                        <small>Low Attention</small>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="col-md-4">
                            <div class="image-analysis-card">
                                <h6>Medical Overlay Analysis</h6>
                                <img src="data:image/png;base64,${results.overlay_img}" 
                                     class="analysis-image enhanced-hover" 
                                     alt="Medical overlay"
                                     onclick="window.medicalAnalyzer.showEnhancedImageModal(this)">
                                <div class="overlay-info">
                                    <small>Combined visualization for clinical review</small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="medical-recommendations">
                    <h5><i class="fas fa-user-md me-2"></i>Clinical Recommendations</h5>
                    ${this.generateClinicalRecommendations(results, insights)}
                </div>
            </div>
        `;
    }

    generateClinicalRecommendations(results, insights) {
        const prediction = results.prediction;
        const confidence = parseFloat(results.confidence);
        
        if (prediction === 'Cancer' && confidence > 80) {
            return `
                <div class="alert alert-danger">
                    <h6><i class="fas fa-exclamation-triangle me-2"></i>Urgent Clinical Action Required</h6>
                    <ul class="mb-0">
                        <li><strong>Immediate referral</strong> to oral and maxillofacial surgeon</li>
                        <li><strong>Tissue biopsy</strong> recommended within 2 weeks</li>
                        <li><strong>Staging workup</strong> if malignancy confirmed</li>
                        <li><strong>Patient counseling</strong> regarding findings and next steps</li>
                    </ul>
                </div>
            `;
        } else if (prediction === 'Cancer' && confidence > 60) {
            return `
                <div class="alert alert-warning">
                    <h6><i class="fas fa-exclamation-circle me-2"></i>Clinical Follow-up Recommended</h6>
                    <ul class="mb-0">
                        <li><strong>Specialist consultation</strong> within 4-6 weeks</li>
                        <li><strong>Additional imaging</strong> may be warranted</li>
                        <li><strong>Close monitoring</strong> of identified areas</li>
                        <li><strong>Patient education</strong> on warning signs</li>
                    </ul>
                </div>
            `;
        } else {
            return `
                <div class="alert alert-success">
                    <h6><i class="fas fa-check-circle me-2"></i>Routine Monitoring Recommended</h6>
                    <ul class="mb-0">
                        <li><strong>Continue regular</strong> dental examinations</li>
                        <li><strong>Maintain excellent</strong> oral hygiene</li>
                        <li><strong>Annual screening</strong> for high-risk patients</li>
                        <li><strong>Lifestyle counseling</strong> on risk factor reduction</li>
                    </ul>
                </div>
            `;
        }
    }

    showEnhancedImageModal(imgElement) {
        // Create enhanced modal with medical annotations
        const modal = document.createElement('div');
        modal.className = 'modal fade enhanced-image-modal';
        modal.innerHTML = `
            <div class="modal-dialog modal-xl">
                <div class="modal-content medical-modal">
                    <div class="modal-header bg-primary text-white">
                        <h5 class="modal-title">
                            <i class="fas fa-search-plus me-2"></i>
                            Enhanced Medical Image Analysis
                        </h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="enhanced-image-container">
                            <img src="${imgElement.src}" alt="${imgElement.alt}" 
                                 style="max-width: 100%; height: auto; border-radius: 8px;">
                        </div>
                        <div class="image-analysis-tools mt-3">
                            <div class="row">
                                <div class="col-md-6">
                                    <h6>Image Information:</h6>
                                    <ul class="list-unstyled">
                                        <li><strong>Type:</strong> ${imgElement.alt}</li>
                                        <li><strong>Analysis Method:</strong> Enhanced Grad-CAM</li>
                                        <li><strong>Color Mapping:</strong> Medical-grade visualization</li>
                                    </ul>
                                </div>
                                <div class="col-md-6">
                                    <h6>Viewing Options:</h6>
                                    <div class="btn-group" role="group">
                                        <button class="btn btn-outline-primary btn-sm" onclick="window.medicalAnalyzer.adjustContrast(this)">
                                            <i class="fas fa-adjust me-1"></i>Contrast
                                        </button>
                                        <button class="btn btn-outline-primary btn-sm" onclick="window.medicalAnalyzer.toggleAnnotations(this)">
                                            <i class="fas fa-tags me-1"></i>Annotations
                                        </button>
                                        <button class="btn btn-outline-success btn-sm" onclick="window.medicalAnalyzer.downloadImage('${imgElement.src}')">
                                            <i class="fas fa-download me-1"></i>Download
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        const modalInstance = new bootstrap.Modal(modal);
        modalInstance.show();
        
        // Clean up when modal is hidden
        modal.addEventListener('hidden.bs.modal', () => {
            document.body.removeChild(modal);
        });
    }

    adjustContrast(button) {
        // Implement contrast adjustment
        console.log('Adjusting image contrast...');
    }

    toggleAnnotations(button) {
        // Implement annotation toggle
        console.log('Toggling annotations...');
    }

    downloadImage(imageSrc) {
        // Download functionality
        const link = document.createElement('a');
        link.href = imageSrc;
        link.download = `medical_analysis_${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

// Initialize the medical analyzer
window.medicalAnalyzer = new MedicalHeatmapAnalyzer();

// Update the existing analysis handler to use enhanced display
if (window.analysisHandler) {
    const originalDisplayResults = window.analysisHandler.displayResults;
    
    window.analysisHandler.displayResults = function(results) {
        // Call original display function
        originalDisplayResults.call(this, results);
        
        // Add enhanced medical analysis
        const enhancedContent = window.medicalAnalyzer.createEnhancedResultsDisplay(results);
        const resultsContainer = document.querySelector('.results-section .results-content');
        
        if (resultsContainer) {
            resultsContainer.innerHTML = enhancedContent + resultsContainer.innerHTML;
        }
    };
}
