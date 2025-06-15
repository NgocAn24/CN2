import { DepartmentManager } from './departments.js';
import { QualificationManager } from './qualifications.js';

export class TeacherManager {
    constructor() {
        this.contentArea = null;
        this.modal = null;
        this.form = null;
        this.assignmentModal = null;
        this.assignmentForm = null;
        this.departmentManager = new DepartmentManager();
        this.qualificationManager = new QualificationManager();
    }

    init(contentArea) {
        this.contentArea = contentArea;
        this.modal = document.getElementById('teacherModal');
        this.form = document.getElementById('teacherForm');
        this.assignmentModal = document.getElementById('assignmentModal');
        this.assignmentForm = document.getElementById('assignmentForm');
        this.departmentManager.init();
        this.qualificationManager.init();

        this.setupContent();
        this.loadContent();
        this.setupEventListeners();
    }

    setupContent() {
        this.contentArea.innerHTML = `
            <div class="actions">
                <button class="btn-add" onclick="dashboard.modules.teachers.showAddTeacher()">
                    <i class="fas fa-plus"></i> Thêm giáo viên
                </button>
            </div>
            <div class="table-container">
                <table id="teachersTable">
                    <thead>
                        <tr>
                            <th>Mã giảng viên</th>
                            <th>Họ và tên</th>
                            <th>Ngày sinh</th>
                            <th>Khoa</th>
                            <th>Bằng cấp</th>
                            <th>Email</th>
                            <th>Số điện thoại</th>
                            <th>Các lớp đã phân công</th>
                            <th>Điều chỉnh</th>
                        </tr>
                    </thead>
                    <tbody></tbody>
                </table>
            </div>
        `;
    }

    loadContent() {
        const teachers = JSON.parse(localStorage.getItem('teachers') || '[]');
        const tbody = this.contentArea.querySelector('#teachersTable tbody');
        tbody.innerHTML = '';

        teachers.forEach(teacher => {
            const assignedClasses = this.getAssignedClasses(teacher.id);
            const department = this.departmentManager.getDepartmentById(teacher.departmentId);
            const qualification = this.qualificationManager.getQualificationById(teacher.qualificationId);
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${teacher.code}</td>
                <td>${teacher.name}</td>
                <td>${teacher.birthDate ? new Date(teacher.birthDate).toLocaleDateString('vi-VN') : ''}</td>
                <td>${department ? department.name : 'Chưa phân khoa'}</td>
                <td>${qualification ? qualification.name : 'Chưa có'}</td>
                <td>${teacher.email || ''}</td>
                <td>${teacher.phone || ''}</td>
                <td>${assignedClasses.length}</td>
                <td>
                    <button class="btn-assign" onclick="dashboard.modules.teachers.showAssignment('${teacher.id}')">
                        <i class="fas fa-tasks"></i>
                    </button>
                    <button class="btn-edit" onclick="dashboard.modules.teachers.editTeacher('${teacher.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-delete" onclick="dashboard.modules.teachers.deleteTeacher('${teacher.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    setupEventListeners() {
        this.form.addEventListener('submit', (e) => this.handleFormSubmit(e));
        this.assignmentForm.addEventListener('submit', (e) => this.handleAssignmentFormSubmit(e));
    }

    showAddTeacher() {
        const title = document.getElementById('teacherModalTitle');
        title.textContent = 'Add Teacher';
        this.form.reset();
        this.populateDepartmentSelect();
        this.populateQualificationSelect();
        delete this.modal.dataset.editId;
        this.modal.style.display = 'block';
    }

    editTeacher(id) {
        const teachers = JSON.parse(localStorage.getItem('teachers') || '[]');
        const teacher = teachers.find(t => t.id === id);

        if (teacher) {
            const title = document.getElementById('teacherModalTitle');
            title.textContent = 'Edit Teacher';

            this.form.code.value = teacher.code;
            this.form.name.value = teacher.name;
            this.form.birthDate.value = teacher.birthDate || '';
            this.populateDepartmentSelect();
            this.populateQualificationSelect();
            this.form.departmentId.value = teacher.departmentId || '';
            this.form.qualificationId.value = teacher.qualificationId || '';
            this.form.email.value = teacher.email || '';
            this.form.phone.value = teacher.phone || '';

            this.modal.dataset.editId = id;
            this.modal.style.display = 'block';
        }
    }

    deleteTeacher(id) {
        if (confirm('Bạn có chắc chắn muốn xóa giáo viên này?')) {
            const teachers = JSON.parse(localStorage.getItem('teachers') || '[]');
            const updatedTeachers = teachers.filter(t => t.id !== id);
            localStorage.setItem('teachers', JSON.stringify(updatedTeachers));

            // Remove teacher assignments from classes
            const classes = JSON.parse(localStorage.getItem('classes') || '[]');
            const updatedClasses = classes.map(c => {
                if (c.teacherId === id) {
                    delete c.teacherId;
                }
                return c;
            });
            localStorage.setItem('classes', JSON.stringify(updatedClasses));

            this.loadContent();
            window.showNotification(' Teacher deleted successfully');
        }
    }

    showAssignment(teacherId) {
        const teachers = JSON.parse(localStorage.getItem('teachers') || '[]');
        const teacher = teachers.find(t => t.id === teacherId);

        if (teacher) {
            document.getElementById('assignmentTeacherName').textContent = teacher.name;
            this.assignmentModal.dataset.teacherId = teacherId;

            // Load available classes
            const classes = JSON.parse(localStorage.getItem('classes') || '[]');
            const availableClasses = classes.filter(c => !c.teacherId || c.teacherId === teacherId);

            const classSelect = document.getElementById('classSelect');
            classSelect.innerHTML = '<option value="">Select Class</option>';
            availableClasses.forEach(cls => {
                classSelect.innerHTML += `
                    <option value="${cls.id}">${cls.code} - ${cls.name}</option>
                `;
            });

            this.loadAssignedClasses(teacherId);
            this.assignmentModal.style.display = 'block';
        }
    }

    loadAssignedClasses(teacherId) {
        const assignedClasses = this.getAssignedClasses(teacherId);
        const assignedClassesList = document.getElementById('assignedClassesList');
        assignedClassesList.innerHTML = '';

        if (assignedClasses.length === 0) {
            assignedClassesList.innerHTML = '<p>Không có lớp phân công</p>';
            return;
        }

        assignedClasses.forEach(cls => {
            const item = document.createElement('div');
            item.className = 'assigned-class-item';
            item.innerHTML = `
                <span>${cls.code} - ${cls.name}</span>
                <button type="button" class="btn-remove" onclick="dashboard.modules.teachers.unassignClass('${cls.id}')">
                    <i class="fas fa-times"></i>
                </button>
            `;
            assignedClassesList.appendChild(item);
        });
    }

    getAssignedClasses(teacherId) {
        const classes = JSON.parse(localStorage.getItem('classes') || '[]');
        return classes.filter(c => c.teacherId === teacherId);
    }

    handleFormSubmit(e) {
        e.preventDefault();

        const formData = {
            code: this.form.code.value.trim(),
            name: this.form.name.value.trim(),
            birthDate: this.form.birthDate.value,
            departmentId: this.form.departmentId.value,
            qualificationId: this.form.qualificationId.value,
            email: this.form.email.value.trim(),
            phone: this.form.phone.value.trim()
        };

        if (!this.validateFormData(formData)) {
            return;
        }

        const teachers = JSON.parse(localStorage.getItem('teachers') || '[]');
        const editId = this.modal.dataset.editId;

        if (editId) {
            const index = teachers.findIndex(t => t.id === editId);
            if (index !== -1) {
                teachers[index] = {...teachers[index], ...formData };
                localStorage.setItem('teachers', JSON.stringify(teachers));
                window.showNotification(' Cập nhật thành công', 'success');
            }
        } else {
            const newTeacher = {
                id: Date.now().toString(),
                ...formData
            };
            teachers.push(newTeacher);
            localStorage.setItem('teachers', JSON.stringify(teachers));
            window.showNotification(' Thêm mới thành công', 'success');
        }

        this.modal.style.display = 'none';
        this.loadContent();
    }

    handleAssignmentFormSubmit(e) {
        e.preventDefault();

        const teacherId = this.assignmentModal.dataset.teacherId;
        const classId = document.getElementById('classSelect').value;

        // if (!classId) {
        //     window.showNotification(' Vui lòng chọn lớp', 'error');
        //     return;
        // }

        const classes = JSON.parse(localStorage.getItem('classes') || '[]');
        const classIndex = classes.findIndex(c => c.id === classId);

        if (classIndex !== -1) {
            classes[classIndex].teacherId = teacherId;
            localStorage.setItem('classes', JSON.stringify(classes));
            this.loadAssignedClasses(teacherId);
            this.loadContent();
            document.getElementById('classSelect').value = '';
            window.showNotification(' Thêm mới thành công', 'success');
        }
    }

    unassignClass(classId) {
        if (confirm(' Bạn có muốn xóa lớp này khỏi danh sách lớp của giáo viên này?')) {
            const teacherId = this.assignmentModal.dataset.teacherId;
            const classes = JSON.parse(localStorage.getItem('classes') || '[]');
            const classIndex = classes.findIndex(c => c.id === classId);

            if (classIndex !== -1) {
                delete classes[classIndex].teacherId;
                localStorage.setItem('classes', JSON.stringify(classes));
                this.loadAssignedClasses(teacherId);
                this.loadContent();
                window.showNotification(' Xóa lớp thành công', 'success');
            }
        }
    }

    validateFormData(data) {
        if (!data.code || !data.name) {
            window.showNotification(' Vui lòng nhập mã và tên lớp', 'error');
            return false;
        }

        const teachers = JSON.parse(localStorage.getItem('teachers') || '[]');
        const editId = this.modal.dataset.editId;
        const isDuplicate = teachers.some(t =>
            t.code === data.code && (!editId || t.id !== editId)
        );

        if (isDuplicate) {
            window.showNotification(' Mã lớp đã tồn tại', 'error');
            return false;
        }

        if (data.email && !this.validateEmail(data.email)) {
            window.showNotification(' Email không hợp lệ', 'error');
            return false;
        }

        if (data.phone && !this.validatePhone(data.phone)) {
            window.showNotification(' Số điện thoại không hợp lệ', 'error');
            return false;
        }

        return true;
    }

    validateEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    validatePhone(phone) {
        return /^\d{10,}$/.test(phone.replace(/[- ]/g, ''));
    }

    populateDepartmentSelect() {
        const departments = this.departmentManager.getAllDepartments();
        const departmentSelect = document.getElementById('departmentId');

        // Clear existing options except the first one
        departmentSelect.innerHTML = '<option value="">Chọn khoa</option>';

        departments.forEach(dept => {
            const option = document.createElement('option');
            option.value = dept.id;
            option.textContent = dept.name;
            departmentSelect.appendChild(option);
        });
    }

    populateQualificationSelect() {
        const qualifications = this.qualificationManager.getAllQualifications();
        const qualificationSelect = document.getElementById('qualificationId');

        // Clear existing options except the first one
        qualificationSelect.innerHTML = '<option value="">Chọn bằng cấp</option>';

        qualifications.forEach(qual => {
            const option = document.createElement('option');
            option.value = qual.id;
            option.textContent = qual.name;
            qualificationSelect.appendChild(option);
        });
    }
}