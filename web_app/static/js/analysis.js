/**
 * Enhanced Analysis Results Handler - COMPLETE FIXED VERSION
 * AI Oral Cancer Detection System - Professional Medical Interface
 * Handles analysis results display, PDF download, and user interactions
 */

class AnalysisHandler {
    constructor() {
        this.init();
        this.setupEventListeners();
        this.currentResults = null;
        this.currentResultFile = null;
        
        // Configuration
        this.config = {
            animationDuration: 600,
            notificationTimeout: {
                success: 3000,
                error: 5000,
                info: 4000
            },
            pdfDownloadTimeout: 30000 // 30 seconds timeout for PDF generation
        };
    }

    init() {
        console.log('Enhanced Analysis Handler Initialized - AI Oral Cancer Detection');
        
        this.resultsSection = document.getElementById('resultsSection');
        
        // Initialize modals with enhanced error handling
        this.initializeModals();
        
        // Initialize notification system
        this.initializeNotificationSystem();
        
        // Setup global event listeners
        this.setupGlobalEventListeners();
    }

    initializeModals() {
        console.log('Initializing modal system...');
        
        // Check if Bootstrap is available
        if (typeof bootstrap !== 'undefined') {
            const imageModal = document.getElementById('imageModal');
            if (imageModal) {
                try {
                    this.imageModalInstance = new bootstrap.Modal(imageModal, {
                        backdrop: true,
                        keyboard: true,
                        focus: true
                    });
                    console.log('Bootstrap modal initialized successfully');
                } catch (error) {
                    console.warn('Bootstrap modal initialization failed:', error);
                    this.imageModalInstance = null;
                }
            } else {
                console.warn('Image modal element not found - creating fallback');
                this.createModalFallback();
            }
        } else {
            console.warn('Bootstrap not available - using custom modal system');
            this.createModalFallback();
        }
    }

    createModalFallback() {
        // Create modal HTML if it doesn't exist
        const modalHTML = `
            <div class="modal fade" id="imageModal" tabindex="-1" aria-labelledby="imageModalLabel" aria-hidden="true">
                <div class="modal-dialog modal-xl modal-dialog-centered">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="imageModalLabel">Medical Image Viewer</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body text-center">
                            <img id="modalImage" src="" alt="" class="img-fluid" style="max-height: 70vh;">
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                            <button type="button" class="btn btn-primary" onclick="window.analysisHandler.downloadModalImage()">
                                <i class="fas fa-download me-1"></i>Download Image
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Add modal to DOM if not exists
        if (!document.getElementById('imageModal')) {
            document.body.insertAdjacentHTML('beforeend', modalHTML);
            console.log('Modal fallback created successfully');
        }
    }

    initializeNotificationSystem() {
        // Create notification container if it doesn't exist
        if (!document.getElementById('notificationContainer')) {
            const container = document.createElement('div');
            container.id = 'notificationContainer';
            container.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 9999;
                max-width: 400px;
                pointer-events: none;
            `;
            document.body.appendChild(container);
        }
        
        // Add notification styles
        this.addNotificationStyles();
    }

    addNotificationStyles() {
        const styles = `
            <style id="analysisHandlerStyles">
                .notification {
                    background: white;
                    border-radius: 8px;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
                    padding: 16px 20px;
                    margin-bottom: 10px;
                    display: flex;
                    align-items: center;
                    transform: translateX(100%);
                    opacity: 0;
                    transition: all 0.3s ease-out;
                    pointer-events: auto;
                    min-width: 300px;
                    border-left: 4px solid;
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                }
                
                .notification.show {
                    transform: translateX(0);
                    opacity: 1;
                }
                
                .notification.success {
                    border-left-color: #10b981;
                    background: linear-gradient(90deg, #ecfdf5 0%, #ffffff 100%);
                }
                
                .notification.error {
                    border-left-color: #ef4444;
                    background: linear-gradient(90deg, #fef2f2 0%, #ffffff 100%);
                }
                
                .notification.info {
                    border-left-color: #3b82f6;
                    background: linear-gradient(90deg, #eff6ff 0%, #ffffff 100%);
                }
                
                .notification.warning {
                    border-left-color: #f59e0b;
                    background: linear-gradient(90deg, #fffbeb 0%, #ffffff 100%);
                }
                
                .notification-icon {
                    font-size: 1.25rem;
                    margin-right: 12px;
                    flex-shrink: 0;
                }
                
                .notification.success .notification-icon {
                    color: #10b981;
                }
                
                .notification.error .notification-icon {
                    color: #ef4444;
                }
                
                .notification.info .notification-icon {
                    color: #3b82f6;
                }
                
                .notification.warning .notification-icon {
                    color: #f59e0b;
                }
                
                .notification-content {
                    flex: 1;
                    font-size: 14px;
                    line-height: 1.4;
                    color: #374151;
                }
                
                .notification-title {
                    font-weight: 600;
                    margin-bottom: 2px;
                }
                
                .notification-message {
                    font-weight: 400;
                    opacity: 0.8;
                }
                
                .notification-close {
                    background: none;
                    border: none;
                    font-size: 1.1rem;
                    color: #6b7280;
                    cursor: pointer;
                    padding: 0;
                    margin-left: 12px;
                    flex-shrink: 0;
                    opacity: 0.7;
                    transition: opacity 0.2s;
                }
                
                .notification-close:hover {
                    opacity: 1;
                }
                
                /* Results section animations */
                .results-content {
                    opacity: 0;
                    transform: translateY(30px);
                    transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
                }
                
                .results-content.show {
                    opacity: 1;
                    transform: translateY(0);
                }
                
                /* Enhanced card styles */
                .image-card {
                    background: white;
                    border-radius: 12px;
                    padding: 16px;
                    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                    transition: all 0.3s ease;
                    height: 100%;
                }
                
                .image-card:hover {
                    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
                    transform: translateY(-2px);
                }
                
                .image-wrapper {
                    position: relative;
                    overflow: hidden;
                    border-radius: 8px;
                    transition: all 0.3s ease;
                }
                
                .image-wrapper:hover {
                    transform: scale(1.02);
                }
                
                .result-image {
                    transition: all 0.3s ease;
                    cursor: pointer;
                }
                
                .result-image:hover {
                    opacity: 0.9;
                }
                
                /* Probability bars animation */
                .progress-bar {
                    transition: width 1s ease-out;
                }
                
                /* Loading states */
                .btn-loading {
                    position: relative;
                    color: transparent !important;
                }
                
                .btn-loading::after {
                    content: "";
                    position: absolute;
                    width: 16px;
                    height: 16px;
                    top: 50%;
                    left: 50%;
                    margin-left: -8px;
                    margin-top: -8px;
                    border: 2px solid transparent;
                    border-top-color: #ffffff;
                    border-radius: 50%;
                    animation: btn-loading-spin 1s ease infinite;
                }
                
                @keyframes btn-loading-spin {
                    from { transform: rotate(0turn); }
                    to { transform: rotate(1turn); }
                }
                
                /* Medical theme colors */
                .result-header.cancer {
                    background: linear-gradient(135deg, #fef2f2 0%, #ffffff 100%);
                    border: 2px solid #fecaca;
                    border-radius: 12px;
                    padding: 20px;
                    margin-bottom: 20px;
                }
                
                .result-header.non-cancer {
                    background: linear-gradient(135deg, #ecfdf5 0%, #ffffff 100%);
                    border: 2px solid #bbf7d0;
                    border-radius: 12px;
                    padding: 20px;
                    margin-bottom: 20px;
                }
                
                /* Custom scrollbar for results */
                .results-content::-webkit-scrollbar {
                    width: 6px;
                }
                
                .results-content::-webkit-scrollbar-track {
                    background: #f1f5f9;
                    border-radius: 3px;
                }
                
                .results-content::-webkit-scrollbar-thumb {
                    background: #cbd5e1;
                    border-radius: 3px;
                }
                
                .results-content::-webkit-scrollbar-thumb:hover {
                    background: #94a3b8;
                }
            </style>
        `;
        
        if (!document.getElementById('analysisHandlerStyles')) {
            document.head.insertAdjacentHTML('beforeend', styles);
        }
    }

    setupEventListeners() {
        console.log('Setting up event listeners...');
        
        // Listen for analysis completion events
        document.addEventListener('analysisComplete', (event) => {
            this.handleAnalysisComplete(event.detail);
        });

        document.addEventListener('analysisError', (event) => {
            this.handleAnalysisError(event.detail);
        });

        // Global click handler for result interactions
        document.addEventListener('click', (e) => {
            this.handleGlobalClick(e);
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardShortcuts(e);
        });
    }

    setupGlobalEventListeners() {
        // Handle window resize for responsive modals
        window.addEventListener('resize', () => {
            this.handleResize();
        });
        
        // Handle visibility change for pausing animations
        document.addEventListener('visibilitychange', () => {
            this.handleVisibilityChange();
        });
    }

    handleGlobalClick(e) {
        // Handle image clicks for modal display
        if (e.target.closest('.result-image')) {
            e.preventDefault();
            const img = e.target.closest('.result-image');
            this.showImageModal(img.src, img.alt);
            return;
        }
        
        // Handle PDF download button
        if (e.target.closest('#downloadPdfBtn, .btn-download-pdf')) {
            e.preventDefault();
            this.downloadPDF();
            return;
        }
        
        // Handle other action buttons
        if (e.target.closest('.btn-new-analysis')) {
            e.preventDefault();
            this.newAnalysis();
            return;
        }
        
        if (e.target.closest('.btn-share-results')) {
            e.preventDefault();
            this.shareResults();
            return;
        }
        
        if (e.target.closest('.btn-save-results')) {
            e.preventDefault();
            this.saveResults();
            return;
        }
    }

    handleKeyboardShortcuts(e) {
        // Ctrl/Cmd + D for download PDF
        if ((e.ctrlKey || e.metaKey) && e.key === 'd' && this.currentResults) {
            e.preventDefault();
            this.downloadPDF();
        }
        
        // Ctrl/Cmd + N for new analysis
        if ((e.ctrlKey || e.metaKey) && e.key === 'n' && this.currentResults) {
            e.preventDefault();
            this.newAnalysis();
        }
        
        // Escape to close modals
        if (e.key === 'Escape') {
            this.closeAllModals();
        }
    }

    handleAnalysisComplete(results) {
        console.log('Analysis completed successfully:', results);
        this.currentResults = results;
        this.currentResultFile = results.result_file;
        
        // Store in global scope for other handlers
        window.currentResultFile = results.result_file;
        window.currentAnalysisResults = results;
        
        this.displayResults(results);
        this.showNotification('Analysis completed successfully!', 'success', 'Analysis Complete');
        
        // Track analytics event
        this.trackEvent('analysis_complete', {
            prediction: results.prediction,
            confidence: results.confidence
        });
    }

    handleAnalysisError(error) {
        console.error('Analysis failed:', error);
        this.showNotification(
            error.message || 'Analysis failed. Please try again.',
            'error',
            'Analysis Failed'
        );
        
        // Track analytics event
        this.trackEvent('analysis_error', {
            error: error.message || 'Unknown error'
        });
    }

    displayResults(results) {
        if (!this.resultsSection) {
            console.error('Results section not found');
            this.showNotification('Results display error. Please refresh the page.', 'error');
            return;
        }

        console.log('Displaying analysis results...');

        // Create and insert results HTML
        const resultsHTML = this.createResultsHTML(results);
        this.resultsSection.innerHTML = resultsHTML;
        this.resultsSection.style.display = 'block';

        // Animate results appearance
        setTimeout(() => {
            this.animateResultsAppearance();
        }, 100);
        
        // Animate probability bars
        setTimeout(() => {
            this.animateProbabilityBars();
        }, 800);
        
        // Scroll to results smoothly
        setTimeout(() => {
            this.scrollToResults();
        }, 500);
    }

    createResultsHTML(results) {
        const isCancer = results.prediction === 'Cancer';
        const confidence = parseFloat(results.confidence);
        
        return `
            <div class="results-content">
                ${this.createResultsHeader(results, isCancer, confidence)}
                ${this.createProbabilitySection(results)}
                ${this.createVisualizationSection(results)}
                ${this.createMetadataSection(results)}
                ${this.createActionsSection(results)}
                ${this.createDisclaimerSection()}
            </div>
        `;
    }

    createResultsHeader(results, isCancer, confidence) {
        const headerClass = isCancer ? 'cancer' : 'non-cancer';
        const iconClass = isCancer ? 'fa-exclamation-triangle' : 'fa-check-circle';
        const confidenceColor = confidence >= 85 ? '#10b981' : confidence >= 70 ? '#f59e0b' : '#ef4444';
        const confidenceLevel = confidence >= 85 ? 'Very High' : confidence >= 70 ? 'High' : confidence >= 60 ? 'Medium' : 'Low';
        
        return `
            <div class="result-header ${headerClass}">
                <div class="row align-items-center">
                    <div class="col-md-2 text-center">
                        <div class="prediction-icon" style="
                            width: 90px; 
                            height: 90px; 
                            background: ${isCancer ? 'linear-gradient(135deg, #ef4444, #dc2626)' : 'linear-gradient(135deg, #10b981, #059669)'}; 
                            border-radius: 50%; 
                            display: flex; 
                            align-items: center; 
                            justify-content: center; 
                            margin: 0 auto;
                            box-shadow: 0 8px 25px rgba(0,0,0,0.15);
                        ">
                            <i class="fas ${iconClass}" style="color: white; font-size: 2.2rem;"></i>
                        </div>
                    </div>
                    <div class="col-md-8">
                        <h2 class="prediction-text mb-3" style="
                            color: ${isCancer ? '#ef4444' : '#10b981'};
                            font-size: 2.5rem;
                            font-weight: 700;
                            margin: 0;
                            text-shadow: 0 2px 4px rgba(0,0,0,0.1);
                        ">
                            ${results.prediction}
                        </h2>
                        <div class="confidence-section">
                            <div class="d-flex justify-content-between align-items-center mb-2">
                                <span class="confidence-label" style="font-size: 1.1rem; font-weight: 600; color: #374151;">
                                    AI Confidence Level
                                </span>
                                <span class="confidence-badge badge" style="
                                    background-color: ${confidenceColor}; 
                                    font-size: 1rem; 
                                    padding: 6px 12px;
                                    border-radius: 20px;
                                ">
                                    ${confidenceLevel} (${results.confidence}%)
                                </span>
                            </div>
                            <div class="progress" style="height: 12px; border-radius: 6px; background-color: #f3f4f6;">
                                <div class="progress-bar" 
                                     style="
                                        width: 0%; 
                                        background: linear-gradient(90deg, ${confidenceColor}, ${confidenceColor}dd);
                                        border-radius: 6px;
                                        transition: width 1.5s cubic-bezier(0.4, 0, 0.2, 1);
                                     " 
                                     data-width="${results.confidence}"
                                     role="progressbar"></div>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-2 text-center">
                        <button class="btn btn-outline-primary btn-details" onclick="window.analysisHandler.showDetailedResults()">
                            <i class="fas fa-expand me-1"></i>
                            View Details
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    createProbabilitySection(results) {
        const nonCancerProb = parseFloat(results.probabilities.non_cancer);
        const cancerProb = parseFloat(results.probabilities.cancer);
        
        return `
            <div class="probability-section mt-4">
                <h4 class="section-title">
                    <i class="fas fa-chart-pie me-2" style="color: #3b82f6;"></i>
                    AI Probability Analysis
                </h4>
                <div class="row g-4">
                    <div class="col-md-6">
                        <div class="prob-card card h-100" style="border: none; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
                            <div class="card-body">
                                <div class="d-flex justify-content-between align-items-center mb-3">
                                    <div class="d-flex align-items-center">
                                        <i class="fas fa-heart" style="color: #10b981; font-size: 1.2rem; margin-right: 8px;"></i>
                                        <span class="fw-bold" style="color: #374151; font-size: 1.1rem;">Non-Cancer</span>
                                    </div>
                                    <span class="badge bg-success" style="font-size: 1rem; padding: 6px 12px;">
                                        ${results.probabilities.non_cancer}%
                                    </span>
                                </div>
                                <div class="progress" style="height: 12px; border-radius: 6px;">
                                    <div class="progress-bar bg-success" 
                                         style="width: 0%; transition: width 1.2s cubic-bezier(0.4, 0, 0.2, 1);" 
                                         data-width="${nonCancerProb}"
                                         role="progressbar"></div>
                                </div>
                                <small class="text-muted mt-2 d-block">
                                    Likelihood of healthy tissue
                                </small>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="prob-card card h-100" style="border: none; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
                            <div class="card-body">
                                <div class="d-flex justify-content-between align-items-center mb-3">
                                    <div class="d-flex align-items-center">
                                        <i class="fas fa-exclamation-circle" style="color: #ef4444; font-size: 1.2rem; margin-right: 8px;"></i>
                                        <span class="fw-bold" style="color: #374151; font-size: 1.1rem;">Cancer</span>
                                    </div>
                                    <span class="badge bg-danger" style="font-size: 1rem; padding: 6px 12px;">
                                        ${results.probabilities.cancer}%
                                    </span>
                                </div>
                                <div class="progress" style="height: 12px; border-radius: 6px;">
                                    <div class="progress-bar bg-danger" 
                                         style="width: 0%; transition: width 1.2s cubic-bezier(0.4, 0, 0.2, 1);" 
                                         data-width="${cancerProb}"
                                         role="progressbar"></div>
                                </div>
                                <small class="text-muted mt-2 d-block">
                                    Likelihood of cancerous tissue
                                </small>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    createVisualizationSection(results) {
        return `
            <div class="visualization-section mt-5">
                <h4 class="section-title">
                    <i class="fas fa-eye me-2" style="color: #8b5cf6;"></i>
                    AI Visualization Analysis
                </h4>
                <p class="text-muted mb-4">
                    Advanced AI attention mapping using Grad-CAM technology to highlight regions of interest
                </p>
                <div class="row g-4">
                    <div class="col-lg-4 col-md-6">
                        <div class="image-card text-center">
                            <h6 class="card-title mb-3" style="color: #374151; font-weight: 600;">
                                <i class="fas fa-image me-2" style="color: #6b7280;"></i>
                                Original Medical Image
                            </h6>
                            <div class="image-wrapper position-relative">
                                <img src="data:image/png;base64,${results.original_img}" 
                                     alt="Original Medical Image" 
                                     class="result-image img-fluid rounded-3 shadow-sm"
                                     style="cursor: pointer; max-height: 200px; object-fit: cover; width: 100%;">
                                <div class="image-overlay position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" 
                                     style="background: rgba(0,0,0,0.7); opacity: 0; transition: opacity 0.3s; border-radius: 12px;">
                                    <span style="color: white; font-weight: 500;">
                                        <i class="fas fa-expand me-2"></i>Click to enlarge
                                    </span>
                                </div>
                            </div>
                            <small class="text-muted d-block mt-3">
                                High-resolution medical imaging for analysis
                            </small>
                        </div>
                    </div>
                    <div class="col-lg-4 col-md-6">
                        <div class="image-card text-center">
                            <h6 class="card-title mb-3" style="color: #374151; font-weight: 600;">
                                <i class="fas fa-fire me-2" style="color: #ef4444;"></i>
                                AI Attention Heatmap
                            </h6>
                            <div class="image-wrapper position-relative">
                                <img src="data:image/png;base64,${results.heatmap_img}" 
                                     alt="AI Attention Heatmap" 
                                     class="result-image img-fluid rounded-3 shadow-sm"
                                     style="cursor: pointer; max-height: 200px; object-fit: cover; width: 100%;">
                                <div class="image-overlay position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" 
                                     style="background: rgba(0,0,0,0.7); opacity: 0; transition: opacity 0.3s; border-radius: 12px;">
                                    <span style="color: white; font-weight: 500;">
                                        <i class="fas fa-expand me-2"></i>Click to enlarge
                                    </span>
                                </div>
                            </div>
                            <small class="text-muted d-block mt-3">
                                Red/hot areas indicate higher AI attention and concern
                            </small>
                        </div>
                    </div>
                    <div class="col-lg-4 col-md-12">
                        <div class="image-card text-center">
                            <h6 class="card-title mb-3" style="color: #374151; font-weight: 600;">
                                <i class="fas fa-layer-group me-2" style="color: #3b82f6;"></i>
                                Enhanced Overlay Analysis
                            </h6>
                            <div class="image-wrapper position-relative">
                                <img src="data:image/png;base64,${results.overlay_img}" 
                                     alt="Enhanced Overlay Analysis" 
                                     class="result-image img-fluid rounded-3 shadow-sm"
                                     style="cursor: pointer; max-height: 200px; object-fit: cover; width: 100%;">
                                <div class="image-overlay position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" 
                                     style="background: rgba(0,0,0,0.7); opacity: 0; transition: opacity 0.3s; border-radius: 12px;">
                                    <span style="color: white; font-weight: 500;">
                                        <i class="fas fa-expand me-2"></i>Click to enlarge
                                    </span>
                                </div>
                            </div>
                            <small class="text-muted d-block mt-3">
                                Combined visualization with intelligent overlay mapping
                            </small>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    createMetadataSection(results) {
        const metadata = results.analysis_metadata || {};
        const technical = results.technical_details || {};
        
        return `
            <div class="metadata-section mt-5">
                <h4 class="section-title">
                    <i class="fas fa-info-circle me-2" style="color: #6b7280;"></i>
                    Analysis Metadata
                </h4>
                <div class="row g-3">
                    <div class="col-md-3 col-sm-6">
                        <div class="metadata-card card text-center" style="border: 1px solid #e5e7eb; border-radius: 8px;">
                            <div class="card-body py-3">
                                <i class="fas fa-clock" style="color: #3b82f6; font-size: 1.5rem; margin-bottom: 8px;"></i>
                                <div class="metadata-value" style="font-size: 1.1rem; font-weight: 600; color: #374151;">
                                    ${metadata.processing_time || 'N/A'}
                                </div>
                                <div class="metadata-label text-muted" style="font-size: 0.85rem;">
                                    Processing Time
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-3 col-sm-6">
                        <div class="metadata-card card text-center" style="border: 1px solid #e5e7eb; border-radius: 8px;">
                            <div class="card-body py-3">
                                <i class="fas fa-medal" style="color: #10b981; font-size: 1.5rem; margin-bottom: 8px;"></i>
                                <div class="metadata-value" style="font-size: 1.1rem; font-weight: 600; color: #374151;">
                                    ${metadata.model_confidence || 'High'}
                                </div>
                                <div class="metadata-label text-muted" style="font-size: 0.85rem;">
                                    Model Confidence
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-3 col-sm-6">
                        <div class="metadata-card card text-center" style="border: 1px solid #e5e7eb; border-radius: 8px;">
                            <div class="card-body py-3">
                                <i class="fas fa-image" style="color: #8b5cf6; font-size: 1.5rem; margin-bottom: 8px;"></i>
                                <div class="metadata-value" style="font-size: 1.1rem; font-weight: 600; color: #374151;">
                                    ${metadata.image_quality || 'Good'}
                                </div>
                                <div class="metadata-label text-muted" style="font-size: 0.85rem;">
                                    Image Quality
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-3 col-sm-6">
                        <div class="metadata-card card text-center" style="border: 1px solid #e5e7eb; border-radius: 8px;">
                            <div class="card-body py-3">
                                <i class="fas fa-brain" style="color: #f59e0b; font-size: 1.5rem; margin-bottom: 8px;"></i>
                                <div class="metadata-value" style="font-size: 1.1rem; font-weight: 600; color: #374151;">
                                    ${metadata.heatmap_method || 'Grad-CAM'}
                                </div>
                                <div class="metadata-label text-muted" style="font-size: 0.85rem;">
                                    AI Method
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    createActionsSection(results) {
        return `
            <div class="actions-section mt-5">
                <h4 class="section-title">
                    <i class="fas fa-tools me-2" style="color: #374151;"></i>
                    Available Actions
                </h4>
                <div class="row g-3">
                    <div class="col-lg-3 col-md-6">
                        <button class="btn btn-primary w-100 btn-action" id="downloadPdfBtn" style="height: 60px;">
                            <i class="fas fa-file-pdf me-2"></i>
                            <div>
                                <div style="font-weight: 600;">Download Report</div>
                                <small style="opacity: 0.9;">Professional PDF with AI analysis</small>
                            </div>
                        </button>
                    </div>
                    <div class="col-lg-3 col-md-6">
                        <button class="btn btn-outline-primary w-100 btn-action btn-new-analysis" style="height: 60px;">
                            <i class="fas fa-plus me-2"></i>
                            <div>
                                <div style="font-weight: 600;">New Analysis</div>
                                <small>Start fresh analysis</small>
                            </div>
                        </button>
                    </div>
                    <div class="col-lg-3 col-md-6">
                        <button class="btn btn-outline-success w-100 btn-action btn-share-results" style="height: 60px;">
                            <i class="fas fa-share me-2"></i>
                            <div>
                                <div style="font-weight: 600;">Share Results</div>
                                <small>Share with colleagues</small>
                            </div>
                        </button>
                    </div>
                    <div class="col-lg-3 col-md-6">
                        <button class="btn btn-outline-info w-100 btn-action btn-save-results" style="height: 60px;">
                            <i class="fas fa-save me-2"></i>
                            <div>
                                <div style="font-weight: 600;">Save Analysis</div>
                                <small>Save locally for later</small>
                            </div>
                        </button>
                    </div>
                </div>
                <div class="keyboard-shortcuts mt-3">
                    <small class="text-muted">
                        <i class="fas fa-keyboard me-1"></i>
                        Shortcuts: <kbd>Ctrl+D</kbd> Download PDF • <kbd>Ctrl+N</kbd> New Analysis • <kbd>Esc</kbd> Close Modals
                    </small>
                </div>
            </div>
        `;
    }

    createDisclaimerSection() {
        return `
            <div class="disclaimer-section mt-5">
                <div class="alert alert-warning" style="
                    border: none; 
                    border-radius: 12px; 
                    background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
                    border-left: 4px solid #f59e0b;
                    box-shadow: 0 4px 12px rgba(245, 158, 11, 0.1);
                ">
                    <div class="d-flex align-items-start">
                        <div class="flex-shrink-0 me-3">
                            <i class="fas fa-exclamation-triangle" style="color: #d97706; font-size: 1.5rem; margin-top: 2px;"></i>
                        </div>
                        <div class="flex-grow-1">
                            <h6 class="alert-heading" style="color: #92400e; margin-bottom: 12px; font-weight: 600;">
                                <i class="fas fa-shield-alt me-2"></i>
                                Important Medical Disclaimer
                            </h6>
                            <p class="mb-2" style="color: #92400e; line-height: 1.6;">
                                <strong>This AI analysis is for research and educational purposes only.</strong> 
                                The results presented should not be used as a substitute for professional medical diagnosis, 
                                treatment recommendations, or clinical decision-making.
                            </p>
                            <hr style="border-color: #f59e0b; opacity: 0.3; margin: 12px 0;">
                            <p class="mb-0" style="color: #92400e; font-size: 0.95rem; line-height: 1.5;">
                                <strong>Always consult with qualified healthcare professionals</strong> for proper medical 
                                evaluation, diagnosis, and treatment. This AI tool is designed to assist medical professionals 
                                and should be used in conjunction with clinical expertise and additional diagnostic methods.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // ENHANCED: Professional Image Modal with download capability
    showImageModal(src, alt) {
        try {
            console.log('Opening image modal:', alt);
            
            // Try Bootstrap modal first
            const modalImage = document.getElementById('modalImage');
            const imageModalLabel = document.getElementById('imageModalLabel');
            
            if (modalImage && imageModalLabel) {
                modalImage.src = src;
                modalImage.alt = alt;
                imageModalLabel.textContent = alt || 'Medical Image Viewer';
                
                if (this.imageModalInstance && typeof this.imageModalInstance.show === 'function') {
                    this.imageModalInstance.show();
                    this.currentModalImageSrc = src;
                    return;
                }
            }
            
            // Fallback: Create custom modal
            this.createCustomImageModal(src, alt);
            
        } catch (error) {
            console.error('Error showing image modal:', error);
            this.showNotification('Could not open image viewer', 'error');
            
            // Final fallback: open in new tab
            window.open(src, '_blank');
        }
    }

    createCustomImageModal(src, alt) {
        // Remove existing custom modal
        const existingModal = document.getElementById('customImageModal');
        if (existingModal) {
            existingModal.remove();
        }
        
        const modal = document.createElement('div');
        modal.id = 'customImageModal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.9);
            z-index: 9999;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
            animation: fadeIn 0.3s ease-out;
        `;
        
        const modalContent = document.createElement('div');
        modalContent.style.cssText = `
            background: white;
            border-radius: 12px;
            padding: 20px;
            max-width: 90vw;
            max-height: 90vh;
            display: flex;
            flex-direction: column;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        `;
        
        modalContent.innerHTML = `
            <div class="modal-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; border-bottom: 1px solid #e5e7eb; padding-bottom: 15px;">
                <h5 style="margin: 0; color: #374151; font-weight: 600;">${alt || 'Medical Image Viewer'}</h5>
                <button class="btn-close-custom" style="background: none; border: none; font-size: 24px; color: #6b7280; cursor: pointer; padding: 0; line-height: 1;">
                    &times;
                </button>
            </div>
            <div class="modal-body" style="text-align: center; flex: 1; overflow: auto;">
                <img src="${src}" alt="${alt}" style="max-width: 100%; max-height: 70vh; border-radius: 8px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);">
            </div>
            <div class="modal-footer" style="display: flex; gap: 10px; margin-top: 15px; padding-top: 15px; border-top: 1px solid #e5e7eb;">
                <button class="btn btn-secondary btn-close-modal" style="flex: 1;">Close</button>
                <button class="btn btn-primary btn-download-image" style="flex: 1;">
                    <i class="fas fa-download me-1"></i> Download Image
                </button>
            </div>
        `;
        
        modal.appendChild(modalContent);
        document.body.appendChild(modal);
        
        // Add event listeners
        const closeBtn = modalContent.querySelector('.btn-close-custom');
        const closeModalBtn = modalContent.querySelector('.btn-close-modal');
        const downloadBtn = modalContent.querySelector('.btn-download-image');
        
        const closeModal = () => {
            modal.style.animation = 'fadeOut 0.3s ease-out';
            setTimeout(() => {
                if (modal.parentNode) {
                    document.body.removeChild(modal);
                }
            }, 300);
        };
        
        closeBtn.addEventListener('click', closeModal);
        closeModalBtn.addEventListener('click', closeModal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
        
        downloadBtn.addEventListener('click', () => {
            this.downloadImage(src, alt);
        });
        
        // Store current modal image
        this.currentModalImageSrc = src;
    }

    downloadImage(src, filename) {
        try {
            const link = document.createElement('a');
            link.href = src;
            link.download = filename || `medical_image_${Date.now()}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            this.showNotification('Image downloaded successfully!', 'success');
        } catch (error) {
            console.error('Image download failed:', error);
            this.showNotification('Failed to download image', 'error');
        }
    }

    downloadModalImage() {
        if (this.currentModalImageSrc) {
            this.downloadImage(this.currentModalImageSrc, 'medical_analysis_image.png');
        }
    }

    // ENHANCED: Professional PDF Download with proper error handling
    async downloadPDF() {
        if (!this.currentResults || !this.currentResultFile) {
            this.showNotification('No analysis results available for download', 'error', 'Download Error');
            return;
        }

        const downloadBtn = document.getElementById('downloadPdfBtn');
        const originalContent = downloadBtn ? downloadBtn.innerHTML : '';
        
        try {
            console.log('Starting PDF download process...');
            
            // Show loading state
            if (downloadBtn) {
                downloadBtn.classList.add('btn-loading');
                downloadBtn.disabled = true;
            }
            
            this.showNotification('Generating professional PDF report...', 'info', 'PDF Generation');
            
            const response = await fetch(`/download_pdf/${this.currentResultFile}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/pdf',
                    'Cache-Control': 'no-cache'
                }
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                let errorMessage = 'Failed to generate PDF report';
                
                try {
                    const errorJson = JSON.parse(errorText);
                    errorMessage = errorJson.error || errorMessage;
                } catch (e) {
                    // Use default error message
                }
                
                throw new Error(errorMessage);
            }
            
            // Check content type
            const contentType = response.headers.get('content-type');
            console.log('Response content type:', contentType);
            
            if (!contentType || !contentType.includes('application/pdf')) {
                console.warn('Unexpected content type:', contentType);
                this.showNotification('Server returned unexpected file type. Download may not be a PDF.', 'warning');
            }
            
            // Handle response as blob for file download
            const blob = await response.blob();
            console.log('PDF blob size:', blob.size, 'bytes');
            
            if (blob.size === 0) {
                throw new Error('Received empty PDF file');
            }
            
            // Create download
            const url = window.URL.createObjectURL(blob);
            const downloadLink = document.createElement('a');
            downloadLink.href = url;
            
            // Generate filename with timestamp
            const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
            downloadLink.download = `AI_Oral_Cancer_Analysis_Report_${timestamp}.pdf`;
            
            // Trigger download
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
            
            // Cleanup
            window.URL.revokeObjectURL(url);
            
            this.showNotification('PDF report downloaded successfully!', 'success', 'Download Complete');
            console.log('PDF download completed successfully');
            
            // Track analytics
            this.trackEvent('pdf_download_success', {
                file_size: blob.size,
                prediction: this.currentResults.prediction
            });
            
        } catch (error) {
            console.error('PDF download failed:', error);
            this.showNotification(
                `PDF download failed: ${error.message}. Please try again or contact support.`,
                'error',
                'Download Failed'
            );
            
            // Track error
            this.trackEvent('pdf_download_error', {
                error: error.message
            });
        } finally {
            // Reset button state
            if (downloadBtn) {
                downloadBtn.classList.remove('btn-loading');
                downloadBtn.disabled = false;
                downloadBtn.innerHTML = originalContent;
            }
        }
    }

    shareResults() {
        if (!this.currentResults) {
            this.showNotification('No results available to share', 'error');
            return;
        }
        
        const shareData = {
            title: 'AI Oral Cancer Analysis Results',
            text: `AI Analysis Result: ${this.currentResults.prediction} (${this.currentResults.confidence}% confidence)`,
            url: window.location.href
        };
        
        if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
            navigator.share(shareData)
                .then(() => {
                    this.showNotification('Results shared successfully!', 'success');
                    this.trackEvent('results_shared', { method: 'native' });
                })
                .catch((error) => {
                    console.error('Sharing failed:', error);
                    this.fallbackShare(shareData);
                });
        } else {
            this.fallbackShare(shareData);
        }
    }

    fallbackShare(shareData) {
        // Fallback: copy to clipboard
        const shareText = `${shareData.title}\n${shareData.text}\n${shareData.url}`;
        
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(shareText)
                .then(() => {
                    this.showNotification('Results copied to clipboard!', 'success', 'Shared');
                    this.trackEvent('results_shared', { method: 'clipboard' });
                })
                .catch(() => {
                    this.manualCopyFallback(shareText);
                });
        } else {
            this.manualCopyFallback(shareText);
        }
    }

    manualCopyFallback(text) {
        // Manual copy fallback
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-9999px';
        document.body.appendChild(textArea);
        textArea.select();
        
        try {
            document.execCommand('copy');
            this.showNotification('Results copied to clipboard!', 'success');
            this.trackEvent('results_shared', { method: 'manual_copy' });
        } catch (err) {
            this.showNotification('Could not copy to clipboard. Please manually copy the URL.', 'error');
        }
        
        document.body.removeChild(textArea);
    }

    saveResults() {
        if (!this.currentResults) {
            this.showNotification('No results available to save', 'error');
            return;
        }
        
        try {
            const saveData = {
                ...this.currentResults,
                savedAt: new Date().toISOString(),
                version: '2.0'
            };
            
            // Save to localStorage
            const savedResults = JSON.parse(localStorage.getItem('oralCancerAnalysisHistory') || '[]');
            savedResults.unshift(saveData);
            
            // Keep only last 10 results
            const trimmedResults = savedResults.slice(0, 10);
            localStorage.setItem('oralCancerAnalysisHistory', JSON.stringify(trimmedResults));
            
            // Also save as current
            localStorage.setItem('lastAnalysisResults', JSON.stringify(saveData));
            
            this.showNotification('Analysis results saved locally!', 'success', 'Saved');
            console.log('Results saved to localStorage');
            
            this.trackEvent('results_saved', {
                prediction: this.currentResults.prediction,
                confidence: this.currentResults.confidence
            });
            
        } catch (error) {
            console.error('Failed to save results:', error);
            this.showNotification('Failed to save results. Storage may be full.', 'error');
        }
    }

    newAnalysis() {
        if (confirm('Are you sure you want to start a new analysis? Current results will be cleared.')) {
            try {
                // Reset upload handler
                if (window.uploadHandler && typeof window.uploadHandler.removeImage === 'function') {
                    window.uploadHandler.removeImage();
                }
                
                // Reset form handler
                if (window.formHandler && typeof window.formHandler.resetForm === 'function') {
                    window.formHandler.resetForm();
                }
                
                // Clear current results
                this.currentResults = null;
                this.currentResultFile = null;
                window.currentResultFile = null;
                
                // Hide results section
                if (this.resultsSection) {
                    this.resultsSection.style.display = 'none';
                    this.resultsSection.innerHTML = '';
                }
                
                // Scroll to top
                window.scrollTo({ top: 0, behavior: 'smooth' });
                
                this.showNotification('Ready for new analysis!', 'success', 'New Analysis');
                console.log('Analysis interface reset for new analysis');
                
                this.trackEvent('new_analysis_started');
                
            } catch (error) {
                console.error('Failed to reset for new analysis:', error);
                this.showNotification('Failed to reset interface. Please refresh the page.', 'error');
            }
        }
    }

    showDetailedResults() {
        if (!this.currentResults) return;
        
        const metadata = this.currentResults.analysis_metadata || {};
        const technical = this.currentResults.technical_details || {};
        
        const detailsHTML = `
            <div class="detailed-results">
                <h5>Detailed Analysis Information</h5>
                <div class="row g-3">
                    <div class="col-md-6">
                        <h6>Analysis Results</h6>
                        <ul class="list-unstyled">
                            <li><strong>Prediction:</strong> ${this.currentResults.prediction}</li>
                            <li><strong>Confidence:</strong> ${this.currentResults.confidence}%</li>
                            <li><strong>Non-Cancer Probability:</strong> ${this.currentResults.probabilities.non_cancer}%</li>
                            <li><strong>Cancer Probability:</strong> ${this.currentResults.probabilities.cancer}%</li>
                        </ul>
                    </div>
                    <div class="col-md-6">
                        <h6>Technical Details</h6>
                        <ul class="list-unstyled">
                            <li><strong>Processing Time:</strong> ${metadata.processing_time || 'N/A'}</li>
                            <li><strong>Model Confidence:</strong> ${metadata.model_confidence || 'N/A'}</li>
                            <li><strong>Image Quality:</strong> ${metadata.image_quality || 'N/A'}</li>
                            <li><strong>AI Method:</strong> ${metadata.heatmap_method || 'Grad-CAM'}</li>
                            <li><strong>Resolution:</strong> ${technical.input_resolution || '224x224'}</li>
                            <li><strong>Device:</strong> ${technical.inference_device || 'N/A'}</li>
                        </ul>
                    </div>
                </div>
            </div>
        `;
        
        // Create custom modal for details
        this.showCustomModal('Analysis Details', detailsHTML, 'large');
    }

    showCustomModal(title, content, size = 'medium') {
        const modal = document.createElement('div');
        modal.className = 'modal fade show';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            z-index: 1050;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        `;
        
        const modalWidth = size === 'large' ? '90%' : size === 'small' ? '400px' : '600px';
        
        modal.innerHTML = `
            <div class="modal-dialog" style="max-width: ${modalWidth}; width: 100%; margin: 0;">
                <div class="modal-content" style="border: none; border-radius: 12px; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);">
                    <div class="modal-header" style="border-bottom: 1px solid #e5e7eb; border-radius: 12px 12px 0 0;">
                        <h5 class="modal-title" style="color: #374151; font-weight: 600;">${title}</h5>
                        <button type="button" class="btn-close" style="background: none; border: none; font-size: 24px; color: #6b7280; cursor: pointer;">&times;</button>
                    </div>
                    <div class="modal-body" style="padding: 20px;">
                        ${content}
                    </div>
                    <div class="modal-footer" style="border-top: 1px solid #e5e7eb; padding: 15px 20px;">
                        <button type="button" class="btn btn-secondary modal-close-btn">Close</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Event listeners
        const closeBtn = modal.querySelector('.btn-close');
        const closeModalBtn = modal.querySelector('.modal-close-btn');
        
        const closeModal = () => {
            modal.style.animation = 'fadeOut 0.3s ease-out';
            setTimeout(() => {
                if (modal.parentNode) {
                    document.body.removeChild(modal);
                }
            }, 300);
        };
        
        closeBtn.addEventListener('click', closeModal);
        closeModalBtn.addEventListener('click', closeModal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
        
        // Add fadeIn animation
        modal.style.animation = 'fadeIn 0.3s ease-out';
    }

    animateResultsAppearance() {
        const resultsContent = this.resultsSection.querySelector('.results-content');
        if (resultsContent) {
            resultsContent.classList.add('show');
            
            // Staggered animation for cards
            const cards = resultsContent.querySelectorAll('.image-card, .prob-card, .metadata-card');
            cards.forEach((card, index) => {
                card.style.opacity = '0';
                card.style.transform = 'translateY(20px)';
                
                setTimeout(() => {
                    card.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                }, index * 100 + 300);
            });
            
            // Add hover effects to image wrappers
            const imageWrappers = resultsContent.querySelectorAll('.image-wrapper');
            imageWrappers.forEach(wrapper => {
                const overlay = wrapper.querySelector('.image-overlay');
                if (overlay) {
                    wrapper.addEventListener('mouseenter', () => {
                        overlay.style.opacity = '1';
                    });
                    wrapper.addEventListener('mouseleave', () => {
                        overlay.style.opacity = '0';
                    });
                }
            });
        }
    }

    animateProbabilityBars() {
        const progressBars = document.querySelectorAll('.progress-bar[data-width]');
        progressBars.forEach((bar, index) => {
            const width = bar.getAttribute('data-width');
            setTimeout(() => {
                bar.style.width = `${width}%`;
            }, index * 200);
        });
    }

    scrollToResults() {
        if (this.resultsSection) {
            const offset = 20;
            const elementPosition = this.resultsSection.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - offset;
            
            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    }

    closeAllModals() {
        // Close Bootstrap modals
        if (this.imageModalInstance && typeof this.imageModalInstance.hide === 'function') {
            this.imageModalInstance.hide();
        }
        
        // Close custom modals
        const customModals = document.querySelectorAll('#customImageModal, .modal.show');
        customModals.forEach(modal => {
            if (modal.parentNode) {
                modal.style.animation = 'fadeOut 0.3s ease-out';
                setTimeout(() => {
                    if (modal.parentNode) {
                        modal.parentNode.removeChild(modal);
                    }
                }, 300);
            }
        });
    }

    handleResize() {
        // Handle responsive modal sizing
        const customModals = document.querySelectorAll('#customImageModal');
        customModals.forEach(modal => {
            const img = modal.querySelector('img');
            if (img) {
                img.style.maxHeight = '70vh';
                img.style.maxWidth = '90vw';
            }
        });
    }

    handleVisibilityChange() {
        if (document.hidden) {
            // Pause any ongoing animations
            console.log('Page hidden, pausing animations');
        } else {
            // Resume animations
            console.log('Page visible, resuming animations');
        }
    }

    // Enhanced notification system
    showNotification(message, type = 'info', title = null) {
        const container = document.getElementById('notificationContainer');
        if (!container) {
            console.error('Notification container not found');
            return;
        }
        
        // Remove existing notifications of the same type
        const existingNotifications = container.querySelectorAll(`.notification.${type}`);
        existingNotifications.forEach(notif => {
            notif.style.animation = 'slideOut 0.3s ease-in';
            setTimeout(() => {
                if (notif.parentNode) {
                    notif.remove();
                }
            }, 300);
        });
        
        // Create notification
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-triangle',
            warning: 'fas fa-exclamation-circle',
            info: 'fas fa-info-circle'
        };
        
        notification.innerHTML = `
            <div class="notification-icon">
                <i class="${icons[type] || icons.info}"></i>
            </div>
            <div class="notification-content">
                ${title ? `<div class="notification-title">${title}</div>` : ''}
                <div class="notification-message">${message}</div>
            </div>
            <button class="notification-close">&times;</button>
        `;
        
        container.appendChild(notification);
        
        // Show notification with animation
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        // Close button
        const closeBtn = notification.querySelector('.notification-close');
        const closeNotification = () => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        };
        
        closeBtn.addEventListener('click', closeNotification);
        
        // Auto remove based on type
        const timeout = this.config.notificationTimeout[type] || 4000;
        setTimeout(closeNotification, timeout);
        
        console.log(`Notification shown: [${type.toUpperCase()}] ${message}`);
    }

    // Analytics tracking
    trackEvent(eventName, properties = {}) {
        try {
            // Track with various analytics services
            
            // Google Analytics (gtag)
            if (typeof gtag !== 'undefined') {
                gtag('event', eventName, {
                    ...properties,
                    event_category: 'oral_cancer_analysis',
                    event_label: this.currentResults?.prediction || 'unknown'
                });
            }
            
            // Custom analytics endpoint
            if (typeof fetch !== 'undefined') {
                fetch('/api/analytics', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        event: eventName,
                        properties: properties,
                        timestamp: new Date().toISOString(),
                        session_id: sessionStorage.getItem('session_id') || 'anonymous'
                    })
                }).catch(err => {
                    console.warn('Analytics tracking failed:', err);
                });
            }
            
            console.log(`Event tracked: ${eventName}`, properties);
            
        } catch (error) {
            console.warn('Analytics tracking error:', error);
        }
    }

    // Utility methods
    formatBytes(bytes, decimals = 2) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Cleanup method
    destroy() {
        // Remove event listeners
        document.removeEventListener('click', this.handleGlobalClick);
        document.removeEventListener('keydown', this.handleKeyboardShortcuts);
        window.removeEventListener('resize', this.handleResize);
        
        // Clear current data
        this.currentResults = null;
        this.currentResultFile = null;
        
        // Remove DOM elements
        const container = document.getElementById('notificationContainer');
        if (container) {
            container.remove();
        }
        
        console.log('AnalysisHandler destroyed and cleaned up');
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing Enhanced Analysis Handler for AI Oral Cancer Detection');
    try {
        window.analysisHandler = new AnalysisHandler();
        console.log('Analysis Handler initialized successfully');
    } catch (error) {
        console.error('Failed to initialize Analysis Handler:', error);
    }
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AnalysisHandler;
} else {
    window.AnalysisHandler = AnalysisHandler;
}

// Add CSS animations
const animationStyles = `
    <style id="analysisAnimations">
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        
        @keyframes fadeOut {
            from { opacity: 1; }
            to { opacity: 0; }
        }
        
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
        
        @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.7; }
            100% { opacity: 1; }
        }
        
        .pulse {
            animation: pulse 2s infinite;
        }
    </style>
`;

if (!document.getElementById('analysisAnimations')) {
    document.head.insertAdjacentHTML('beforeend', animationStyles);
}

console.log('Enhanced Analysis.js loaded successfully - AI Oral Cancer Detection System v2.0');
