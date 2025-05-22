// Test the Dashboard functionality
describe('Dashboard', () => {
    let dashboard;

    beforeEach(() => {
        // Clear localStorage
        localStorage.clear();

        // Reset DOM
        document.body.innerHTML = `
            <div class="nav-link" data-page="course-modules"></div>
            <div id="course-modules" class="page"></div>
            <div id="semesters" class="page"></div>
            <div id="classes" class="page"></div>
            <div id="teachers" class="page"></div>
            <div id="statistics" class="page"></div>
        `;

        // Initialize dashboard
        dashboard = new Dashboard();
    });

    test('should initialize with default page', () => {
        expect(dashboard.currentPage).toBe('course-modules');
    });

    test('should initialize storage', () => {
        expect(localStorage.getItem('courseModules')).toBe('[]');
        expect(localStorage.getItem('semesters')).toBe('[]');
        expect(localStorage.getItem('classes')).toBe('[]');
        expect(localStorage.getItem('teachers')).toBe('[]');
    });

    test('should change pages', () => {
        dashboard.loadPage('teachers');
        expect(dashboard.currentPage).toBe('teachers');
        expect(document.getElementById('teachers').classList.contains('active')).toBe(true);
    });

    test('should show notification', () => {
        dashboard.showNotification('Test message');
        const notification = document.querySelector('.notification');
        expect(notification).toBeTruthy();
        expect(notification.textContent).toBe('Test message');
    });
});