// DOM Elements
const semesterModal = document.getElementById('semesterModal');
const semesterForm = document.getElementById('semesterForm');
const semestersTable = document.getElementById('semestersTable');
const semesterModalTitle = document.getElementById('semesterModalTitle');

// Initialize semesters view
function initSemesters() {
    loadSemesters();
    setupEventListeners();
}

// Load semesters into table
function loadSemesters() {
    const semesters = Semester.getAll();
    const tbody = semestersTable.querySelector('tbody');
    tbody.innerHTML = '';

    semesters.forEach(semester => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${semester.name}</td>
            <td>${semester.academicYear}</td>
            <td>${formatDate(semester.startDate)}</td>
            <td>${formatDate(semester.endDate)}</td>
            <td>
                <button class="btn-edit" onclick="editSemester('${semester.id}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-delete" onclick="deleteSemester('${semester.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Setup event listeners
function setupEventListeners() {
    // Form submit handler
    semesterForm.addEventListener('submit', handleFormSubmit);

    // Date input validation
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');

    startDateInput.addEventListener('change', () => {
        endDateInput.min = startDateInput.value;
    });

    endDateInput.addEventListener('change', () => {
        startDateInput.max = endDateInput.value;
    });
}

// Show add semester modal
function showAddSemester() {
    appState.setEditingId(null);
    semesterModalTitle.textContent = 'Thêm kì học';
    semesterForm.reset();
    semesterModal.style.display = 'block';
}

// Show edit semester modal
function editSemester(id) {
    const semester = Semester.getById(id);
    if (semester) {
        appState.setEditingId(id);
        semesterModalTitle.textContent = 'Sửa kì học';
        
        // Fill form with semester data
        document.getElementById('name').value = semester.name;
        document.getElementById('academicYear').value = semester.academicYear;
        document.getElementById('startDate').value = semester.startDate;
        document.getElementById('endDate').value = semester.endDate;

        semesterModal.style.display = 'block';
    }
}

// Handle form submit
function handleFormSubmit(e) {
    e.preventDefault();

    const semesterData = {
        name: document.getElementById('name').value.trim(),
        academicYear: document.getElementById('academicYear').value.trim(),
        startDate: document.getElementById('startDate').value,
        endDate: document.getElementById('endDate').value
    };

    // Add ID if editing
    if (appState.getEditingId()) {
        semesterData.id = appState.getEditingId();
    }

    // Validate form data
    const errors = Semester.validate(semesterData);
    if (errors.length > 0) {
        alert(errors.join('\n'));
        return;
    }

    try {
        if (appState.getEditingId()) {
            // Update existing semester
            Semester.update(appState.getEditingId(), semesterData);
            showNotification('Cập nhật kì học thành công!');
        } else {
            // Add new semester
            Semester.add(semesterData);
            showNotification('Thêm kì học thành công!');
        }

        semesterModal.style.display = 'none';
        semesterForm.reset();
        appState.reset();
        loadSemesters();
    } catch (error) {
        alert('Có lỗi xảy ra: ' + error.message);
    }
}

// Delete semester
function deleteSemester(id) {
    if (confirm('Bạn có chắc chắn muốn xóa kì học này?')) {
        try {
            Semester.delete(id);
            showNotification('Xóa kì học thành công!');
            loadSemesters();
        } catch (error) {
            alert('Có lỗi xảy ra: ' + error.message);
        }
    }
}

// Format date for display
function formatDate(dateString) {
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('vi-VN', options);
}

// Initialize when document is loaded
document.addEventListener('DOMContentLoaded', initSemesters);
