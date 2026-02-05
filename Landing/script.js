// ===================================
// PIXEL LANDING PAGE - INTERACTIVE SCRIPT
// ===================================

document.addEventListener('DOMContentLoaded', () => {
    // Initialize theme from localStorage
    initTheme();

    // Initialize language from localStorage
    initLanguage();

    // Initialize all interactive features
    initParallax();
    initSmoothScroll();
    initPixelEffects();
    initConsole();
    initAnimations();
});

// ===================================
// THEME MANAGEMENT
// ===================================
function initTheme() {
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = document.querySelector('.theme-icon');

    // Check for saved theme preference or default to 'dark'
    const currentTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', currentTheme);

    // Update icon based on current theme
    updateThemeIcon(currentTheme, themeIcon);

    // Add click event listener
    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

        // Update theme
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);

        // Update icon with animation
        updateThemeIcon(newTheme, themeIcon);

        // Create theme switch effect
        createThemeSwitchEffect();
    });
}

function updateThemeIcon(theme, iconElement) {
    if (theme === 'light') {
        iconElement.textContent = '🌙'; // Moon for light mode (click to go dark)
    } else {
        iconElement.textContent = '☀️'; // Sun for dark mode (click to go light)
    }
}

function createThemeSwitchEffect() {
    const effect = document.createElement('div');
    effect.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: var(--bg-primary);
        opacity: 0;
        pointer-events: none;
        z-index: 9998;
        animation: fadeInOut 0.5s ease;
    `;

    document.body.appendChild(effect);

    setTimeout(() => {
        effect.remove();
    }, 500);
}

// Add fade animation for theme switch
if (!document.getElementById('theme-switch-animation')) {
    const style = document.createElement('style');
    style.id = 'theme-switch-animation';
    style.textContent = `
        @keyframes fadeInOut {
            0% { opacity: 0; }
            50% { opacity: 0.3; }
            100% { opacity: 0; }
        }
    `;
    document.head.appendChild(style);
}


// ===================================
// LANGUAGE MANAGEMENT
// ===================================
const translations = {
    en: {
        // Navigation
        'nav-features': 'Features',
        'nav-about': 'About',
        'nav-demo': 'Demo',
        'nav-contact': 'Contact',
        'start-quest': 'Start Quest',

        // Hero Section
        'hero-badge': 'New Game Loading...',
        'hero-title-1': 'Level Up Your',
        'hero-title-2': 'Productivity',
        'hero-subtitle': 'Manage tasks like a pro gamer. ChibChob will chop chop your fat goals into daily quests.',
        'hero-btn-1': 'Start Adventure',
        'hero-btn-2': 'View Docs',

        // Hero Stats
        'stat-1-value': '1000+',
        'stat-1-label': 'Active Players',
        'stat-2-value': '50K+',
        'stat-2-label': 'Tasks Completed',
        'stat-3-value': '99%',
        'stat-3-label': 'Success Rate',

        // Demo Tasks
        'task-1': 'Design Landing Page',
        'task-2': 'Build Features',
        'task-3': 'Deploy Project',

        // Demo Section
        'demo-title': 'See It In Action',
        'demo-description': 'Watch how ChibChob transforms ordinary task management into an epic adventure.',
        'demo-feature-1': 'Intuitive pixel-perfect interface',
        'demo-feature-2': 'Real-time collaboration tools',
        'demo-feature-3': 'Cross-platform compatibility',
        'demo-feature-4': 'Offline mode support',
        'demo-button': 'Watch Demo',
        'press-a': 'Press A to continue',

        // Features Section
        'features-title': 'Power-Ups & Features',
        'features-subtitle': 'Unlock legendary productivity tools',

        // Feature Cards
        'card-1-title': 'Gamified Tasks',
        'card-1-desc': 'Turn boring tasks into exciting quests. Earn XP, unlock achievements, and level up your productivity.',
        'card-2-title': 'Battle System',
        'card-2-desc': 'Compete with teammates in productivity battles. Complete tasks faster to claim victory.',
        'card-3-title': 'Achievements',
        'card-3-desc': 'Unlock rare achievements as you complete challenges and maintain streaks.',
        'card-4-title': 'Analytics Dashboard',
        'card-4-desc': 'Track your progress with detailed stats and beautiful pixel charts.',
        'card-5-title': 'Smart Notifications',
        'card-5-desc': 'Never miss a quest deadline with intelligent reminders and alerts.',
        'card-6-title': 'Party Mode',
        'card-6-desc': 'Team up with friends for collaborative quests and shared victories.',

        // Badges
        'badge-common': 'Common',
        'badge-uncommon': 'Uncommon',
        'badge-rare': 'Rare',
        'badge-epic': 'Epic',
        'badge-legendary': 'Legendary',

        // CTA Section
        'cta-title': 'Ready to Start Your Quest?',
        'cta-subtitle': 'Join thousands of players leveling up their productivity',
        'cta-btn-1': 'Begin Adventure',
        'cta-btn-2': 'Talk to Support',

        // Footer
        'footer-tagline': 'Level up your productivity, one quest at a time.',
        'footer-quick': 'Quick Links',
        'footer-resources': 'Resources',
        'footer-legal': 'Legal',
        'footer-docs': 'Documentation',
        'footer-api': 'API Reference',
        'footer-community': 'Community',
        'footer-blog': 'Blog',
        'footer-privacy': 'Privacy Policy',
        'footer-terms': 'Terms of Service',
        'footer-license': 'License',
        'copyright': '© 2026 ChibChob. All rights reserved. Made with ❤️ by productivity enthusiasts.',

        // Level Up Message
        'level-up': 'LEVEL UP!',
        'level-reached': 'You reached Level 2!',

        // Coming Soon Message
        'coming-soon-title': 'Quest Coming Soon!',
        'coming-soon-subtitle': 'The adventure is being prepared...',
        'coming-soon-button': 'OK'
    },
    vi: {
        // Navigation
        'nav-features': 'Tính năng',
        'nav-about': 'Giới thiệu',
        'nav-demo': 'Demo',
        'nav-contact': 'Liên hệ',
        'start-quest': 'Bắt đầu',

        // Hero Section
        'hero-badge': 'Đang tải trò chơi...',
        'hero-title-1': 'Nâng cấp',
        'hero-title-2': 'Năng suất',
        'hero-subtitle': 'Quản lý công việc như game thủ chuyên nghiệp. ChibChob sẽ giúp bạn chặt nhỏ mục tiêu mập địt thành nhiệm vụ hàng ngày.',
        'hero-btn-1': 'Bắt đầu phiêu lưu',
        'hero-btn-2': 'Xem tài liệu',

        // Hero Stats
        'stat-1-value': '1000+',
        'stat-1-label': 'Người chơi',
        'stat-2-value': '50K+',
        'stat-2-label': 'Nhiệm vụ hoàn thành',
        'stat-3-value': '99%',
        'stat-3-label': 'Web sẽ sống (chắc thế..)',

        // Demo Tasks
        'task-1': 'Thiết kế trang chủ',
        'task-2': 'Xây dựng tính năng',
        'task-3': 'Triển khai dự án',

        // Demo Section
        'demo-title': 'Xem hoạt động',
        'demo-description': 'Xem ChibChob biến đổi quản lý công việc thường ngày thành cuộc phiêu lưu thú vị.',
        'demo-feature-1': 'Giao diện pixel hoàn hảo',
        'demo-feature-2': 'Công cụ cộng tác thời gian thực',
        'demo-feature-3': 'Tương thích đa nền tảng',
        'demo-feature-4': 'Hỗ trợ chế độ ngoại tuyến',
        'demo-button': 'Xem Demo',
        'press-a': 'Nhấn A để tiếp tục',

        // Features Section
        'features-title': 'Năng lực & Tính năng',
        'features-subtitle': 'Mở khóa công cụ năng suất huyền thoại',

        // Feature Cards
        'card-1-title': 'Nhiệm vụ trò chơi hóa',
        'card-1-desc': 'Biến công việc nhàm chán thành nhiệm vụ thú vị. Kiếm XP, mở khóa thành tựu và nâng cấp năng suất.',
        'card-2-title': 'Hệ thống chiến đấu',
        'card-2-desc': 'Cạnh tranh với đồng đội trong trận chiến năng suất. Hoàn thành nhiệm vụ nhanh hơn để giành chiến thắng.',
        'card-3-title': 'Thành tựu',
        'card-3-desc': 'Mở khóa thành tựu hiếm khi hoàn thành thử thách và duy trì chuỗi.',
        'card-4-title': 'Bảng phân tích',
        'card-4-desc': 'Theo dõi tiến độ với thống kê chi tiết và biểu đồ pixel đẹp mắt.',
        'card-5-title': 'Thông báo thông minh',
        'card-5-desc': 'Không bao giờ bỏ lỡ hạn chót nhiệm vụ với lời nhắc và cảnh báo thông minh.',
        'card-6-title': 'Chế độ nhóm',
        'card-6-desc': 'Hợp tác với bạn bè cho nhiệm vụ chung và chiến thắng chung.',

        // Badges
        'badge-common': 'Thường',
        'badge-uncommon': 'Không thường',
        'badge-rare': 'Hiếm',
        'badge-epic': 'Sử thi',
        'badge-legendary': 'Huyền thoại',

        // CTA Section
        'cta-title': 'Sẵn sàng bắt đầu nhiệm vụ?',
        'cta-subtitle': 'Tham gia cùng hàng nghìn người chơi nâng cao năng suất',
        'cta-btn-1': 'Bắt đầu phiêu lưu',
        'cta-btn-2': 'Liên hệ hỗ trợ',

        // Footer
        'footer-tagline': 'Nâng cao năng suất của bạn, từng nhiệm vụ một.',
        'footer-quick': 'Liên kết nhanh',
        'footer-resources': 'Tài nguyên',
        'footer-legal': 'Pháp lý',
        'footer-docs': 'Tài liệu',
        'footer-api': 'Tham chiếu API',
        'footer-community': 'Cộng đồng',
        'footer-blog': 'Blog',
        'footer-privacy': 'Chính sách bảo mật',
        'footer-terms': 'Điều khoản dịch vụ',
        'footer-license': 'Giấy phép',
        'copyright': '© 2026 ChibChob. Đã đăng ký bản quyền. Được tạo với ❤️ bởi những người đam mê năng suất.',

        // Level Up Message
        'level-up': 'NÂNG CẤP!',
        'level-reached': 'Bạn đã đạt Cấp độ 2!',

        // Coming Soon Message
        'coming-soon-title': 'Nhiệm vụ sắp ra mắt!',
        'coming-soon-subtitle': 'Cuộc phiêu lưu đang được chuẩn bị...',
        'coming-soon-button': 'OK'
    }
};

function initLanguage() {
    const languageToggle = document.getElementById('language-toggle');
    const languageIcon = document.querySelector('.language-icon');
    const languageDropdown = document.getElementById('language-dropdown');
    const languageOptions = document.querySelectorAll('.language-option');

    // Check for saved language preference or default to 'en'
    const currentLang = localStorage.getItem('language') || 'en';
    document.documentElement.setAttribute('lang', currentLang);

    // Update icon and active state
    updateLanguageIcon(currentLang, languageIcon);
    updateActiveLanguage(currentLang);

    // Apply translations
    applyTranslations(currentLang);

    // Toggle dropdown on click
    languageToggle.addEventListener('click', (e) => {
        e.preventDefault();
        languageDropdown.classList.toggle('show');
    });

    // Handle language selection
    languageOptions.forEach(option => {
        option.addEventListener('click', (e) => {
            e.preventDefault();
            const newLang = option.getAttribute('data-lang');

            // Update language
            document.documentElement.setAttribute('lang', newLang);
            localStorage.setItem('language', newLang);

            // Update icon and active state
            updateLanguageIcon(newLang, languageIcon);
            updateActiveLanguage(newLang);

            // Apply translations
            applyTranslations(newLang);

            // Close dropdown
            languageDropdown.classList.remove('show');

            // Visual feedback
            playPixelSound(option);
        });
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!languageToggle.contains(e.target) && !languageDropdown.contains(e.target)) {
            languageDropdown.classList.remove('show');
        }
    });
}

function updateLanguageIcon(lang, iconElement) {
    if (lang === 'vi') {
        iconElement.textContent = '🇻🇳'; // Vietnam flag for Vietnamese
    } else {
        iconElement.textContent = '🇬🇧'; // UK flag for English
    }
}

function updateActiveLanguage(lang) {
    const languageOptions = document.querySelectorAll('.language-option');
    languageOptions.forEach(option => {
        if (option.getAttribute('data-lang') === lang) {
            option.classList.add('active');
        } else {
            option.classList.remove('active');
        }
    });
}

function applyTranslations(lang) {
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (translations[lang] && translations[lang][key]) {
            element.textContent = translations[lang][key];
        }
    });
}


// ===================================
// PARALLAX SCROLL EFFECT
// ===================================
function initParallax() {
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const parallaxLayers = document.querySelectorAll('.parallax-layer');

        parallaxLayers.forEach((layer, index) => {
            const speed = (index + 1) * 0.5;
            layer.style.transform = `translateY(${scrolled * speed}px)`;
        });
    });
}

// ===================================
// SMOOTH SCROLLING
// ===================================
function initSmoothScroll() {
    const navLinks = document.querySelectorAll('.nav-link');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            const targetSection = document.querySelector(targetId);

            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });

                // Play click sound effect (visual feedback)
                playPixelSound(link);
            }
        });
    });
}

// ===================================
// PIXEL BUTTON EFFECTS
// ===================================
function initPixelEffects() {
    const buttons = document.querySelectorAll('.pixel-button');

    buttons.forEach(button => {
        // Add click sound effect
        button.addEventListener('click', (e) => {
            playPixelSound(button);
            createPixelBurst(e);
        });

        // Add hover effect
        button.addEventListener('mouseenter', () => {
            button.style.animation = 'none';
            setTimeout(() => {
                button.style.animation = '';
            }, 10);
        });
    });
}

// Create pixel burst effect on click
function createPixelBurst(e) {
    const burst = document.createElement('div');
    burst.className = 'pixel-burst';
    burst.style.position = 'fixed';
    burst.style.left = e.clientX + 'px';
    burst.style.top = e.clientY + 'px';
    burst.style.pointerEvents = 'none';
    burst.style.zIndex = '9999';

    for (let i = 0; i < 8; i++) {
        const pixel = document.createElement('span');
        pixel.textContent = '█';
        pixel.style.position = 'absolute';
        pixel.style.fontSize = '12px';
        pixel.style.color = getRandomPixelColor();
        pixel.style.animation = `burstPixel 0.6s ease-out forwards`;
        pixel.style.transform = `rotate(${i * 45}deg) translateY(0)`;
        pixel.style.animationDelay = `${i * 0.05}s`;
        burst.appendChild(pixel);
    }

    document.body.appendChild(burst);

    setTimeout(() => {
        burst.remove();
    }, 1000);
}

// Get random pixel color from theme
function getRandomPixelColor() {
    const colors = ['#7cd956', '#4a9eff', '#9d4dff', '#ffd93d', '#ff5555', '#ff9933'];
    return colors[Math.floor(Math.random() * colors.length)];
}

// Add burst animation to CSS dynamically
if (!document.getElementById('burst-animation')) {
    const style = document.createElement('style');
    style.id = 'burst-animation';
    style.textContent = `
        @keyframes burstPixel {
            0% {
                transform: translateY(0) scale(1);
                opacity: 1;
            }
            100% {
                transform: translateY(-50px) scale(0);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
}

// Visual feedback for clicks
function playPixelSound(element) {
    element.style.transform = 'scale(0.95)';
    setTimeout(() => {
        element.style.transform = '';
    }, 100);
}

// ===================================
// INTERACTIVE CONSOLE
// ===================================
function initConsole() {
    const consoleScreen = document.querySelector('.console-screen');
    const dPadButtons = document.querySelectorAll('.d-pad-btn');
    const actionButtons = document.querySelectorAll('.action-btn');

    if (!consoleScreen) return;

    // D-pad interactions
    dPadButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            updateConsoleMessage('D-PAD PRESSED');
            flashConsoleScreen();
        });
    });

    // Action button interactions
    actionButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const buttonType = btn.classList.contains('a') ? 'A' : 'B';
            updateConsoleMessage(`BUTTON ${buttonType} PRESSED`);
            flashConsoleScreen();

            if (buttonType === 'A') {
                startConsoleGame();
            }
        });
    });
}

function updateConsoleMessage(message) {
    const loadingText = document.querySelector('.loading-text');
    if (loadingText) {
        const originalText = loadingText.textContent;
        loadingText.textContent = message;

        setTimeout(() => {
            loadingText.textContent = originalText;
        }, 1500);
    }
}

function flashConsoleScreen() {
    const consoleScreen = document.querySelector('.console-screen');
    if (consoleScreen) {
        consoleScreen.style.background = 'rgba(124, 217, 86, 0.2)';
        setTimeout(() => {
            consoleScreen.style.background = '';
        }, 200);
    }
}

function startConsoleGame() {
    const consoleContent = document.querySelector('.console-content');
    if (!consoleContent) return;

    consoleContent.innerHTML = `
        <div class="loading-text">GAME STARTING...</div>
        <div class="game-screen">
            <div style="font-size: 10px; color: #7cd956; margin: 20px 0;">
                <p>▄▄▄▄▄▄▄▄▄▄▄▄▄▄</p>
                <p>█ TASK QUEST █</p>
                <p>▀▀▀▀▀▀▀▀▀▀▀▀▀▀</p>
                <p style="margin-top: 20px;">Press B to EXIT</p>
            </div>
        </div>
    `;

    // Add exit functionality
    const actionButtons = document.querySelectorAll('.action-btn');
    actionButtons.forEach(btn => {
        if (btn.classList.contains('b')) {
            const exitHandler = () => {
                resetConsole();
                btn.removeEventListener('click', exitHandler);
            };
            btn.addEventListener('click', exitHandler);
        }
    });
}

function resetConsole() {
    const consoleContent = document.querySelector('.console-content');
    if (!consoleContent) return;

    consoleContent.innerHTML = `
        <div class="loading-text">LOADING...</div>
        <div class="loading-bar">
            <div class="loading-progress"></div>
        </div>
        <div class="retro-text">Press START to continue</div>
    `;
}

// ===================================
// SCROLL ANIMATIONS
// ===================================
function initAnimations() {
    const observerOptions = {
        threshold: 0.2,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = 'fadeInUp 0.8s ease-out forwards';
                entry.target.style.opacity = '1';
            }
        });
    }, observerOptions);

    // Observe feature cards
    const cards = document.querySelectorAll('.feature-card');
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.animationDelay = `${index * 0.1}s`;
        observer.observe(card);
    });

    // Observe sections
    const sections = document.querySelectorAll('.demo, .cta');
    sections.forEach(section => {
        observer.observe(section);
    });
}

// ===================================
// TASK INTERACTION
// ===================================
let currentXP = 750; // Starting XP
const maxXP = 1000; // Max XP

const taskItems = document.querySelectorAll('.task-item');

taskItems.forEach(task => {
    task.addEventListener('click', () => {
        const checkbox = task.querySelector('.checkbox');
        const isCompleted = task.classList.contains('completed');

        // Only allow checking, not unchecking
        if (!isCompleted) {
            // Get XP value from the task
            const xpText = task.querySelector('.task-xp').textContent;
            const xpValue = parseInt(xpText.match(/\d+/)[0]); // Extract number from "+150 XP"

            // Mark as completed
            task.classList.add('completed');
            task.classList.remove('active');
            checkbox.textContent = '✓';
            checkbox.style.color = '#7cd956';

            // Add XP
            currentXP = Math.min(currentXP + xpValue, maxXP);

            // Update XP display
            updateXP();

            // Create completion effect
            createCompletionEffect(task, xpValue);
        }
        // If already completed, do nothing (prevents unchecking)
    });

    // Add pointer cursor for incomplete tasks
    if (!task.classList.contains('completed')) {
        task.style.cursor = 'pointer';
    }
});

function updateXP() {
    const xpFill = document.querySelector('.xp-fill');
    const xpLabel = document.querySelector('.xp-label');

    if (xpFill && xpLabel) {
        const percentage = (currentXP / maxXP) * 100;
        xpFill.style.width = percentage + '%';
        xpLabel.textContent = `XP: ${currentXP} / ${maxXP}`;
    }

    // Check for level up
    if (currentXP >= maxXP) {
        showLevelUpMessage();
    }
}

function createCompletionEffect(task, xpValue) {
    const effect = document.createElement('div');
    effect.textContent = `+${xpValue} XP`;
    effect.style.position = 'absolute';
    effect.style.color = '#ffd93d';
    effect.style.fontSize = '12px';
    effect.style.fontFamily = 'Press Start 2P';
    effect.style.animation = 'floatUp 1s ease-out forwards';
    effect.style.pointerEvents = 'none';
    effect.style.right = '10px';
    effect.style.top = '50%';

    task.style.position = 'relative';
    task.appendChild(effect);

    setTimeout(() => {
        effect.remove();
    }, 1000);
}

function showLevelUpMessage() {
    const currentLang = document.documentElement.lang || 'en';
    const levelUpText = translations[currentLang]['level-up'] || 'LEVEL UP!';
    const levelReachedText = translations[currentLang]['level-reached'] || 'You reached Level 2!';

    // Vietnamese gets larger font sizes to match visual weight
    const titleSize = currentLang === 'vi' ? '38px' : '24px';
    const subtitleSize = currentLang === 'vi' ? '24px' : '12px';

    const message = document.createElement('div');
    message.innerHTML = `
        <div style="
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(124, 217, 86, 0.95);
            color: #1a1a1a;
            padding: 32px 48px;
            border: 4px solid #5aa03a;
            box-shadow: 8px 8px 0 rgba(0, 0, 0, 0.5);
            z-index: 10000;
            font-family: 'Press Start 2P', cursive;
            font-size: ${titleSize};
            text-align: center;
            animation: scaleIn 0.15s ease-out;
        ">
            🎉 ${levelUpText} 🎉
            <div style="font-size: ${subtitleSize}; margin-top: 16px; line-height: 1.6;">${levelReachedText}</div>
        </div>
    `;

    document.body.appendChild(message);

    setTimeout(() => {
        message.remove();
    }, 1200);
}

// Add float up animation
if (!document.getElementById('float-animation')) {
    const style = document.createElement('style');
    style.id = 'float-animation';
    style.textContent = `
        @keyframes floatUp {
            0% {
                transform: translateY(0);
                opacity: 1;
            }
            100% {
                transform: translateY(-50px);
                opacity: 0;
            }
        }
        @keyframes scaleIn {
            0% {
                transform: translate(-50%, -50%) scale(0);
            }
            100% {
                transform: translate(-50%, -50%) scale(1);
            }
        }
    `;
    document.head.appendChild(style);
}

// ===================================
// KEYBOARD CONTROLS
// ===================================
document.addEventListener('keydown', (e) => {
    // Easter egg: Press 'P' for pixel rain
    if (e.key.toLowerCase() === 'p') {
        createPixelRain();
    }

    // Arrow keys control console
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
        const direction = e.key.replace('Arrow', '').toLowerCase();
        updateConsoleMessage(`MOVED ${direction.toUpperCase()}`);
    }
});

function createPixelRain() {
    const rain = document.createElement('div');
    rain.style.position = 'fixed';
    rain.style.top = '0';
    rain.style.left = '0';
    rain.style.width = '100%';
    rain.style.height = '100%';
    rain.style.pointerEvents = 'none';
    rain.style.zIndex = '9999';

    for (let i = 0; i < 50; i++) {
        const pixel = document.createElement('span');
        pixel.textContent = '█';
        pixel.style.position = 'absolute';
        pixel.style.left = Math.random() * 100 + '%';
        pixel.style.top = '-20px';
        pixel.style.fontSize = Math.random() * 20 + 10 + 'px';
        pixel.style.color = getRandomPixelColor();
        pixel.style.animation = `fall ${Math.random() * 3 + 2}s linear forwards`;
        pixel.style.animationDelay = Math.random() * 2 + 's';
        rain.appendChild(pixel);
    }

    document.body.appendChild(rain);

    setTimeout(() => {
        rain.remove();
    }, 5000);
}

// Add fall animation
if (!document.getElementById('fall-animation')) {
    const style = document.createElement('style');
    style.id = 'fall-animation';
    style.textContent = `
        @keyframes fall {
            0% {
                transform: translateY(0) rotate(0deg);
                opacity: 1;
            }
            100% {
                transform: translateY(100vh) rotate(360deg);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
}

// ===================================
// CTA BUTTON ACTIONS
// ===================================
const ctaButtons = document.querySelectorAll('.cta-button, .primary-btn, .large-btn');
ctaButtons.forEach(button => {
    button.addEventListener('click', () => {
        showComingSoonMessage();
    });
});

function showComingSoonMessage() {
    const currentLang = document.documentElement.lang || 'en';
    const titleText = translations[currentLang]['coming-soon-title'] || 'Quest Coming Soon!';
    const subtitleText = translations[currentLang]['coming-soon-subtitle'] || 'The adventure is being prepared...';
    const buttonText = translations[currentLang]['coming-soon-button'] || 'OK';

    // Vietnamese gets larger font sizes
    const titleSize = currentLang === 'vi' ? '24px' : '16px';
    const subtitleSize = currentLang === 'vi' ? '16px' : '10px';
    const buttonSize = currentLang === 'vi' ? '14px' : '10px';

    const message = document.createElement('div');
    message.innerHTML = `
        <div style="
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(26, 26, 26, 0.98);
            color: #7cd956;
            padding: 32px 48px;
            border: 4px solid #7cd956;
            box-shadow: 8px 8px 0 rgba(0, 0, 0, 0.5);
            z-index: 10000;
            font-family: 'Press Start 2P', cursive;
            font-size: ${titleSize};
            text-align: center;
            animation: scaleIn 0.3s ease-out;
        ">
            🎮 ${titleText} 🎮
            <div style="font-size: ${subtitleSize}; margin-top: 16px; color: #8b8b8b; line-height: 1.6;">
                ${subtitleText}
            </div>
            <button id="closeMessage" style="
                margin-top: 24px;
                padding: 12px 24px;
                background: #7cd956;
                color: #1a1a1a;
                border: none;
                font-family: 'Press Start 2P', cursive;
                font-size: ${buttonSize};
                cursor: pointer;
            ">${buttonText}</button>
        </div>
        <div style="
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            z-index: 9999;
        " id="messageOverlay"></div>
    `;

    document.body.appendChild(message);

    const closeBtn = document.getElementById('closeMessage');
    const overlay = document.getElementById('messageOverlay');

    const closeMessage = () => {
        message.remove();
    };

    closeBtn.addEventListener('click', closeMessage);
    overlay.addEventListener('click', closeMessage);
}

// ===================================
// CONSOLE LOG EASTER EGG
// ===================================
console.log('%c🎮 WELCOME TO TASKMIND! 🎮', 'font-size: 20px; color: #7cd956; font-weight: bold;');
console.log('%cPress "P" for a pixel surprise!', 'font-size: 12px; color: #4a9eff;');
console.log('%cBuilt with pixel-perfect precision ⚡', 'font-size: 12px; color: #9d4dff;');
