// theme.js - Shared Dark Mode for All Pages
// Add this to your GitHub Pages repo and include in all HTML files

(function() {
    // Apply theme IMMEDIATELY to prevent flash (runs before page renders)
    function getTimeBasedTheme() {
        const hour = new Date().getHours();
        // Dark mode from 6 PM (18:00) to 6 AM (06:00)
        return (hour >= 18 || hour < 6) ? 'dark' : 'light';
    }

    function applyThemeImmediately() {
        const manualOverride = localStorage.getItem('themeManualOverride');
        const savedTheme = localStorage.getItem('theme');
        const theme = (manualOverride === 'true' && savedTheme) ? savedTheme : getTimeBasedTheme();
        document.documentElement.setAttribute('data-theme', theme);
        return theme;
    }

    // Apply immediately
    const currentTheme = applyThemeImmediately();

    // Full theme functionality (runs after DOM loads)
    document.addEventListener('DOMContentLoaded', function() {
        
        // Update the toggle button icon
        function updateThemeIcon(theme) {
            const icon = document.querySelector('.theme-icon');
            if (icon) {
                icon.textContent = theme === 'dark' ? '☀️' : '🌙';
            }
        }

        // Show toast notification on theme change
        function showThemeToast(theme) {
            const existingToast = document.querySelector('.theme-toast');
            if (existingToast) existingToast.remove();

            const toast = document.createElement('div');
            toast.className = 'theme-toast';
            toast.innerHTML = theme === 'dark' ? '🌙 Dark mode enabled' : '☀️ Light mode enabled';
            toast.style.cssText = `
                position: fixed;
                bottom: 80px;
                right: 2rem;
                background: var(--text-primary);
                color: var(--bg-primary);
                padding: 0.75rem 1.25rem;
                border-radius: 50px;
                font-size: 0.85rem;
                font-weight: 500;
                z-index: 1001;
                animation: fadeInUp 0.3s ease;
                box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            `;
            document.body.appendChild(toast);

            setTimeout(() => {
                toast.style.opacity = '0';
                toast.style.transition = 'opacity 0.3s ease';
                setTimeout(() => toast.remove(), 300);
            }, 2000);
        }

        // Apply theme with icon update
        function applyTheme() {
            const manualOverride = localStorage.getItem('themeManualOverride');
            const savedTheme = localStorage.getItem('theme');
            
            let theme;
            if (manualOverride === 'true' && savedTheme) {
                theme = savedTheme;
            } else {
                theme = getTimeBasedTheme();
                localStorage.removeItem('themeManualOverride');
            }
            
            document.documentElement.setAttribute('data-theme', theme);
            updateThemeIcon(theme);
            return theme;
        }

        // Toggle theme (called by button click)
        window.toggleTheme = function() {
            const html = document.documentElement;
            const currentTheme = html.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
            html.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            localStorage.setItem('themeManualOverride', 'true');
            updateThemeIcon(newTheme);
            showThemeToast(newTheme);
        };

        // Initialize
        updateThemeIcon(document.documentElement.getAttribute('data-theme'));

        // Auto-update theme every minute (for users who keep page open)
        setInterval(() => {
            const manualOverride = localStorage.getItem('themeManualOverride');
            if (manualOverride !== 'true') {
                applyTheme();
            }
        }, 60000);

        // Reset manual override at 6 AM and 6 PM to re-enable auto-switching
        setInterval(() => {
            const now = new Date();
            const hour = now.getHours();
            const minute = now.getMinutes();
            if ((hour === 6 || hour === 18) && minute === 0) {
                localStorage.removeItem('themeManualOverride');
                applyTheme();
            }
        }, 60000);
    });
})();
