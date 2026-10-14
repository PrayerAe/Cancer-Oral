/**
 * Enhanced Upload Handler - FIXED VERSION
 * Handles file upload, drag & drop, and form submission
 */

class UploadHandler {
    constructor() {
        this.supportedFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
        this.maxFileSize = 16 * 1024 * 1024; // 16MB
        this.isUploading = false;
        this.currentFile = null;
        this.dragCounter = 0;
        
        this.init();
        this.setupEventListeners();
    }

    init() {
        console.log('Enhanced Upload Handler Initialized');
        
        // Get DOM elements
        this.uploadArea = document.getElementById('uploadArea');
        this.imageInput = document.getElementById('imageInput');
        this.imagePreview = document.getElementById('imagePreview');
        this.previewImage = document.getElementById('previewImage');
        this.removeImageBtn = document.getElementById('removeImage');
        this.analyzeBtn = document.getElementById('analyzeBtn');
        this.analysisForm = document.getElementById('analysisForm');
        this.loadingSection = document.getElementById('loadingSection');
        this.resultsSection = document.getElementById('resultsSection');
        
        // File details elements
        this.fileName = document.getElementById('fileName');
        this.fileSize = document.getElementById('fileSize');
        this.imageDimensions = document.getElementById('imageDimensions');
        
        if (!this.uploadArea || !this.imageInput || !this.analysisForm) {
            console.error('Required upload elements not found');
            return;
        }
        
        console.log('Setting up enhanced drag & drop');
    }

    setupEventListeners() {
        if (!this.uploadArea || !this.imageInput) return;

        // Form submission handler
        if (this.analysisForm) {
            this.analysisForm.addEventListener('submit', this.handleFormSubmission.bind(this));
        }

        // Upload area click handler
        this.uploadArea.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (!this.isUploading && !e.target.closest('.btn-outline-custom')) {
                console.log('Upload area clicked - opening file dialog');
                this.imageInput.click();
            }
        });

        // File input change
        this.imageInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                console.log('UploadHandler: File selected:', file.name);
                this.handleFileSelect(file);
            } else {
                console.log('UploadHandler: File input cleared');
                this.clearCurrentFile();
            }
        });

        // Enhanced drag and drop
        this.setupDragAndDrop();

        // Remove image button
        if (this.removeImageBtn) {
            this.removeImageBtn.addEventListener('click', this.removeImage.bind(this));
        }

        // Global event delegation for dynamic buttons
        document.addEventListener('click', (e) => {
            if (e.target.closest('#changeImageBtn')) {
                e.preventDefault();
                e.stopPropagation();
                console.log('Change image button clicked');
                this.imageInput.click();
            }
        });

        // Prevent default drag behaviors globally
        this.setupGlobalDragPrevention();
    }

    setupDragAndDrop() {
        // Drag enter
        this.uploadArea.addEventListener('dragenter', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            this.dragCounter++;
            console.log(`Drag enter (counter: ${this.dragCounter})`);
            
            if (this.isUploading) return;
            
            this.uploadArea.classList.add('dragover');
            this.updateUploadAreaForDrag(true);
        });

        // Drag over
        this.uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.stopPropagation();
            e.dataTransfer.dropEffect = 'copy';
        });

        // Drag leave
        this.uploadArea.addEventListener('dragleave', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            this.dragCounter--;
            
            if (this.dragCounter <= 0) {
                this.dragCounter = 0;
                this.uploadArea.classList.remove('dragover');
                this.updateUploadAreaForDrag(false);
            }
        });

        // Drop
        this.uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            console.log('File drop detected');
            
            this.dragCounter = 0;
            this.uploadArea.classList.remove('dragover');
            this.updateUploadAreaForDrag(false);
            
            if (this.isUploading) {
                this.showNotification('Upload already in progress. Please wait.', 'warning');
                return;
            }
            
            const files = e.dataTransfer?.files;
            if (files && files.length > 0) {
                const file = files[0];
                console.log(`Processing dropped file: ${file.name} (${file.type}, ${file.size} bytes)`);
                
                this.setFileToInput(file);
                this.handleFileSelect(file);
            }
        });
    }

    setupGlobalDragPrevention() {
        document.addEventListener('dragover', (e) => {
            if (!e.target.closest('#uploadArea')) {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'none';
            }
        });

        document.addEventListener('drop', (e) => {
            if (!e.target.closest('#uploadArea')) {
                e.preventDefault();
            }
        });
    }

    setFileToInput(file) {
        try {
            console.log('Setting file to input:', file.name);
            
            if (typeof DataTransfer !== 'undefined') {
                const dataTransfer = new DataTransfer();
                dataTransfer.items.add(file);
                this.imageInput.files = dataTransfer.files;
                console.log('File set to input using DataTransfer');
            } else {
                console.log('DataTransfer not available, storing file reference');
                this.currentFile = file;
            }
        } catch (error) {
            console.error('Error setting file to input:', error);
            this.currentFile = file;
        }
    }

    updateUploadAreaForDrag(isDragOver) {
        const uploadTitle = this.uploadArea.querySelector('.upload-title');
        if (!uploadTitle) return;
        
        if (isDragOver) {
            uploadTitle.textContent = 'Drop Image Here!';
            uploadTitle.style.color = '#10b981';
        } else {
            uploadTitle.textContent = 'Drop Medical Image Here';
            uploadTitle.style.color = '';
        }
    }

    async handleFileSelect(file) {
        console.log(`UploadHandler: File selected: ${file.name} (${file.type}, ${file.size} bytes)`);

        // Validate file
        const validation = this.validateFile(file);
        if (!validation.valid) {
            this.showNotification(validation.message, 'error');
            this.clearFileInput();
            return;
        }

        try {
            // Get image dimensions
            const dimensions = await this.getImageDimensions(file);
            console.log(`Image dimensions: ${dimensions.width}x${dimensions.height}`);
            
            if (dimensions.width < 50 || dimensions.height < 50) {
                this.showNotification('Image too small. Minimum size is 50x50 pixels.', 'error');
                this.clearFileInput();
                return;
            }

            // Store current file
            this.currentFile = file;

            // Show preview
            await this.showImagePreview(file);
            
            // Update file details
            this.updateFileDetails(file, dimensions);
            
            // Update upload area appearance
            this.updateUploadAreaAfterSelection(file);
            
            // Notify form handler
            this.notifyFileUploaded(file);
            
            // Show success message
            this.showNotification(`Image "${file.name}" loaded successfully!`, 'success');
            
        } catch (error) {
            console.error('Error handling file selection:', error);
            this.showNotification('Error processing the selected image. Please try another file.', 'error');
            this.clearFileInput();
        }
    }

    validateFile(file) {
        console.log(`Validating file: ${file.name} (${file.size} bytes, ${file.type})`);
        
        if (!this.supportedFormats.includes(file.type.toLowerCase())) {
            return { 
                valid: false, 
                message: `Unsupported file format "${file.type}". Please use: JPG, PNG, or GIF.` 
            };
        }

        if (file.size > this.maxFileSize) {
            const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
            return { 
                valid: false, 
                message: `File too large (${sizeMB}MB). Maximum size allowed is 16MB.` 
            };
        }

        if (file.size < 1024) {
            return { 
                valid: false, 
                message: 'File too small. Please select a valid image file.' 
            };
        }

        console.log('File validation passed');
        return { valid: true, message: 'File validation passed.' };
    }

    getImageDimensions(file) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            const url = URL.createObjectURL(file);
            
            img.onload = function() {
                URL.revokeObjectURL(url);
                resolve({
                    width: this.naturalWidth,
                    height: this.naturalHeight
                });
            };
            
            img.onerror = function() {
                URL.revokeObjectURL(url);
                reject(new Error('Failed to load image'));
            };
            
            img.src = url;
        });
    }

    async showImagePreview(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                if (this.previewImage) {
                    this.previewImage.src = e.target.result;
                    this.previewImage.alt = file.name;
                }
                
                if (this.imagePreview) {
                    this.imagePreview.style.display = 'block';
                    
                    // Smooth animation
                    this.imagePreview.style.opacity = '0';
                    this.imagePreview.style.transform = 'translateY(20px)';
                    
                    requestAnimationFrame(() => {
                        this.imagePreview.style.transition = 'all 0.3s ease';
                        this.imagePreview.style.opacity = '1';
                        this.imagePreview.style.transform = 'translateY(0)';
                    });
                }
                
                resolve();
            };
            
            reader.onerror = () => reject(new Error('Failed to read image file'));
            reader.readAsDataURL(file);
        });
    }

    updateFileDetails(file, dimensions) {
        if (this.fileName) {
            this.fileName.textContent = file.name;
        }
        
        if (this.fileSize) {
            this.fileSize.textContent = this.formatFileSize(file.size);
        }
        
        if (this.imageDimensions && dimensions) {
            this.imageDimensions.textContent = `${dimensions.width} × ${dimensions.height}`;
        }
    }

    updateUploadAreaAfterSelection(file) {
        const uploadContent = this.uploadArea.querySelector('.upload-content');
        if (uploadContent) {
            uploadContent.innerHTML = `
                <div class="text-center">
                    <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #10b981, #059669); 
                               border-radius: 50%; display: flex; align-items: center; justify-content: center; 
                               margin: 0 auto 1rem; animation: pulse 2s infinite;">
                        <i class="fas fa-check" style="color: white; font-size: 1.5rem;"></i>
                    </div>
                    <h5 style="color: #10b981; font-weight: 600; margin-bottom: 0.5rem;">Image Ready for Analysis</h5>
                    <p style="color: #6b7280; margin-bottom: 1rem;">${file.name}</p>
                    <button type="button" class="btn btn-outline-custom" id="changeImageBtn">
                        <i class="fas fa-exchange-alt me-1"></i>Change Image
                    </button>
                </div>
            `;
        }
        
        console.log('Upload area updated with change button and success state');
    }

    async handleFormSubmission(event) {
        event.preventDefault();
        
        if (this.isUploading) {
            console.warn('Upload already in progress');
            return;
        }

        console.log('Form submission started');
        
        // Validate form
        let isValid = true;
        if (window.formHandler && typeof window.formHandler.isFormValid === 'function') {
            isValid = window.formHandler.isFormValid();
            console.log(`Form handler validation result: ${isValid}`);
        } else {
            isValid = this.basicFormValidation();
        }

        if (!isValid) {
            console.log('Form validation failed - stopping submission');
            return;
        }

        const formData = new FormData(this.analysisForm);
        
        // Ensure file is in form data
        if (!formData.get('file') || formData.get('file').size === 0) {
            if (this.currentFile) {
                console.log('Adding current file to form data', this.currentFile.name);
                formData.set('file', this.currentFile);
            } else {
                this.showNotification('No file found for upload. Please select an image.', 'error');
                return;
            }
        }

        // Log form data
        console.log('Form data contents:');
        for (let [key, value] of formData.entries()) {
            if (value instanceof File) {
                console.log(`  ${key}: File(${value.name}, ${value.size} bytes, ${value.type})`);
            } else {
                console.log(`  ${key}: ${value}`);
            }
        }

        try {
            this.isUploading = true;
            this.showLoadingState();
            
            console.log('Sending request to /predict');
            
            const response = await fetch('/predict', {
                method: 'POST',
                body: formData
            });
            
            console.log(`Response status: ${response.status} ${response.statusText}`);
            
            if (!response.ok) {
                let errorMessage = `Server error (${response.status})`;
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.error || errorMessage;
                } catch (e) {
                    errorMessage = `HTTP ${response.status}: ${response.statusText}`;
                }
                throw new Error(errorMessage);
            }
            
            const result = await response.json();
            console.log('Analysis result received:', result);
            
            if (result.success) {
                this.handleAnalysisSuccess(result);
            } else {
                throw new Error(result.error || 'Analysis failed');
            }
            
        } catch (error) {
            console.error('Form submission error:', error);
            this.handleAnalysisError(error);
        } finally {
            this.isUploading = false;
            this.hideLoadingState();
        }
    }

    basicFormValidation() {
        console.log('Running basic form validation');
        
        if (!this.imageInput.files || this.imageInput.files.length === 0) {
            if (!this.currentFile) {
                this.showNotification('Please select an image file.', 'error');
                return false;
            }
        }
        
        const privacyConsent = document.getElementById('privacyConsent');
        if (privacyConsent && !privacyConsent.checked) {
            this.showNotification('You must agree to the terms to continue.', 'error');
            return false;
        }
        
        console.log('Basic validation passed');
        return true;
    }

    showLoadingState() {
        console.log('Showing loading state');
        
        if (this.loadingSection) {
            this.loadingSection.style.display = 'block';
            setTimeout(() => {
                this.loadingSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 300);
        }
        
        if (this.analyzeBtn) {
            this.analyzeBtn.disabled = true;
            this.analyzeBtn.innerHTML = `
                <i class="fas fa-spinner fa-spin me-2"></i>
                Analyzing...
            `;
        }

        if (this.uploadArea) {
            this.uploadArea.style.pointerEvents = 'none';
            this.uploadArea.style.opacity = '0.7';
        }
    }

    hideLoadingState() {
        console.log('Hiding loading state');
        
        if (this.loadingSection) {
            this.loadingSection.style.display = 'none';
        }
        
        if (this.analyzeBtn) {
            this.analyzeBtn.disabled = false;
            this.analyzeBtn.innerHTML = `
                <i class="fas fa-brain me-2"></i>
                Start AI Analysis
            `;
        }

        if (this.uploadArea) {
            this.uploadArea.style.pointerEvents = 'auto';
            this.uploadArea.style.opacity = '1';
        }
    }

    handleAnalysisSuccess(result) {
        console.log('Analysis completed successfully');
        
        if (this.resultsSection && window.analysisHandler) {
            window.analysisHandler.displayResults(result);
        }
        
        const event = new CustomEvent('analysisComplete', { detail: result });
        document.dispatchEvent(event);
        
        this.showNotification('Analysis completed! Check results below.', 'success');
    }

    handleAnalysisError(error) {
        console.error('Analysis failed:', error);
        
        let errorMessage = 'Analysis failed. Please try again.';
        
        if (error.message.includes('500')) {
            errorMessage = 'Server processing error. Please try again or contact support.';
        } else if (error.message) {
            errorMessage = error.message;
        }
        
        const event = new CustomEvent('analysisError', {
            detail: { message: errorMessage, originalError: error }
        });
        document.dispatchEvent(event);
        
        this.showNotification(errorMessage, 'error');
    }

    removeImage() {
        console.log('Removing uploaded image');
        
        this.clearCurrentFile();
        this.clearFileInput();
        this.resetUploadArea();
        this.hideImagePreview();
        
        this.notifyFileRemoved();
        this.showNotification('Image removed. You can upload a new image.', 'info');
    }

    clearCurrentFile() {
        this.currentFile = null;
    }

    clearFileInput() {
        if (this.imageInput) {
            this.imageInput.value = '';
        }
    }

    hideImagePreview() {
        if (this.imagePreview) {
            this.imagePreview.style.transition = 'all 0.3s ease';
            this.imagePreview.style.opacity = '0';
            this.imagePreview.style.transform = 'translateY(-20px)';
            
            setTimeout(() => {
                this.imagePreview.style.display = 'none';
            }, 300);
        }
    }

    resetUploadArea() {
        const uploadContent = this.uploadArea?.querySelector('.upload-content');
        if (uploadContent) {
            uploadContent.innerHTML = `
                <i class="fas fa-cloud-upload-alt upload-icon"></i>
                <h5 class="upload-title">Drop Medical Image Here</h5>
                <p class="upload-subtitle">or click to browse files</p>
                
                <div class="upload-requirements">
                    <span class="requirement-item">
                        <i class="fas fa-check me-1"></i>
                        JPG, PNG, GIF
                    </span>
                    <span class="requirement-item">
                        <i class="fas fa-check me-1"></i>
                        Max 16MB
                    </span>
                    <span class="requirement-item">
                        <i class="fas fa-check me-1"></i>
                        High Resolution
                    </span>
                </div>
            `;
        }
    }

    // Event notification methods
    notifyFileUploaded(file) {
        console.log('UploadHandler: Notifying file uploaded', file.name);
        
        if (window.formHandler && typeof window.formHandler.setFileLoaded === 'function') {
            window.formHandler.setFileLoaded(file);
        }
        
        const event = new CustomEvent('fileUploaded', { detail: { file: file } });
        document.dispatchEvent(event);
    }

    notifyFileRemoved() {
        console.log('UploadHandler: Notifying file removed');
        
        if (window.formHandler && typeof window.formHandler.clearFileLoaded === 'function') {
            window.formHandler.clearFileLoaded();
        }
        
        const event = new CustomEvent('fileRemoved');
        document.dispatchEvent(event);
    }

    // Utility methods
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    showNotification(message, type = 'info') {
        // Remove existing notifications
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(notif => notif.remove());
        
        // Create notification
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas ${this.getNotificationIcon(type)} me-2"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(notification);
        
        // Show notification
        setTimeout(() => notification.classList.add('show'), 100);
        
        // Auto remove
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, type === 'error' ? 5000 : 3000);
    }

    getNotificationIcon(type) {
        const icons = {
            'success': 'fa-check-circle',
            'error': 'fa-exclamation-triangle',
            'warning': 'fa-exclamation-circle',
            'info': 'fa-info-circle'
        };
        return icons[type] || icons.info;
    }

    // Public methods
    getCurrentFile() {
        return this.currentFile || (this.imageInput?.files && this.imageInput.files[0]) || null;
    }

    isFileSelected() {
        return !!(this.currentFile || (this.imageInput?.files && this.imageInput.files.length > 0));
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing Enhanced Upload Handler');
    window.uploadHandler = new UploadHandler();
});

// Export for use in other modules
window.UploadHandler = UploadHandler;
