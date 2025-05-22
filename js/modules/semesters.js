export class SemesterManager {
    constructor() {
        this.contentArea = null;
        this.modal = null;
        this.form = null;
        this._handleSubmit = null; // Store the bound event handler
    }

    init(contentArea) {
        this.contentArea = contentArea;
        this.modal = document.getElementById('semesterModal');
        this.form = document.getElementById('semesterForm');

        // Remove old event listeners by cloning the form
        const oldForm = this.form;
        this.form = oldForm.cloneNode(true);
        oldForm.parentNode.replaceChild(this.form, oldForm);

        this.setupContent();
        this.loadContent();
        this.setupEventListeners();
    }

    setupContent() {
        this.contentArea.innerHTML = `
            <div class="actions">
                <button class="btn-add" onclick="dashboard.modules.semesters.showAddSemester()">
                    <i class="fas fa-plus"></i> Thêm học kỳ
                </button>
            </div>
            <div class="table-container">
                <table id="semestersTable">
                    <thead>
                        <tr>
                            <th>Tên học kì</th>
                            <th>Năm học</th>
                            <th>Ngày bắt đầu</th>
                            <th>Ngày kết thúc</th>
                            <th>Điều chỉnh</th>
                        </tr>
                    </thead>
                    <tbody></tbody>
                </table>
            </div>
        `;
    }

    loadContent() {
        const semesters = JSON.parse(localStorage.getItem('semesters') || '[]');
        const tbody = this.contentArea.querySelector('#semestersTable tbody');
        tbody.innerHTML = '';

        semesters.forEach(semester => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${semester.name}</td>
                <td>${semester.academicYear}</td>
                <td>${semester.startDate}</td>
                <td>${semester.endDate}</td>
                <td>
                    <button class="btn-edit" onclick="dashboard.modules.semesters.editSemester('${semester.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-delete" onclick="dashboard.modules.semesters.deleteSemester('${semester.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    setupEventListeners() {
        // Remove old handler if it exists
        if (this._handleSubmit) {
            this.form.removeEventListener('submit', this._handleSubmit);
        }

        // Create new handler and store it
        this._handleSubmit = (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.handleFormSubmit(e);
        };

        // Add new handler
        this.form.addEventListener('submit', this._handleSubmit);
    }

    showAddSemester() {
        const title = document.getElementById('semesterModalTitle');
        title.textContent = 'Add Semester';
        this.form.reset();
        delete this.modal.dataset.editId;
        this.modal.style.display = 'block';
    }

    editSemester(id) {
        const semesters = JSON.parse(localStorage.getItem('semesters') || '[]');
        const semester = semesters.find(s => s.id === id);

        if (semester) {
            const title = document.getElementById('semesterModalTitle');
            title.textContent = 'Edit Semester';

            this.form.name.value = semester.name;
            this.form.academicYear.value = semester.academicYear;
            this.form.startDate.value = semester.startDate;
            this.form.endDate.value = semester.endDate;

            this.modal.dataset.editId = id;
            this.modal.style.display = 'block';
        }
    }

    deleteSemester(id) {
        if (confirm('Bạn có chắc chắn muốn xóa học kỳ này?')) {
            const semesters = JSON.parse(localStorage.getItem('semesters') || '[]');
            const updatedSemesters = semesters.filter(s => s.id !== id);
            localStorage.setItem('semesters', JSON.stringify(updatedSemesters));
            this.loadContent();
            window.showNotification(' Học kỳ đã được xóa', 'success');
        }
    }

    handleFormSubmit(e) {
        e.preventDefault();

        const formData = {
            name: this.form.name.value.trim(),
            academicYear: this.form.academicYear.value.trim(),
            startDate: this.form.startDate.value,
            endDate: this.form.endDate.value
        };

        if (!this.validateFormData(formData)) {
            return;
        }

        const semesters = JSON.parse(localStorage.getItem('semesters') || '[]');
        const editId = this.modal.dataset.editId;

        if (editId) {
            const index = semesters.findIndex(s => s.id === editId);
            if (index !== -1) {
                semesters[index] = {...semesters[index], ...formData };
                localStorage.setItem('semesters', JSON.stringify(semesters));
                window.showNotification(' Học kỳ đã được cập nhật', 'success');
            }
        } else {
            const newSemester = {
                id: Date.now().toString(),
                ...formData
            };
            semesters.push(newSemester);
            localStorage.setItem('semesters', JSON.stringify(semesters));
            window.showNotification(' Học kỳ mới đã được thêm', 'success');
        }

        this.modal.style.display = 'none';
        this.loadContent();
    }

    validateFormData(data) {
        if (!data.name || !data.academicYear || !data.startDate || !data.endDate) {
            window.showNotification(' Vui lòng nhập đầy đủ thông tin', 'error');
            return false;
        }

        const startDate = new Date(data.startDate);
        const endDate = new Date(data.endDate);

        if (endDate <= startDate) {
            window.showNotification(' Ngày kết thúc phải lớn hơn ngày bắt đầu', 'error');
            return false;
        }

        const academicYearPattern = /^\d{4}-\d{4}$/;
        if (!academicYearPattern.test(data.academicYear)) {
            window.showNotification(' Năm học phải có định dạng YYYY-YYYY', 'error');
            return false;
        }

        // Check for duplicate semester name in the same academic year
        const semesters = JSON.parse(localStorage.getItem('semesters') || '[]');
        const editId = this.modal.dataset.editId;
        const isDuplicate = semesters.some(s =>
            s.name === data.name &&
            s.academicYear === data.academicYear &&
            (!editId || s.id !== editId)
        );

        if (isDuplicate) {
            window.showNotification(' Học kỳ có tên trùng nhau trong cùng một năm học', 'error');
            return false;
        }

        return true;
    }
}