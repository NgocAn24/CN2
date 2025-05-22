// DOM Elements
const statisticsContainer = document.getElementById('statistics');
const yearSelect = document.getElementById('yearSelect');
const statsTable = document.getElementById('statsTable');

// Initialize statistics view
function initStatistics() {
    loadYearOptions();
    setupEventListeners();
    loadStatistics(); // Load initial statistics
}

// Load academic year options
function loadYearOptions() {
    const semesters = Semester.getAll();
    const years = [...new Set(semesters.map(sem => sem.academicYear))];
    years.sort().reverse(); // Most recent year first

    yearSelect.innerHTML = '<option value="">Tất cả năm học</option>';
    years.forEach(year => {
        yearSelect.innerHTML += `<option value="${year}">${year}</option>`;
    });
}

// Setup event listeners
function setupEventListeners() {
    yearSelect.addEventListener('change', loadStatistics);
}

// Load statistics
function loadStatistics() {
    const selectedYear = yearSelect.value;
    const stats = calculateStatistics(selectedYear);
    displayStatistics(stats);
}

// Calculate statistics
function calculateStatistics(academicYear) {
    const semesters = academicYear 
        ? Semester.getAll().filter(sem => sem.academicYear === academicYear)
        : Semester.getAll();

    const semesterIds = semesters.map(sem => sem.id);
    const classes = Class.getAll().filter(cls => semesterIds.includes(cls.semesterId));
    const courseModules = CourseModule.getAll();

    // Group classes by course module
    const moduleStats = courseModules.map(module => {
        const moduleClasses = classes.filter(cls => cls.courseModuleId === module.id);
        const semesterCounts = semesters.map(semester => {
            const count = moduleClasses.filter(cls => cls.semesterId === semester.id).length;
            return {
                semester: semester.name,
                count: count
            };
        });

        return {
            moduleCode: module.code,
            moduleName: module.name,
            totalClasses: moduleClasses.length,
            semesterCounts: semesterCounts,
            totalStudents: moduleClasses.reduce((sum, cls) => sum + cls.studentCount, 0)
        };
    });

    // Sort by total classes descending
    moduleStats.sort((a, b) => b.totalClasses - a.totalClasses);

    return {
        semesters: semesters,
        moduleStats: moduleStats,
        totalClasses: classes.length,
        totalStudents: classes.reduce((sum, cls) => sum + cls.studentCount, 0)
    };
}

// Display statistics
function displayStatistics(stats) {
    const tbody = statsTable.querySelector('tbody');
    tbody.innerHTML = '';

    // Update table headers for semesters
    const headerRow = statsTable.querySelector('thead tr');
    headerRow.innerHTML = `
        <th>Mã học phần</th>
        <th>Tên học phần</th>
        ${stats.semesters.map(sem => `<th>${sem.name}</th>`).join('')}
        <th>Tổng số lớp</th>
        <th>Tổng số SV</th>
    `;

    // Add module statistics rows
    stats.moduleStats.forEach(module => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${module.moduleCode}</td>
            <td>${module.moduleName}</td>
            ${module.semesterCounts.map(sem => `<td>${sem.count}</td>`).join('')}
            <td>${module.totalClasses}</td>
            <td>${module.totalStudents}</td>
        `;
        tbody.appendChild(row);
    });

    // Add summary row
    const summaryRow = document.createElement('tr');
    summaryRow.className = 'summary-row';
    summaryRow.innerHTML = `
        <td colspan="2"><strong>Tổng cộng</strong></td>
        ${stats.semesters.map(sem => {
            const semesterTotal = stats.moduleStats.reduce((sum, module) => {
                const semCount = module.semesterCounts.find(s => s.semester === sem.name);
                return sum + (semCount ? semCount.count : 0);
            }, 0);
            return `<td><strong>${semesterTotal}</strong></td>`;
        }).join('')}
        <td><strong>${stats.totalClasses}</strong></td>
        <td><strong>${stats.totalStudents}</strong></td>
    `;
    tbody.appendChild(summaryRow);

    // Update summary cards
    updateSummaryCards(stats);
}

// Update summary cards
function updateSummaryCards(stats) {
    const summaryCards = document.getElementById('summaryCards');
    summaryCards.innerHTML = `
        <div class="summary-card">
            <div class="summary-icon">
                <i class="fas fa-book"></i>
            </div>
            <div class="summary-info">
                <h3>Tổng số học phần</h3>
                <p>${stats.moduleStats.length}</p>
            </div>
        </div>
        <div class="summary-card">
            <div class="summary-icon">
                <i class="fas fa-chalkboard"></i>
            </div>
            <div class="summary-info">
                <h3>Tổng số lớp</h3>
                <p>${stats.totalClasses}</p>
            </div>
        </div>
        <div class="summary-card">
            <div class="summary-icon">
                <i class="fas fa-users"></i>
            </div>
            <div class="summary-info">
                <h3>Tổng số sinh viên</h3>
                <p>${stats.totalStudents}</p>
            </div>
        </div>
        <div class="summary-card">
            <div class="summary-icon">
                <i class="fas fa-calendar-alt"></i>
            </div>
            <div class="summary-info">
                <h3>Số kì học</h3>
                <p>${stats.semesters.length}</p>
            </div>
        </div>
    `;
}

// Initialize when document is loaded
document.addEventListener('DOMContentLoaded', initStatistics);
