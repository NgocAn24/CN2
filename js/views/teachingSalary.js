// Import the TeachingSalaryManager class
import { TeachingSalaryManager } from '../modules/teachingSalary.js';

// Initialize the teaching salary manager
const teachingSalaryManager = new TeachingSalaryManager();

export function initTeachingSalary() {
    const teachingSalaryContainer = document.querySelector('#teaching-salary');
    if (teachingSalaryContainer) {
        teachingSalaryManager.init(teachingSalaryContainer);
    }
}

// Initialize when document is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Listen for navigation to teaching salary page
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            if (link.dataset.page === 'teaching-salary') {
                initTeachingSalary();
            }
        });
    });
});