/**
 * Theme Management - System Preference Based
 * Automatically detects and syncs theme with device/browser settings
 */

(function() {
    // Get theme based on system preference
    function getSystemTheme() {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }
        return 'light';
    }
    
    // Apply theme immediately to prevent flash
    function applyTheme() {
        const savedTheme = localStorage.getItem('theme');
        const manualOverride = localStorage.getItem('themeManualOverride');
        
        let theme;
        if (manualOverride === 'true' && savedTheme) {
            // Use saved preference if manually set
            theme = savedTheme;
        } else {
            // Use system preference
            theme = getSystemTheme();
        }
        
        document.documentElement.setAttribute('data-theme', theme);
        return theme;
    }
    
    // Apply theme immediately (before DOM loads)
    const currentTheme = applyTheme();
    
    // Listen for system theme changes
    if (window.matchMedia) {
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function(e) {
            // Only auto-switch if no manual override
            if (localStorage.getItem('themeManualOverride') !== 'true') {
                const newTheme = e.matches ? 'dark' : 'light';
                document.documentElement.setAttribute('data-theme', newTheme);
                updateThemeIcon(newTheme);
            }
        });
    }
    
    // Update theme icon
    function updateThemeIcon(theme) {
        const icon = document.querySelector('.theme-icon');
        if (icon) {
            icon.textContent = theme === 'dark' ? '☀️' : '🌙';
        }
    }
    
    // Toggle theme function (called by button)
    window.toggleTheme = function() {
        const html = document.documentElement;
        const currentTheme = html.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        html.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        localStorage.setItem('themeManualOverride', 'true');
        updateThemeIcon(newTheme);
        
        // Show toast notification
        showThemeToast(newTheme);
    };
    
    // Reset to system preference
    window.resetToSystemTheme = function() {
        localStorage.removeItem('theme');
        localStorage.removeItem('themeManualOverride');
        const theme = getSystemTheme();
        document.documentElement.setAttribute('data-theme', theme);
        updateThemeIcon(theme);
    };
    
    // Show toast notification
    function showThemeToast(theme) {
        const existingToast = document.querySelector('.theme-toast');
        if (existingToast) existingToast.remove();
        
        const toast = document.createElement('div');
        toast.className = 'theme-toast';
        toast.innerHTML = theme === 'dark' 
            ? '🌙 Dark mode enabled' 
            : '☀️ Light mode enabled';
        toast.style.cssText = `
            position: fixed;
            bottom: 80px;
            right: 2rem;
            background: var(--text-primary);
            color: var(--bg-primary);
            padding: 0.75rem 1.25rem;
            border-radius: 16px;
            font-size: 0.85rem;
            font-weight: 500;
            z-index: 1001;
            animation: fadeInUp 0.3s ease;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            text-align: center;
        `;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transition = 'opacity 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 2000);
    }
    
    // Update icon when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            updateThemeIcon(document.documentElement.getAttribute('data-theme'));
        });
    } else {
        updateThemeIcon(currentTheme);
    }
})();
