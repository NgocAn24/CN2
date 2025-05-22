export class ClassManager {
    constructor() {
        this.contentArea = null;
        this.modal = null;
        this.form = null;
    }

    init(contentArea) {
        this.contentArea = contentArea;
        this.modal = document.getElementById('classModal');
        this.form = document.getElementById('classForm');

        this.setupContent();
        this.loadContent();
        this.setupEventListeners();
    }

    setupContent() {
        this.contentArea.innerHTML = `
            <div class="actions">
                <button class="btn-add" onclick="dashboard.modules.classes.showAddClass()">
                    <i class="fas fa-plus"></i> Thêm lớp
                </button>
            </div>
            <div class="table-container">
                <table id="classesTable">
                    <thead>
                        <tr>
                            <th>Mã lớp</th>
                            <th>Tên lớp</th>
                            <th>Kì học</th>
                            <th>Khóa học</th>
                            <th>Số học sinh</th>
                            <th>Điều chỉnh</th>
                        </tr>
                    </thead>
                    <tbody></tbody>
                </table>
            </div>
        `;
    }

    loadContent() {
        const classes = JSON.parse(localStorage.getItem('classes') || '[]');
        const semesters = JSON.parse(localStorage.getItem('semesters') || '[]');
        const courseModules = JSON.parse(localStorage.getItem('courseModules') || '[]');
        const tbody = this.contentArea.querySelector('#classesTable tbody');
        tbody.innerHTML = '';

        classes.forEach(cls => {
            const semester = semesters.find(s => s.id === cls.semesterId);
            const courseModule = courseModules.find(m => m.id === cls.courseModuleId);
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${cls.code}</td>
                <td>${cls.name}</td>
                <td>${semester ? semester.name : 'N/A'}</td>
                <td>${courseModule ? courseModule.name : 'N/A'}</td>
                <td>${cls.studentCount}</td>
                <td>
                    <button class="btn-edit" onclick="dashboard.modules.classes.editClass('${cls.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-delete" onclick="dashboard.modules.classes.deleteClass('${cls.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    setupEventListeners() {
        this.form.addEventListener('submit', (e) => this.handleFormSubmit(e));
    }

    loadSelects() {
        const semesters = JSON.parse(localStorage.getItem('semesters') || '[]');
        const courseModules = JSON.parse(localStorage.getItem('courseModules') || '[]');

        const semesterSelect = this.form.semesterId;
        const courseModuleSelect = this.form.courseModuleId;

        semesterSelect.innerHTML = '<option value="">Chọn học kì</option>';
        semesters.forEach(s => {
            semesterSelect.innerHTML += `<option value="${s.id}">${s.name} (${s.academicYear})</option>`;
        });

        courseModuleSelect.innerHTML = '<option value="">Chọn khóa học</option>';
        courseModules.forEach(m => {
            courseModuleSelect.innerHTML += `<option value="${m.id}">${m.code} - ${m.name}</option>`;
        });
    }

    showAddClass() {
        const title = document.getElementById('classModalTitle');
        title.textContent = 'Add Class';
        this.form.reset();
        this.loadSelects();
        delete this.modal.dataset.editId;
        this.modal.style.display = 'block';
    }

    editClass(id) {
        const classes = JSON.parse(localStorage.getItem('classes') || '[]');
        const cls = classes.find(c => c.id === id);

        if (cls) {
            const title = document.getElementById('classModalTitle');
            title.textContent = 'Edit Class';

            this.loadSelects();
            this.form.semesterId.value = cls.semesterId;
            this.form.courseModuleId.value = cls.courseModuleId;
            this.form.code.value = cls.code;
            this.form.name.value = cls.name;
            this.form.studentCount.value = cls.studentCount;

            this.modal.dataset.editId = id;
            this.modal.style.display = 'block';
        }
    }

    deleteClass(id) {
        if (confirm('Bạn có muốn xóa lớp học này?')) {
            const classes = JSON.parse(localStorage.getItem('classes') || '[]');
            const updatedClasses = classes.filter(c => c.id !== id);
            localStorage.setItem('classes', JSON.stringify(updatedClasses));
            this.loadContent();
            window.showNotification('Xóa lớp học thành công', 'success');
        }
    }

    handleFormSubmit(e) {
        e.preventDefault();

        const formData = {
            semesterId: this.form.semesterId.value,
            courseModuleId: this.form.courseModuleId.value,
            code: this.form.code.value.trim(),
            name: this.form.name.value.trim(),
            studentCount: parseInt(this.form.studentCount.value)
        };

        if (!this.validateFormData(formData)) {
            return;
        }

        const classes = JSON.parse(localStorage.getItem('classes') || '[]');
        const editId = this.modal.dataset.editId;

        if (editId) {
            const index = classes.findIndex(c => c.id === editId);
            if (index !== -1) {
                classes[index] = {...classes[index], ...formData };
                localStorage.setItem('classes', JSON.stringify(classes));
                window.showNotification('Đã cập thành công');
            }
        } else {
            const newClass = {
                id: Date.now().toString(),
                ...formData
            };
            classes.push(newClass);
            localStorage.setItem('classes', JSON.stringify(classes));
            window.showNotification('Thêm lớp học thành công');
        }

        this.modal.style.display = 'none';
        this.loadContent();
    }

    validateFormData(data) {
        if (!data.semesterId || !data.courseModuleId || !data.code || !data.name || isNaN(data.studentCount)) {
            window.showNotification('Tất cả trường đều bắt buộc và số sinh viên phải là số', 'error');
            return false;
        }

        if (data.studentCount < 1) {
            window.showNotification('Học sinh ít nhất là 1', 'error');
            return false;
        }

        const classes = JSON.parse(localStorage.getItem('classes') || '[]');
        const editId = this.modal.dataset.editId;
        const isDuplicate = classes.some(c =>
            c.code === data.code && (!editId || c.id !== editId)
        );

        if (isDuplicate) {
            window.showNotification('Mộtột lớp học đã tồn tại', 'error');
            return false;
        }

        return true;
    }
}