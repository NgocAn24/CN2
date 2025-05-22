export class StatisticsManager {
    constructor() {
        this.contentArea = null;
    }

    init(contentArea) {
        this.contentArea = contentArea;
        this.setupEventListeners();
        this.loadYearSelect();
        this.loadStatistics();
    }

    setupEventListeners() {
        const yearSelect = document.getElementById('yearSelect');
        yearSelect.addEventListener('change', () => this.loadStatistics());
    }

    loadYearSelect() {
        const semesters = JSON.parse(localStorage.getItem('semesters') || '[]');
        const years = [...new Set(semesters.map(s => s.academicYear))];
        const yearSelect = document.getElementById('yearSelect');

        yearSelect.innerHTML = '<option value="">Tất cả năm học</option>';
        years.forEach(year => {
            yearSelect.innerHTML += `<option value="${year}">${year}</option>`;
        });
    }

    loadStatistics() {
        const selectedYear = document.getElementById('yearSelect').value;

        // Get all data
        const courseModules = JSON.parse(localStorage.getItem('courseModules') || '[]');
        const classes = JSON.parse(localStorage.getItem('classes') || '[]');
        const semesters = JSON.parse(localStorage.getItem('semesters') || '[]');
        const teachers = JSON.parse(localStorage.getItem('teachers') || '[]');

        // Filter by year if selected
        const filteredSemesters = selectedYear ?
            semesters.filter(s => s.academicYear === selectedYear) :
            semesters;

        const filteredClasses = classes.filter(c =>
            filteredSemesters.some(s => s.id === c.semesterId)
        );

        // Calculate summary statistics
        const totalClasses = filteredClasses.length;
        const totalStudents = filteredClasses.reduce((sum, cls) => sum + cls.studentCount, 0);
        const totalTeachers = new Set(filteredClasses.filter(c => c.teacherId).map(c => c.teacherId)).size;
        const totalModules = new Set(filteredClasses.map(c => c.courseModuleId)).size;

        // Update summary cards
        this.updateSummaryCards({
            totalClasses,
            totalStudents,
            totalTeachers,
            totalModules
        });

        // Calculate statistics by course module
        const moduleStats = this.calculateModuleStats(courseModules, filteredClasses);
        this.updateStatsTable(moduleStats);
    }

    updateSummaryCards(stats) {
        const summaryCards = document.getElementById('summaryCards');
        summaryCards.innerHTML = `
            <div class="stat-card">
                <i class="fas fa-chalkboard"></i>
                <div class="stat-info">
                    <h3>Tổng số lớp</h3>
                    <p>${stats.totalClasses}</p>
                </div>
            </div>
            <div class="stat-card">
                <i class="fas fa-user-graduate"></i>
                <div class="stat-info">
                    <h3>Tổng số sinh viên</h3>
                    <p>${stats.totalStudents}</p>
                </div>
            </div>
            <div class="stat-card">
                <i class="fas fa-chalkboard-teacher"></i>
                <div class="stat-info">
                    <h3>Số giảng viên</h3>
                    <p>${stats.totalTeachers}</p>
                </div>
            </div>
            <div class="stat-card">
                <i class="fas fa-book"></i>
                <div class="stat-info">
                    <h3>Số học phần</h3>
                    <p>${stats.totalModules}</p>
                </div>
            </div>
        `;
    }

    calculateModuleStats(courseModules, classes) {
        return courseModules.map(module => {
            const moduleClasses = classes.filter(c => c.courseModuleId === module.id);
            return {
                code: module.code,
                name: module.name,
                totalClasses: moduleClasses.length,
                totalStudents: moduleClasses.reduce((sum, cls) => sum + cls.studentCount, 0)
            };
        }).sort((a, b) => b.totalClasses - a.totalClasses);
    }

    updateStatsTable(moduleStats) {
        const tbody = document.getElementById('statsTable').querySelector('tbody');
        tbody.innerHTML = '';

        moduleStats.forEach(stat => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${stat.code}</td>
                <td>${stat.name}</td>
                <td>${stat.totalClasses}</td>
                <td>${stat.totalStudents}</td>
            `;
            tbody.appendChild(row);
        });
    }
}