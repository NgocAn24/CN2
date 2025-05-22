export class CourseModuleManager {
    constructor() {
        this.contentArea = null;
        this.modal = null;
        this.form = null;
    }

    init(contentArea) {
        this.contentArea = contentArea;
        this.modal = document.getElementById('courseModuleModal');
        this.form = document.getElementById('courseModuleForm');

        this.setupContent();
        this.loadContent();
        this.setupEventListeners();
    }

    setupContent() {
        // Set up the initial content structure
        this.contentArea.innerHTML = `
            <div class="actions">
                <button class="btn-add" onclick="dashboard.modules['course-modules'].showAddModule()">
                    <i class="fas fa-plus"></i> Thêm học phần
                </button>
            </div>
            <div class="table-container">
                <table id="courseModulesTable">
                    <thead>
                        <tr>
                            <th>Mã số</th>
                            <th>Tên học phần </th>
                            <th>Số tín chỉchỉ</th>
                            <th>Hệ số tín chỉ</th>
                            <th>Số tiết</th>
                            <th>Điều chỉnh</th>
                        </tr>
                    </thead>
                    <tbody></tbody>
                </table>
            </div>
        `;
    }

    loadContent() {
        const modules = JSON.parse(localStorage.getItem('courseModules') || '[]');
        const tbody = this.contentArea.querySelector('#courseModulesTable tbody');
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
                    <button class="btn-edit" onclick="dashboard.modules['course-modules'].editModule('${module.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-delete" onclick="dashboard.modules['course-modules'].deleteModule('${module.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    setupEventListeners() {
        // Handle form submission
        this.form.addEventListener('submit', (e) => this.handleFormSubmit(e));
    }

    showAddModule() {
        const title = document.getElementById('courseModuleModalTitle');
        title.textContent = 'Add Course Module';
        this.form.reset();
        delete this.modal.dataset.editId;
        this.modal.style.display = 'block';
    }

    editModule(id) {
        const modules = JSON.parse(localStorage.getItem('courseModules') || '[]');
        const module = modules.find(m => m.id === id);

        if (module) {
            const title = document.getElementById('courseModuleModalTitle');
            title.textContent = 'Edit Course Module';

            // Fill form with module data
            this.form.code.value = module.code;
            this.form.name.value = module.name;
            this.form.credits.value = module.credits;
            this.form.coefficient.value = module.coefficient;
            this.form.periods.value = module.periods;

            // Store the ID for updating
            this.modal.dataset.editId = id;
            this.modal.style.display = 'block';
        }
    }

    deleteModule(id) {
        if (confirm('Bạn có chắc chắn muốn xóa mô-đun này?')) {
            const modules = JSON.parse(localStorage.getItem('courseModules') || '[]');
            const updatedModules = modules.filter(m => m.id !== id);
            localStorage.setItem('courseModules', JSON.stringify(updatedModules));
            this.loadContent();
            window.showNotification('Mô-dun đã được xóa', 'success');
        }
    }

    handleFormSubmit(e) {
        e.preventDefault();

        const formData = {
            code: this.form.code.value.trim(),
            name: this.form.name.value.trim(),
            credits: parseInt(this.form.credits.value),
            coefficient: parseFloat(this.form.coefficient.value),
            periods: parseInt(this.form.periods.value)
        };

        // Validate form data
        if (!this.validateFormData(formData)) {
            return;
        }

        const modules = JSON.parse(localStorage.getItem('courseModules') || '[]');
        const editId = this.modal.dataset.editId;

        if (editId) {
            // Update existing module
            const index = modules.findIndex(m => m.id === editId);
            if (index !== -1) {
                modules[index] = {...modules[index], ...formData };
                localStorage.setItem('courseModules', JSON.stringify(modules));
                window.showNotification('Mô-dun đã được cập nhật', 'success');
            }
        } else {
            // Add new module
            const newModule = {
                id: Date.now().toString(),
                ...formData
            };
            modules.push(newModule);
            localStorage.setItem('courseModules', JSON.stringify(modules));
            window.showNotification('Mô-dun mới đã được thêm', 'success');
        }

        this.modal.style.display = 'none';
        this.loadContent();
    }

    validateFormData(data) {
        // Check for duplicate code
        const modules = JSON.parse(localStorage.getItem('courseModules') || '[]');
        const editId = this.modal.dataset.editId;
        const isDuplicate = modules.some(m =>
            m.code === data.code && (!editId || m.id !== editId)
        );

        // if (isDuplicate) {
        //     window.showNotification('Một mô-dun khác đã có mã này', 'error');
        //     return false;
        // }

        // Validate numeric fields
        if (data.credits < 1) {
            window.showNotification('Tín chỉ phải là số nguyên dương', 'error');
            return false;
        }

        if (data.coefficient < 0) {
            window.showNotification('Hệ số phải là số nguyên không âm', 'error');
            return false;
        }

        if (data.periods < 1) {
            window.showNotification(' Số kỳ học phải là số nguyên dương', 'error');
            return false;
        }

        return true;
    }
}