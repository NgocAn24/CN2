// Import module managers
import { CourseModuleManager } from './modules/courseModules.js';
import { SemesterManager } from './modules/semesters.js';
import { ClassManager } from './modules/classes.js';
import { TeacherManager } from './modules/teachers.js';
import { StatisticsManager } from './modules/statistics.js';

// Import utilities
// import { initStorage } from './utils/storage.js';
// import { appState } from './utils/state.js';

class Dashboard {
    constructor() {
        this.currentPage = 'course-modules';
        this.modules = {
            'course-modules': new CourseModuleManager(),
            'semesters': new SemesterManager(),
            'classes': new ClassManager(),
            'teachers': new TeacherManager(),
            'statistics': new StatisticsManager()
        };

        this.init();
    }

    init() {
        // Initialize storage if empty
        this.initStorage();

        // Initialize navigation
        this.initNavigation();

        // Load default page
        this.loadPage('course-modules');

        // Setup modal closing
        this.setupModalClosing();
    }

    initStorage() {
        const STORAGE_KEYS = {
            COURSE_MODULES: 'courseModules',
            SEMESTERS: 'semesters',
            CLASSES: 'classes',
            TEACHERS: 'teachers'
        };

        Object.values(STORAGE_KEYS).forEach(key => {
            if (!localStorage.getItem(key)) {
                localStorage.setItem(key, JSON.stringify([]));
            }
        });
    }

    initNavigation() {
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = link.dataset.page;
                this.loadPage(page);

                // Update active state
                navLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');
            });
        });
    }

    loadPage(page) {
        // Hide all pages
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));

        // Show selected page
        const pageElement = document.getElementById(page);
        if (pageElement) {
            pageElement.classList.add('active');
        }

        this.currentPage = page;

        // Initialize module for this page
        if (this.modules[page]) {
            this.modules[page].init(pageElement);
        }
    }

    setupModalClosing() {
        // Close when clicking the X button
        document.querySelectorAll('.modal .close').forEach(btn => {
            btn.addEventListener('click', () => {
                const modal = btn.closest('.modal');
                if (modal) {
                    modal.style.display = 'none';
                    const form = modal.querySelector('form');
                    if (form) form.reset();
                }
            });
        });

        // Close when clicking outside the modal
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                e.target.style.display = 'none';
                const form = e.target.querySelector('form');
                if (form) form.reset();
            }
        });

        // Close when clicking cancel buttons
        document.querySelectorAll('.btn-cancel').forEach(btn => {
            btn.addEventListener('click', () => {
                const modal = btn.closest('.modal');
                if (modal) {
                    modal.style.display = 'none';
                    const form = modal.querySelector('form');
                    if (form) form.reset();
                }
            });
        });
    }

    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        notification.setAttribute('role', 'alert');
        notification.setAttribute('aria-live', 'assertive');

        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
    }
}

// Make dashboard instance globally available
window.dashboard = null;

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.dashboard = new Dashboard();
});