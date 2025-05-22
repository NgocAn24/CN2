// DOM Elements
const teacherModal = document.getElementById('teacherModal');
const teacherForm = document.getElementById('teacherForm');
const teachersTable = document.getElementById('teachersTable');
const teacherModalTitle = document.getElementById('teacherModalTitle');
const assignmentModal = document.getElementById('assignmentModal');
const assignmentForm = document.getElementById('assignmentForm');
const assignedClassesList = document.getElementById('assignedClassesList');

// Initialize teachers view
function initTeachers() {
    loadTeachers();
    setupEventListeners();
}

// Load teachers into table
function loadTeachers() {
    const teachers = Teacher.getAll();
    const tbody = teachersTable.querySelector('tbody');
    tbody.innerHTML = '';

    teachers.forEach(teacher => {
        const assignedClasses = Teacher.getAssignedClasses(teacher.id);
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${teacher.code}</td>
            <td>${teacher.name}</td>
            <td>${teacher.email || ''}</td>
            <td>${teacher.phone || ''}</td>
            <td>${assignedClasses.length}</td>
            <td>
                <button class="btn-assign" onclick="showAssignment('${teacher.id}')">
                    <i class="fas fa-tasks"></i>
                </button>
                <button class="btn-edit" onclick="editTeacher('${teacher.id}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-delete" onclick="deleteTeacher('${teacher.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Setup event listeners
function setupEventListeners() {
    // Form submit handlers
    teacherForm.addEventListener('submit', handleTeacherFormSubmit);
    assignmentForm.addEventListener('submit', handleAssignmentFormSubmit);
}

// Show add teacher modal
function showAddTeacher() {
    appState.setEditingId(null);
    teacherModalTitle.textContent = 'Thêm giảng viên';
    teacherForm.reset();
    teacherModal.style.display = 'block';
}

// Show edit teacher modal
function editTeacher(id) {
    const teacher = Teacher.getById(id);
    if (teacher) {
        appState.setEditingId(id);
        teacherModalTitle.textContent = 'Sửa giảng viên';
        
        // Fill form with teacher data
        document.getElementById('code').value = teacher.code;
        document.getElementById('name').value = teacher.name;
        document.getElementById('email').value = teacher.email || '';
        document.getElementById('phone').value = teacher.phone || '';

        teacherModal.style.display = 'block';
    }
}

// Show assignment modal
function showAssignment(teacherId) {
    const teacher = Teacher.getById(teacherId);
    if (teacher) {
        appState.setAssigningId(teacherId);
        document.getElementById('assignmentTeacherName').textContent = teacher.name;

        // Load available classes
        const availableClasses = Class.getAll().filter(cls => !cls.teacherId || cls.teacherId === teacherId);
        const classSelect = document.getElementById('classSelect');
        classSelect.innerHTML = '<option value="">Chọn lớp học</option>';
        availableClasses.forEach(cls => {
            const fullInfo = Class.getFullInfo(cls.id);
            classSelect.innerHTML += `
                <option value="${cls.id}">
                    ${fullInfo.code} - ${fullInfo.name} 
                    (${fullInfo.semester.name}, ${fullInfo.courseModule.name})
                </option>
            `;
        });

        // Load assigned classes
        loadAssignedClasses(teacherId);

        assignmentModal.style.display = 'block';
    }
}

// Load assigned classes list
function loadAssignedClasses(teacherId) {
    const assignedClasses = Teacher.getAssignedClasses(teacherId);
    assignedClassesList.innerHTML = '';

    if (assignedClasses.length === 0) {
        assignedClassesList.innerHTML = '<p>Chưa có lớp học được phân công</p>';
        return;
    }

    assignedClasses.forEach(cls => {
        const item = document.createElement('div');
        item.className = 'assigned-class-item';
        item.innerHTML = `
            <span>${cls.code} - ${cls.name}</span>
            <span>(${cls.semester.name}, ${cls.courseModule.name})</span>
            <button type="button" class="btn-remove" onclick="unassignClass('${cls.id}')">
                <i class="fas fa-times"></i>
            </button>
        `;
        assignedClassesList.appendChild(item);
    });
}

// Handle teacher form submit
function handleTeacherFormSubmit(e) {
    e.preventDefault();

    const teacherData = {
        code: document.getElementById('code').value.trim(),
        name: document.getElementById('name').value.trim(),
        email: document.getElementById('email').value.trim(),
        phone: document.getElementById('phone').value.trim()
    };

    // Add ID if editing
    if (appState.getEditingId()) {
        teacherData.id = appState.getEditingId();
    }

    // Validate form data
    const errors = Teacher.validate(teacherData);
    if (errors.length > 0) {
        alert(errors.join('\n'));
        return;
    }

    try {
        if (appState.getEditingId()) {
            // Update existing teacher
            Teacher.update(appState.getEditingId(), teacherData);
            showNotification('Cập nhật giảng viên thành công!');
        } else {
            // Add new teacher
            Teacher.add(teacherData);
            showNotification('Thêm giảng viên thành công!');
        }

        teacherModal.style.display = 'none';
        teacherForm.reset();
        appState.reset();
        loadTeachers();
    } catch (error) {
        alert('Có lỗi xảy ra: ' + error.message);
    }
}

// Handle assignment form submit
function handleAssignmentFormSubmit(e) {
    e.preventDefault();

    const classId = document.getElementById('classSelect').value;
    if (!classId) {
        alert('Vui lòng chọn lớp học');
        return;
    }

    try {
        Teacher.assignClass(appState.getAssigningId(), classId);
        showNotification('Phân công lớp học thành công!');
        loadAssignedClasses(appState.getAssigningId());
        loadTeachers(); // Refresh main table
        document.getElementById('classSelect').value = ''; // Reset select
    } catch (error) {
        alert('Có lỗi xảy ra: ' + error.message);
    }
}

// Unassign class from teacher
function unassignClass(classId) {
    if (confirm('Bạn có chắc chắn muốn hủy phân công lớp học này?')) {
        try {
            Teacher.unassignClass(appState.getAssigningId(), classId);
            showNotification('Đã hủy phân công lớp học!');
            loadAssignedClasses(appState.getAssigningId());
            loadTeachers(); // Refresh main table
        } catch (error) {
            alert('Có lỗi xảy ra: ' + error.message);
        }
    }
}

// Delete teacher
function deleteTeacher(id) {
    if (confirm('Bạn có chắc chắn muốn xóa giảng viên này?')) {
        try {
            Teacher.delete(id);
            showNotification('Xóa giảng viên thành công!');
            loadTeachers();
        } catch (error) {
            alert('Có lỗi xảy ra: ' + error.message);
        }
    }
}

// Initialize when document is loaded
document.addEventListener('DOMContentLoaded', initTeachers);
