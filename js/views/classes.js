// DOM Elements
const classModal = document.getElementById('classModal');
const classForm = document.getElementById('classForm');
const classesTable = document.getElementById('classesTable');
const classModalTitle = document.getElementById('classModalTitle');
const semesterSelect = document.getElementById('semesterSelect');
const courseModuleSelect = document.getElementById('courseModuleSelect');

// Initialize classes view
function initClasses() {
    loadClasses();
    loadSelectOptions();
    setupEventListeners();
}

// Load classes into table
function loadClasses() {
    const classes = Class.getAll();
    const tbody = classesTable.querySelector('tbody');
    tbody.innerHTML = '';

    classes.forEach(cls => {
        const fullInfo = Class.getFullInfo(cls.id);
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${fullInfo.code}</td>
            <td>${fullInfo.name}</td>
            <td>${fullInfo.semester.name}</td>
            <td>${fullInfo.courseModule.name}</td>
            <td>${fullInfo.studentCount}</td>
            <td>
                <button class="btn-edit" onclick="editClass('${cls.id}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-delete" onclick="deleteClass('${cls.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Load select options for semester and course module
function loadSelectOptions() {
    // Load semesters
    const semesters = Semester.getAll();
    semesterSelect.innerHTML = '<option value="">Chọn kì học</option>';
    semesters.forEach(semester => {
        semesterSelect.innerHTML += `
            <option value="${semester.id}">
                ${semester.name} (${semester.academicYear})
            </option>
        `;
    });

    // Load course modules
    const courseModules = CourseModule.getAll();
    courseModuleSelect.innerHTML = '<option value="">Chọn học phần</option>';
    courseModules.forEach(module => {
        courseModuleSelect.innerHTML += `
            <option value="${module.id}">
                ${module.code} - ${module.name}
            </option>
        `;
    });
}

// Setup event listeners
function setupEventListeners() {
    // Form submit handler
    classForm.addEventListener('submit', handleFormSubmit);
}

// Show add class modal
function showAddClass() {
    appState.setEditingId(null);
    classModalTitle.textContent = 'Thêm lớp học';
    classForm.reset();
    classModal.style.display = 'block';
}

// Show edit class modal
function editClass(id) {
    const classItem = Class.getById(id);
    if (classItem) {
        appState.setEditingId(id);
        classModalTitle.textContent = 'Sửa lớp học';
        
        // Fill form with class data
        document.getElementById('code').value = classItem.code;
        document.getElementById('name').value = classItem.name;
        document.getElementById('semesterSelect').value = classItem.semesterId;
        document.getElementById('courseModuleSelect').value = classItem.courseModuleId;
        document.getElementById('studentCount').value = classItem.studentCount;

        classModal.style.display = 'block';
    }
}

// Handle form submit
function handleFormSubmit(e) {
    e.preventDefault();

    const classData = {
        code: document.getElementById('code').value.trim(),
        name: document.getElementById('name').value.trim(),
        semesterId: document.getElementById('semesterSelect').value,
        courseModuleId: document.getElementById('courseModuleSelect').value,
        studentCount: document.getElementById('studentCount').value
    };

    // Add ID if editing
    if (appState.getEditingId()) {
        classData.id = appState.getEditingId();
    }

    // Validate form data
    const errors = Class.validate(classData);
    if (errors.length > 0) {
        alert(errors.join('\n'));
        return;
    }

    try {
        if (appState.getEditingId()) {
            // Update existing class
            Class.update(appState.getEditingId(), classData);
            showNotification('Cập nhật lớp học thành công!');
        } else {
            // Add new class
            Class.add(classData);
            showNotification('Thêm lớp học thành công!');
        }

        classModal.style.display = 'none';
        classForm.reset();
        appState.reset();
        loadClasses();
    } catch (error) {
        alert('Có lỗi xảy ra: ' + error.message);
    }
}

// Delete class
function deleteClass(id) {
    if (confirm('Bạn có chắc chắn muốn xóa lớp học này?')) {
        try {
            Class.delete(id);
            showNotification('Xóa lớp học thành công!');
            loadClasses();
        } catch (error) {
            alert('Có lỗi xảy ra: ' + error.message);
        }
    }
}

// Initialize when document is loaded
document.addEventListener('DOMContentLoaded', initClasses);
