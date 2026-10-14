/**
 * Enhanced Form Handler - FIXED VERSION
 * Handles form validation and character counting
 */

class FormHandler {
    constructor() {
        this.init();
        this.setupEventListeners();
    }

    init() {
        console.log('Enhanced Form Handler Initialized');
        
        // Get form elements
        this.form = document.getElementById('analysisForm');
        this.imageInput = document.getElementById('imageInput');
        this.privacyConsent = document.getElementById('privacyConsent');
        
        // File state tracking
        this.fileLoaded = false;
        this.currentFile = null;
    }

    setupEventListeners() {
        // Image input change
        if (this.imageInput) {
            this.imageInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    console.log('FormHandler: File input changed', file.name);
                    this.currentFile = file;
                    this.fileLoaded = true;
                } else {
                    console.log('FormHandler: File input cleared');
                    this.currentFile = null;
                    this.fileLoaded = false;
                }
            });
        }
        
        // Privacy consent change
        if (this.privacyConsent) {
            this.privacyConsent.addEventListener('change', () => {
                this.validateField(this.privacyConsent);
            });
        }
        
        // Listen for file upload events from upload handler
        document.addEventListener('fileUploaded', (event) => {
            console.log('FormHandler: Received fileUploaded event', event.detail);
            this.currentFile = event.detail.file;
            this.fileLoaded = true;
        });

        document.addEventListener('fileRemoved', () => {
            console.log('FormHandler: Received fileRemoved event');
            this.currentFile = null;
            this.fileLoaded = false;
        });
    }

    validateForm() {
        console.log('Starting enhanced form validation...');
        console.log('Current file state:', {
            fileLoaded: this.fileLoaded,
            currentFile: this.currentFile?.name || 'none',
            inputFiles: this.imageInput?.files?.length || 0
        });
        
        let isValid = true;
        
        // Clear existing errors
        this.clearAllErrors();
        
        // Check file upload
        const hasFileInInput = this.imageInput?.files && this.imageInput.files.length > 0;
        const hasFileLoaded = this.fileLoaded && this.currentFile;
        
        console.log('File validation:', {
            hasFileInInput,
            hasFileLoaded,
            fileLoadedFlag: this.fileLoaded
        });
        
        if (!hasFileInInput && !hasFileLoaded) {
            this.showFieldError(this.imageInput, 'Please select an image file.');
            isValid = false;
            console.log('No file detected');
        } else {
            console.log('File validation passed');
        }
        
        // Check privacy consent
        if (!this.privacyConsent?.checked) {
            this.showFieldError(this.privacyConsent, 'You must agree to the terms to continue.');
            isValid = false;
            console.log('Privacy consent not checked');
        } else {
            console.log('Privacy consent checked');
        }
        
        console.log(isValid ? 'Enhanced form validation passed' : 'Enhanced form validation failed');
        return isValid;
    }

    validateField(field) {
        if (!field) return true;
        
        this.clearFieldError(field);
        
        if (field.type === 'checkbox' && field.required && !field.checked) {
            this.showFieldError(field, 'This field is required.');
            return false;
        }
        
        return true;
    }

    showFieldError(field, message) {
        if (!field) return;
        
        console.log(`Field error: ${field.name || field.id || 'unknown'} - ${message}`);
        
        // Add error class
        field.classList.add('is-invalid');
        
        // Create error element
        const errorDiv = document.createElement('div');
        errorDiv.className = 'field-error invalid-feedback';
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
        errorDiv.style.color = '#dc3545';
        errorDiv.style.fontSize = '0.875rem';
        errorDiv.style.marginTop = '0.25rem';
        
        // Insert error message
        if (field.type === 'file') {
            // For file input, insert after upload area
            const uploadArea = document.getElementById('uploadArea');
            if (uploadArea) {
                uploadArea.parentNode.insertBefore(errorDiv, uploadArea.nextSibling);
            }
        } else if (field.type === 'checkbox') {
            // For checkbox, insert after parent
            field.closest('.form-check').parentNode.appendChild(errorDiv);
        } else {
            // For regular inputs
            field.parentNode.appendChild(errorDiv);
        }
    }

    clearFieldError(field) {
        if (!field) return;
        
        field.classList.remove('is-invalid');
        
        // Remove error messages
        const errorElements = document.querySelectorAll('.field-error');
        errorElements.forEach(error => error.remove());
    }

    clearAllErrors() {
        // Remove all error classes
        const invalidFields = this.form?.querySelectorAll('.is-invalid');
        invalidFields?.forEach(field => field.classList.remove('is-invalid'));
        
        // Remove all error messages
        const errorElements = document.querySelectorAll('.field-error');
        errorElements.forEach(error => error.remove());
    }

    // Public methods for external access
    setFileLoaded(file) {
        console.log('FormHandler: Setting file loaded externally', file?.name || 'none');
        this.currentFile = file;
        this.fileLoaded = !!file;
    }

    clearFileLoaded() {
        console.log('FormHandler: Clearing file loaded externally');
        this.currentFile = null;
        this.fileLoaded = false;
    }

    resetForm() {
        if (this.form) {
            this.form.reset();
            this.currentFile = null;
            this.fileLoaded = false;
            this.clearAllErrors();
        }
    }

    getFormData() {
        if (!this.form) return null;
        return new FormData(this.form);
    }

    isFormValid() {
        return this.validateForm();
    }

    getCurrentFile() {
        return this.currentFile;
    }

    isFileLoaded() {
        return this.fileLoaded;
    }
}

// Initialize form handler when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing Enhanced Form Handler');
    window.formHandler = new FormHandler();
});

// Export for use in other modules
window.FormHandler = FormHandler;
