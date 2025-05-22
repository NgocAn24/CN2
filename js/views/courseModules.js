// DOM Elements
const courseModuleModal = document.getElementById('courseModuleModal');
const courseModuleForm = document.getElementById('courseModuleForm');
const courseModulesTable = document.getElementById('courseModulesTable');
const courseModuleModalTitle = document.getElementById('courseModuleModalTitle');
const closeModalBtn = document.querySelector('#courseModuleModal .close');

// Initialize course modules view
function initCourseModules() {
    loadCourseModules();
    setupEventListeners();
}

// Load course modules into table
function loadCourseModules() {
    const modules = CourseModule.getAll();
    const tbody = courseModulesTable.querySelector('tbody');
    tbody.innerHTML = '';

    modules.forEach(module => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${module.code}</td>
            <td>${module.name}</td>
            <td>${module.credits}</td>
            <td>${module.coefficient}</td>
            <td>${module.periods}</td>
            <td>
                <button class="btn-edit" onclick="editCourseModule('${module.id}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-delete" onclick="deleteCourseModule('${module.id}')">
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
    courseModuleForm.addEventListener('submit', handleFormSubmit);

    // Close modal when clicking the close button
    closeModalBtn.addEventListener('click', closeModal);

    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === courseModuleModal) {
            closeModal();
        }
    });
}

// Show add course module modal
function showAddCourseModule() {
    appState.setEditingId(null);
    courseModuleModalTitle.textContent = 'Thêm học phần';
    courseModuleForm.reset();
    courseModuleModal.style.display = 'block';
}

// Show edit course module modal
function editCourseModule(id) {
    const module = CourseModule.getById(id);
    if (module) {
        appState.setEditingId(id);
        courseModuleModalTitle.textContent = 'Sửa học phần';

        // Fill form with module data
        document.getElementById('code').value = module.code;
        document.getElementById('name').value = module.name;
        document.getElementById('credits').value = module.credits;
        document.getElementById('coefficient').value = module.coefficient;
        document.getElementById('periods').value = module.periods;

        courseModuleModal.style.display = 'block';
    }
}

// Handle form submit
function handleFormSubmit(e) {
    e.preventDefault();

    const form = e.target;
    const moduleData = {
        code: form.querySelector('#code').value.trim(),
        name: form.querySelector('#name').value.trim(),
        credits: parseInt(form.querySelector('#credits').value),
        coefficient: parseFloat(form.querySelector('#coefficient').value),
        periods: parseInt(form.querySelector('#periods').value)
    };

    // Validate form data
    const errors = CourseModule.validate(moduleData);
    if (errors.length > 0) {
        alert(errors.join('\n'));
        return;
    }

    try {
        console.log('Form data:', moduleData);

        if (appState.getEditingId()) {
            // Update existing module
            const result = CourseModule.update(appState.getEditingId(), moduleData);
            console.log('Update result:', result);
            showNotification('Cập nhật học phần thành công!');
        } else {
            // Add new module
            const result = CourseModule.add(moduleData);
            console.log('Add result:', result);
            console.log('Current storage:', localStorage.getItem(STORAGE_KEYS.COURSE_MODULES));
            showNotification('Thêm học phần thành công!');
        }

        closeModal();
        loadCourseModules(); // Remove timeout to ensure immediate update
    } catch (error) {
        console.error('Error:', error);
        alert('Có lỗi xảy ra: ' + error.message);
    }
}

// Delete course module
function deleteCourseModule(id) {
    if (confirm('Bạn có chắc chắn muốn xóa học phần này?')) {
        try {
            CourseModule.delete(id);
            showNotification('Xóa học phần thành công!');
            loadCourseModules();
        } catch (error) {
            alert('Có lỗi xảy ra: ' + error.message);
        }
    }
}

// Close modal
function closeModal() {
    courseModuleModal.style.display = 'none';
    courseModuleForm.reset();
    appState.reset();
}

// Show notification
function showNotification(message) {
    alert(message); // For now, using simple alert. Can be enhanced with a better notification system
}

// Initialize when document is loaded
document.addEventListener('DOMContentLoaded', initCourseModules);