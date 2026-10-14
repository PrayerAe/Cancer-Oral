/**
 * Main Application JavaScript - Complete & Fixed
 * Handles global app functionality, system status, and UI interactions
 */

class OralCancerApp {
    constructor() {
        this.init();
        this.checkSystemStatus();
        this.setupGlobalEventHandlers();
        this.setupProgressAnimation();
    }

    init() {
        console.log('AI Oral Cancer Detection System Initialized');
        
        // Initialize AOS animations if available
        if (typeof AOS !== 'undefined') {
            AOS.init({
                duration: 1000,
                once: true,
                offset: 100
            });
        }
        
        // Setup global error handling
        this.setupErrorHandling();
        
        // Initialize tooltips if Bootstrap is available
        this.initializeTooltips();
        
        // Setup theme handling
        this.initializeTheme();
    }

    setupErrorHandling() {
        // Global error handler with better user feedback
        window.onerror = (msg, url, line, col, error) => {
            console.error(`Global error: ${msg} at ${url}:${line}:${col}`, error);
            
            // Don't show error notifications for minor issues
            if (!msg || msg.includes('Script error') || msg.includes('Non-Error')) {
                return true;
            }
            
            this.showGlobalNotification('A system error occurred. Please refresh the page if issues persist.', 'warning');
            return true;
        };

        // Unhandled promise rejection handler
        window.addEventListener('unhandledrejection', (event) => {
            console.error('Unhandled promise rejection:', event.reason);
            event.preventDefault();
        });
    }

    async checkSystemStatus() {
        try {
            console.log('Checking system status...');
            
            const response = await fetch('/test');
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const status = await response.json();
            console.log('System Status:', status);
            
            this.updateSystemStatusUI(status);
            this.updateModelStatus(status);
            
        } catch (error) {
            console.error('System status check failed:', error);
            this.handleSystemError(error);
        }
    }

    updateSystemStatusUI(status) {
        // Update status indicators
        const statusIndicators = document.querySelectorAll('.status-indicator');
        statusIndicators.forEach(indicator => {
            if (status.status === 'healthy') {
                indicator.classList.add('online');
                indicator.classList.remove('offline');
            } else {
                indicator.classList.add('offline');
                indicator.classList.remove('online');
            }
        });

        // Update system info in UI if elements exist
        const systemInfo = document.querySelector('.system-info');
        if (systemInfo && status.system_details) {
            systemInfo.innerHTML = `
                <div class="row text-center">
                    <div class="col-6">
                        <small class="text-muted">Model Status</small><br>
                        <span class="badge ${status.system_details.model_loaded ? 'bg-success' : 'bg-warning'}">
                            ${status.system_details.model_loaded ? 'Loaded' : 'Not Loaded'}
                        </span>
                    </div>
                    <div class="col-6">
                        <small class="text-muted">Device</small><br>
                        <span class="badge bg-info">${status.system_details.model_device}</span>
                    </div>
                </div>
            `;
        }
    }

    updateModelStatus(status) {
        const modelStatus = status.system_details?.model_loaded;
        const deviceType = status.system_details?.model_device;
        
        if (!modelStatus) {
            this.showGlobalNotification('AI Model not loaded. Some features may be limited.', 'warning');
        }
        
        // Update UI elements based on model status
        const analyzeBtn = document.getElementById('analyzeBtn');
        if (analyzeBtn && !modelStatus) {
            analyzeBtn.disabled = true;
            analyzeBtn.innerHTML = '<i class="fas fa-exclamation-triangle me-2"></i>Model Unavailable';
        }
    }

    handleSystemError(error) {
        document.body.classList.add('system-error');
        this.showGlobalNotification('System connection error. Please check your connection.', 'error');
        
        // Retry mechanism
        setTimeout(() => {
            this.checkSystemStatus();
        }, 30000); // Retry after 30 seconds
    }

    setupGlobalEventHandlers() {
        // Enhanced smooth scrolling for anchor links
        document.addEventListener('click', (e) => {
            if (e.target.matches('a[href^="#"]')) {
                e.preventDefault();
                const targetId = e.target.getAttribute('href').substring(1);
                const target = document.getElementById(targetId);
                if (target) {
                    target.scrollIntoView({ 
                        behavior: 'smooth', 
                        block: 'start',
                        inline: 'nearest'
                    });
                }
            }
            
            // Premium button interaction feedback
            if (e.target.closest('.btn-primary-custom')) {
                const btn = e.target.closest('.btn-primary-custom');
                this.animateButtonClick(btn);
            }
            
            // Handle card interactions
            if (e.target.closest('.card, .result-card')) {
                const card = e.target.closest('.card, .result-card');
                this.animateCardHover(card);
            }
        });

        // Enhanced keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + Enter for form submission
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                const analyzeBtn = document.getElementById('analyzeBtn');
                if (analyzeBtn && !analyzeBtn.disabled) {
                    e.preventDefault();
                    analyzeBtn.click();
                }
            }
            
            // Escape key to close modals/notifications
            if (e.key === 'Escape') {
                this.closeActiveModalsAndNotifications();
            }
            
            // F5 or Ctrl+R for refresh with confirmation
            if (e.key === 'F5' || ((e.ctrlKey || e.metaKey) && e.key === 'r')) {
                if (window.uploadHandler && window.uploadHandler.isUploading) {
                    e.preventDefault();
                    if (confirm('Analysis in progress. Are you sure you want to refresh?')) {
                        location.reload();
                    }
                }
            }
        });

        // Handle visibility change (tab switching)
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
                // Re-check system status when tab becomes visible
                this.checkSystemStatus();
            }
        });

        // Handle online/offline status
        window.addEventListener('online', () => {
            this.showGlobalNotification('Connection restored', 'success');
            this.checkSystemStatus();
        });

        window.addEventListener('offline', () => {
            this.showGlobalNotification('Connection lost. Please check your internet.', 'warning');
        });
    }

    setupProgressAnimation() {
        // Enhanced progress animation for analysis
        this.progressSteps = [
            'Initializing AI Model...',
            'Processing Image...',
            'Extracting Features...',
            'Running Analysis...',
            'Generating Heatmap...',
            'Calculating Probabilities...',
            'Finalizing Results...'
        ];
        this.currentStep = 0;
    }

    animateProgress() {
        const progressText = document.querySelector('.loading-section p');
        if (!progressText) return;

        const animateStep = () => {
            if (this.currentStep < this.progressSteps.length) {
                progressText.textContent = this.progressSteps[this.currentStep];
                this.currentStep++;
                setTimeout(animateStep, 800);
            } else {
                this.currentStep = 0; // Reset for next use
            }
        };

        animateStep();
    }

    animateButtonClick(button) {
        if (!button) return;
        
        button.style.transition = 'transform 0.1s ease-in-out';
        button.style.transform = 'scale(0.95)';
        
        setTimeout(() => {
            button.style.transform = 'scale(1)';
        }, 100);
        
        // Add ripple effect
        this.createRippleEffect(button);
    }

    createRippleEffect(element) {
        const ripple = document.createElement('span');
        ripple.className = 'ripple-effect';
        ripple.style.cssText = `
            position: absolute;
            background: rgba(255, 255, 255, 0.6);
            border-radius: 50%;
            pointer-events: none;
            transform: scale(0);
            animation: ripple 0.6s linear;
            width: 20px;
            height: 20px;
            left: 50%;
            top: 50%;
            margin-left: -10px;
            margin-top: -10px;
        `;
        
        // Add keyframe animation if not exists
        if (!document.querySelector('#ripple-keyframes')) {
            const style = document.createElement('style');
            style.id = 'ripple-keyframes';
            style.textContent = `
                @keyframes ripple {
                    to {
                        transform: scale(4);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
        
        element.style.position = 'relative';
        element.style.overflow = 'hidden';
        element.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    }

    animateCardHover(card) {
        if (!card) return;
        
        card.style.transition = 'transform 0.2s ease-in-out';
        card.style.transform = 'translateY(-2px)';
        
        setTimeout(() => {
            card.style.transform = 'translateY(0)';
        }, 200);
    }

    initializeTooltips() {
        // Initialize Bootstrap tooltips if available
        if (typeof bootstrap !== 'undefined' && bootstrap.Tooltip) {
            try {
                const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
                tooltipTriggerList.map(tooltipTriggerEl => {
                    return new bootstrap.Tooltip(tooltipTriggerEl);
                });
            } catch (error) {
                console.warn('Tooltip initialization failed:', error);
            }
        }
    }

    initializeTheme() {
        // Check for user theme preference
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.body.setAttribute('data-theme', savedTheme);
        
        // Add theme toggle functionality if toggle exists
        const themeToggle = document.querySelector('.theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                this.toggleTheme();
            });
        }
    }

    toggleTheme() {
        const currentTheme = document.body.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.body.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        
        this.showGlobalNotification(`Switched to ${newTheme} theme`, 'info');
    }

    closeActiveModalsAndNotifications() {
        // Close any open modals
        const openModals = document.querySelectorAll('.modal.show');
        openModals.forEach(modal => {
            if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
                const modalInstance = bootstrap.Modal.getInstance(modal);
                if (modalInstance) {
                    modalInstance.hide();
                }
            }
        });
        
        // Close notifications
        const notifications = document.querySelectorAll('.notification');
        notifications.forEach(notification => {
            notification.remove();
        });
    }

    showGlobalNotification(message, type = 'info', duration = 4000) {
        // Remove existing notifications of same type
        const existingNotifications = document.querySelectorAll(`.notification.${type}`);
        existingNotifications.forEach(notif => notif.remove());
        
        // Create notification
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            border-radius: 10px;
            color: white;
            font-weight: 500;
            z-index: 1060;
            max-width: 300px;
            opacity: 0;
            transform: translateX(100%);
            transition: all 0.3s ease;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `;
        
        // Set background color based on type
        const colors = {
            'success': '#10b981',
            'error': '#ef4444',
            'warning': '#f59e0b',
            'info': '#3b82f6'
        };
        notification.style.backgroundColor = colors[type] || colors.info;
        
        // Add icon and message
        const icons = {
            'success': 'fa-check-circle',
            'error': 'fa-exclamation-triangle',
            'warning': 'fa-exclamation-circle',
            'info': 'fa-info-circle'
        };
        
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 0.5rem;">
                <i class="fas ${icons[type] || icons.info}"></i>
                <span>${message}</span>
                <button onclick="this.parentElement.parentElement.remove()" 
                        style="background: none; border: none; color: white; margin-left: auto; cursor: pointer;">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Auto remove
        setTimeout(() => {
            if (notification.parentElement) {
                notification.style.opacity = '0';
                notification.style.transform = 'translateX(100%)';
                setTimeout(() => notification.remove(), 300);
            }
        }, duration);
    }

    // Public utility methods
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    formatTime(seconds) {
        if (seconds < 60) return `${seconds.toFixed(1)}s`;
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}m ${remainingSeconds.toFixed(0)}s`;
    }

    downloadFile(blob, filename) {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    }

    // System performance monitoring
    getSystemPerformance() {
        if (typeof performance !== 'undefined') {
            return {
                memory: performance.memory ? {
                    used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
                    total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
                    limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)
                } : null,
                navigation: performance.navigation.type,
                timing: {
                    loadTime: performance.timing.loadEventEnd - performance.timing.navigationStart,
                    domReady: performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart
                }
            };
        }
        return null;
    }

    // Debug information
    getDebugInfo() {
        return {
            userAgent: navigator.userAgent,
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight
            },
            screen: {
                width: screen.width,
                height: screen.height,
                colorDepth: screen.colorDepth
            },
            connection: navigator.connection ? {
                effectiveType: navigator.connection.effectiveType,
                downlink: navigator.connection.downlink
            } : null,
            performance: this.getSystemPerformance(),
            timestamp: new Date().toISOString()
        };
    }
}

// Initialize global app instance when DOM is ready
window.addEventListener('DOMContentLoaded', () => {
    try {
        window.oralCancerApp = new OralCancerApp();
        console.log('OralCancerApp initialized successfully');
    } catch (error) {
        console.error('Failed to initialize OralCancerApp:', error);
    }
});

// Export for use in other modules
window.OralCancerApp = OralCancerApp;

// Service worker registration (if available)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
            .then(registration => {
                console.log('ServiceWorker registered:', registration);
            })
            .catch(error => {
                console.log('ServiceWorker registration failed:', error);
            });
    });
}
