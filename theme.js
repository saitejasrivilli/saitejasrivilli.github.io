/**
 * Automatic Theme Switcher - Dark mode 6 PM to 6 AM, Light mode 6 AM to 6 PM
 */

function getDayNightMode() {
    const now = new Date();
    const hour = now.getHours();
    
    // Dark mode: 6 PM (18:00) to 6 AM (06:00)
    // Light mode: 6 AM (06:00) to 6 PM (18:00)
    if (hour >= 18 || hour < 6) {
        return 'dark';
    } else {
        return 'light';
    }
}

function applyTheme(forcedMode = null) {
    const mode = forcedMode || getDayNightMode();
    const root = document.documentElement;
    
    // Remove both classes first
    root.classList.remove('light-mode', 'dark-mode');
    
    if (mode === 'light') {
        root.classList.add('light-mode');
        document.body.style.background = '#ffffff';
        document.body.style.color = '#1a1a1a';
    } else {
        root.classList.add('dark-mode');
        document.body.style.background = '#0a0a0a';
        document.body.style.color = '#e5e5e5';
    }
    
    // Store the preference
    if (forcedMode) {
        localStorage.setItem('themePreference', forcedMode);
    }
    
    updateThemeVariables(mode);
}

function updateThemeVariables(mode) {
    const root = document.documentElement;
    
    if (mode === 'light') {
        root.style.setProperty('--bg-primary', '#ffffff');
        root.style.setProperty('--bg-secondary', '#f8f8f8');
        root.style.setProperty('--bg-tertiary', '#f0f0f0');
        root.style.setProperty('--text-primary', '#1a1a1a');
        root.style.setProperty('--text-secondary', '#666666');
        root.style.setProperty('--border-color', '#e0e0e0');
        root.style.setProperty('--shadow-color', 'rgba(0, 0, 0, 0.1)');
        root.style.setProperty('--card-bg', '#ffffff');
        root.style.setProperty('--hover-bg', '#f5f5f5');
    } else {
        root.style.setProperty('--bg-primary', '#0a0a0a');
        root.style.setProperty('--bg-secondary', '#1a1a1a');
        root.style.setProperty('--bg-tertiary', '#252525');
        root.style.setProperty('--text-primary', '#e5e5e5');
        root.style.setProperty('--text-secondary', '#b0b0b0');
        root.style.setProperty('--border-color', '#333333');
        root.style.setProperty('--shadow-color', 'rgba(0, 0, 0, 0.5)');
        root.style.setProperty('--card-bg', '#1a1a1a');
        root.style.setProperty('--hover-bg', '#252525');
    }
}

function toggleThemeManually() {
    const currentMode = document.documentElement.classList.contains('dark-mode') ? 'dark' : 'light';
    const newMode = currentMode === 'dark' ? 'light' : 'dark';
    
    applyTheme(newMode);
    localStorage.setItem('themeManualOverride', 'true');
    localStorage.setItem('themeOverrideMode', newMode);
    
    // Show indicator
    showThemeIndicator(newMode);
}

function showThemeIndicator(mode) {
    const indicator = document.getElementById('theme-indicator');
    if (indicator) {
        const text = mode === 'dark' ? '🌙 Manual Dark Mode' : '☀️ Manual Light Mode';
        indicator.textContent = text;
        indicator.style.display = 'block';
        
        setTimeout(() => {
            indicator.style.display = 'none';
        }, 2000);
    }
}

// Initialize theme when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Check if user has manually overridden the theme
    const hasOverride = localStorage.getItem('themeManualOverride') === 'true';
    const overrideMode = localStorage.getItem('themeOverrideMode');
    
    if (hasOverride && overrideMode) {
        applyTheme(overrideMode);
    } else {
        applyTheme();
    }
});

// Apply theme immediately on script load (before DOMContentLoaded)
const hasOverride = localStorage.getItem('themeManualOverride') === 'true';
const overrideMode = localStorage.getItem('themeOverrideMode');

if (hasOverride && overrideMode) {
    applyTheme(overrideMode);
} else {
    applyTheme();
}

// Check and update theme every minute for auto-switching (only if no manual override)
setInterval(() => {
    const hasOverride = localStorage.getItem('themeManualOverride') === 'true';
    if (!hasOverride) {
        applyTheme();
    }
}, 60000);

// Reset manual override at 6 AM and 6 PM
setInterval(() => {
    const now = new Date();
    const hour = now.getHours();
    const minute = now.getMinutes();
    if ((hour === 6 || hour === 18) && minute === 0) {
        localStorage.removeItem('themeManualOverride');
        localStorage.removeItem('themeOverrideMode');
        applyTheme();
    }
}, 60000);
