/**
 * Theme Manager - Auto Dark/Light Mode
 * - Automatically switches based on time of day (6PM-6AM = dark)
 * - Respects system preference (prefers-color-scheme)
 * - Manual toggle override with memory
 * - Mobile compatible with touch events
 */

(function() {
    'use strict';

    // Configuration
    const CONFIG = {
        darkStartHour: 18,    // 6 PM
        darkEndHour: 6,       // 6 AM
        storageKey: 'theme',
        overrideKey: 'themeManualOverride',
        transitionDuration: 300
    };

    // Determine theme based on time of day
    function getTimeBasedTheme() {
        const hour = new Date().getHours();
        return (hour >= CONFIG.darkStartHour || hour < CONFIG.darkEndHour) ? 'dark' : 'light';
    }

    // Check system preference
    function getSystemPreference() {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }
        return 'light';
    }

    // Determine the best theme to use
    function determineTheme() {
        const manualOverride = localStorage.getItem(CONFIG.overrideKey);
        const savedTheme = localStorage.getItem(CONFIG.storageKey);

        // If user manually selected a theme, respect it
        if (manualOverride === 'true' && savedTheme) {
            return savedTheme;
        }

        // Otherwise, use time-based theme
        return getTimeBasedTheme();
    }

    // Apply theme to document
    function applyTheme(theme, animate = true) {
        const html = document.documentElement;
        
        if (animate) {
            html.style.transition = `background ${CONFIG.transitionDuration}ms ease, color ${CONFIG.transitionDuration}ms ease`;
        }
        
        html.setAttribute('data-theme', theme);
        
        // Update theme toggle icon if it exists
        updateThemeIcon(theme);
        
        // Remove transition after it completes
        if (animate) {
            setTimeout(() => {
                html.style.transition = '';
            }, CONFIG.transitionDuration);
        }
    }

    // Update the toggle button icon
    function updateThemeIcon(theme) {
        const icon = document.querySelector('.theme-icon');
        if (icon) {
            icon.textContent = theme === 'dark' ? '☀️' : '🌙';
        }
    }

    // Show toast notification
    function showToast(theme) {
        // Remove existing toast
        const existingToast = document.querySelector('.theme-toast');
        if (existingToast) {
            existingToast.remove();
        }

        const toast = document.createElement('div');
        toast.className = 'theme-toast';
        toast.textContent = theme === 'dark' ? '🌙 Dark mode enabled' : '☀️ Light mode enabled';
        toast.style.cssText = `
            position: fixed;
            bottom: 80px;
            right: 1rem;
            left: 1rem;
            max-width: 200px;
            margin-left: auto;
            background: var(--text-primary);
            color: var(--bg-primary);
            padding: 0.75rem 1.25rem;
            border-radius: 50px;
            font-size: 0.85rem;
            font-weight: 500;
            z-index: 1001;
            text-align: center;
            animation: fadeInUp 0.3s ease;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        `;
        document.body.appendChild(toast);

        // Auto-remove toast
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transition = 'opacity 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 2000);
    }

    // Toggle theme (called by button)
    window.toggleTheme = function() {
        const html = document.documentElement;
        const currentTheme = html.getAttribute('data-theme') || 'light';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        // Save preference
        localStorage.setItem(CONFIG.storageKey, newTheme);
        localStorage.setItem(CONFIG.overrideKey, 'true');
        
        // Apply theme
        applyTheme(newTheme);
        showToast(newTheme);
    };

    // Initialize theme immediately (before DOM loads to prevent flash)
    function initTheme() {
        const theme = determineTheme();
        applyTheme(theme, false);
    }

    // Run immediately
    initTheme();

    // Also run when DOM is ready (to update icon)
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            updateThemeIcon(determineTheme());
        });
    } else {
        updateThemeIcon(determineTheme());
    }

    // Listen for system preference changes
    if (window.matchMedia) {
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function(e) {
            const manualOverride = localStorage.getItem(CONFIG.overrideKey);
            if (manualOverride !== 'true') {
                applyTheme(e.matches ? 'dark' : 'light');
            }
        });
    }

    // Check time-based theme every minute
    setInterval(function() {
        const manualOverride = localStorage.getItem(CONFIG.overrideKey);
        if (manualOverride !== 'true') {
            const theme = getTimeBasedTheme();
            const currentTheme = document.documentElement.getAttribute('data-theme');
            if (theme !== currentTheme) {
                applyTheme(theme);
            }
        }
    }, 60000);

    // Reset manual override at theme switch times (6 AM and 6 PM)
    setInterval(function() {
        const now = new Date();
        const hour = now.getHours();
        const minute = now.getMinutes();
        
        if ((hour === CONFIG.darkStartHour || hour === CONFIG.darkEndHour) && minute === 0) {
            localStorage.removeItem(CONFIG.overrideKey);
            applyTheme(getTimeBasedTheme());
        }
    }, 60000);

})();
