import { STORAGE_KEYS, getAll, add, update, remove } from '../utils/storage.js';

export class TeachingSalaryManager {
    constructor() {
        this.contentArea = null;
        this.currentFunction = 'rate-per-lesson';
    }

    init(contentArea) {
        this.contentArea = contentArea;
        this.setupEventListeners();
        this.loadFunction(this.currentFunction);
    }

    setupEventListeners() {
        // Function navigation
        const functionLinks = this.contentArea.querySelectorAll('.func-link');
        functionLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                functionLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');
                this.currentFunction = link.dataset.func;
                this.loadFunction(this.currentFunction);
            });
        });
    }

    loadFunction(func) {
        const interfaceArea = this.contentArea.querySelector('.function-interface');
        switch (func) {
            case 'rate-per-lesson':
                this.loadRatePerLessonInterface(interfaceArea);
                break;
            case 'teacher-coefficients':
                this.loadTeacherCoefficientsInterface(interfaceArea);
                break;
            case 'class-coefficients':
                this.loadClassCoefficientsInterface(interfaceArea);
                break;
            case 'calculate-salary':
                this.loadCalculateSalaryInterface(interfaceArea);
                break;
            case 'department-report':
                this.loadDepartmentReportInterface(interfaceArea);
                break;
            case 'school-report':
                this.loadSchoolReportInterface(interfaceArea);
                break;
        }
    }

    loadDepartmentReportInterface(container) {
            const departments = JSON.parse(localStorage.getItem('departments') || '[]');
            const semesters = JSON.parse(localStorage.getItem('semesters') || '[]');

            container.innerHTML = `
            <div class="department-report">
                <h3>Báo cáo tiền dạy theo khoa</h3>
                <form id="departmentReportForm" class="report-form">
                    <div class="form-group">
                        <label for="departmentSelect">Khoa:</label>
                        <select id="departmentSelect" name="departmentId" required>
                            <option value="">Chọn khoa</option>
                            ${departments.map(d => `
                                <option value="${d.id}">${d.name}</option>
                            `).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="semesterSelect">Kì học:</label>
                        <select id="semesterSelect" name="semesterId" required>
                            <option value="">Chọn kì học</option>
                            ${semesters.map(s => `
                                <option value="${s.id}">${s.name} ${s.academicYear}</option>
                            `).join('')}
                        </select>
                    </div>
                    <div class="form-actions">
                        <button type="submit" class="btn-calculate">Tạo báo cáo</button>
                    </div>
                </form>
                <div id="departmentReportResult" class="report-result"></div>
            </div>
        `;

        const form = container.querySelector('#departmentReportForm');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.generateDepartmentReport(
                form.departmentId.value,
                form.semesterId.value
            );
        });
    }

    loadSchoolReportInterface(container) {
        const semesters = JSON.parse(localStorage.getItem('semesters') || '[]');
        
        container.innerHTML = `
            <div class="school-report">
                <h3>Báo cáo tiền dạy toàn trường</h3>
                <form id="schoolReportForm" class="report-form">
                    <div class="form-group">
                        <label for="semesterSelect">Kì học:</label>
                        <select id="semesterSelect" name="semesterId" required>
                            <option value="">Chọn kì học</option>
                            ${semesters.map(s => `
                                <option value="${s.id}">${s.name} ${s.academicYear}</option>
                            `).join('')}
                        </select>
                    </div>
                    <div class="form-actions">
                        <button type="submit" class="btn-calculate">Tạo báo cáo</button>
                    </div>
                </form>
                <div id="schoolReportResult" class="report-result"></div>
            </div>
        `;

        const form = container.querySelector('#schoolReportForm');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.generateSchoolReport(form.semesterId.value);
        });
    }

    generateDepartmentReport(departmentId, semesterId) {
        const teachers = JSON.parse(localStorage.getItem('teachers') || '[]')
            .filter(t => t.departmentId === departmentId);
        const departments = JSON.parse(localStorage.getItem('departments') || '[]');
        const department = departments.find(d => d.id === departmentId);
        const semester = JSON.parse(localStorage.getItem('semesters') || '[]')
            .find(s => s.id === semesterId);

        let totalDepartmentSalary = 0;
        const teacherDetails = [];

        teachers.forEach(teacher => {
            const classes = JSON.parse(localStorage.getItem('classes') || '[]')
                .filter(c => c.teacherId === teacher.id && c.semesterId === semesterId);
            
            let teacherTotalSalary = 0;
            const classDetails = [];

            classes.forEach(cls => {
                const courseModule = JSON.parse(localStorage.getItem('courseModules') || '[]')
                    .find(cm => cm.id === cls.courseModuleId);
                
                if (courseModule) {
                    const baseSalary = courseModule.periods * parseFloat(localStorage.getItem('ratePerLesson') || '0');
                    const classCoefficient = this.getClassCoefficient(cls);
                    const teacherCoefficient = this.getTeacherCoefficient(teacher);
                    const classSalary = baseSalary * classCoefficient * teacherCoefficient;
                    
                    teacherTotalSalary += classSalary;
                    classDetails.push({
                        className: cls.name,
                        periods: courseModule.periods,
                        salary: classSalary
                    });
                }
            });

            totalDepartmentSalary += teacherTotalSalary;
            teacherDetails.push({
                teacher,
                totalSalary: teacherTotalSalary,
                classes: classDetails
            });
        });

        const resultContainer = document.getElementById('departmentReportResult');
        resultContainer.innerHTML = `
            <h4>Báo cáo tiền dạy ${department.name}</h4>
            <h5>Kì học: ${semester.name} ${semester.academicYear}</h5>
            <div class="report-details">
                <table>
                    <thead>
                        <tr>
                            <th>Mã GV</th>
                            <th>Tên giảng viên</th>
                            <th>Số lớp</th>
                            <th>Tổng tiền</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${teacherDetails.map(d => `
                            <tr>
                                <td>${d.teacher.code}</td>
                                <td>${d.teacher.name}</td>
                                <td>${d.classes.length}</td>
                                <td>${d.totalSalary.toLocaleString()} VNĐ</td>
                            </tr>
                        `).join('')}
                        <tr class="total-row">
                            <td colspan="3"><strong>Tổng cộng khoa:</strong></td>
                            <td><strong>${totalDepartmentSalary.toLocaleString()} VNĐ</strong></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        `;
    }

    generateSchoolReport(semesterId) {
        const departments = JSON.parse(localStorage.getItem('departments') || '[]');
        const semester = JSON.parse(localStorage.getItem('semesters') || '[]')
            .find(s => s.id === semesterId);
        
        let totalSchoolSalary = 0;
        const departmentDetails = [];

        departments.forEach(department => {
            const teachers = JSON.parse(localStorage.getItem('teachers') || '[]')
                .filter(t => t.departmentId === department.id);
            
            let departmentTotalSalary = 0;
            let departmentTotalClasses = 0;

            teachers.forEach(teacher => {
                const classes = JSON.parse(localStorage.getItem('classes') || '[]')
                    .filter(c => c.teacherId === teacher.id && c.semesterId === semesterId);
                
                departmentTotalClasses += classes.length;

                classes.forEach(cls => {
                    const courseModule = JSON.parse(localStorage.getItem('courseModules') || '[]')
                        .find(cm => cm.id === cls.courseModuleId);
                    
                    if (courseModule) {
                        const baseSalary = courseModule.periods * parseFloat(localStorage.getItem('ratePerLesson') || '0');
                        const classCoefficient = this.getClassCoefficient(cls);
                        const teacherCoefficient = this.getTeacherCoefficient(teacher);
                        const classSalary = baseSalary * classCoefficient * teacherCoefficient;
                        
                        departmentTotalSalary += classSalary;
                    }
                });
            });

            totalSchoolSalary += departmentTotalSalary;
            departmentDetails.push({
                department,
                totalSalary: departmentTotalSalary,
                teacherCount: teachers.length,
                classCount: departmentTotalClasses
            });
        });

        const resultContainer = document.getElementById('schoolReportResult');
        resultContainer.innerHTML = `
            <h4>Báo cáo tiền dạy toàn trường</h4>
            <h5>Kì học: ${semester.name} ${semester.academicYear}</h5>
            <div class="report-details">
                <table>
                    <thead>
                        <tr>
                            <th>Khoa</th>
                            <th>Số giảng viên</th>
                            <th>Số lớp</th>
                            <th>Tổng tiền</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${departmentDetails.map(d => `
                            <tr>
                                <td>${d.department.name}</td>
                                <td>${d.teacherCount}</td>
                                <td>${d.classCount}</td>
                                <td>${d.totalSalary.toLocaleString()} VNĐ</td>
                            </tr>
                        `).join('')}
                        <tr class="total-row">
                            <td colspan="3"><strong>Tổng cộng toàn trường:</strong></td>
                            <td><strong>${totalSchoolSalary.toLocaleString()} VNĐ</strong></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        `;
    }

    loadRatePerLessonInterface(container) {
        const rate = localStorage.getItem(STORAGE_KEYS.RATE_PER_LESSON) || '0';
        container.innerHTML = `
            <div class="rate-per-lesson">
                <h3>Định mức tiền theo tiết</h3>
                <form id="rateForm" class="rate-form">
                    <div class="form-group">
                        <label for="ratePerLesson">Số tiền cho một tiết chuẩn (VNĐ):</label>
                        <input type="number" id="ratePerLesson" name="ratePerLesson" 
                               value="${rate}" min="0" step="1000" required>
                    </div>
                    <div class="form-actions">
                        <button type="submit" class="btn-save">Lưu</button>
                    </div>
                </form>
            </div>
        `;

        const form = container.querySelector('#rateForm');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const rate = form.ratePerLesson.value;
            localStorage.setItem(STORAGE_KEYS.RATE_PER_LESSON, rate);
            window.showNotification('Đã cập nhật định mức tiền theo tiết', 'success');
        });
    }

    loadTeacherCoefficientsInterface(container) {
            const coefficients = JSON.parse(localStorage.getItem(STORAGE_KEYS.TEACHER_COEFFICIENTS) || '[]');
            container.innerHTML = `
            <div class="teacher-coefficients">
                <h3>Hệ số giáo viên theo bằng cấp</h3>
                <form id="teacherCoefficientForm" class="coefficient-form">
                    <div class="form-group">
                        <label for="qualification">Bằng cấp:</label>
                        <input type="text" id="qualification" name="qualification" required>
                    </div>
                    <div class="form-group">
                        <label for="coefficient">Hệ số:</label>
                        <input type="number" id="coefficient" name="coefficient" 
                               min="0" step="0.1" required>
                    </div>
                    <div class="form-actions">
                        <button type="submit" class="btn-save">Thêm</button>
                    </div>
                </form>
                <div class="table-container">
                    <table id="teacherCoefficientsTable">
                        <thead>
                            <tr>
                                <th>Bằng cấp</th>
                                <th>Hệ số</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${coefficients.map(c => `
                                <tr>
                                    <td>${c.qualification}</td>
                                    <td>${c.coefficient}</td>
                                    <td>
                                        <button class="btn-delete" onclick="dashboard.modules.teachingSalary.deleteTeacherCoefficient('${c.id}')">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        const form = container.querySelector('#teacherCoefficientForm');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const newCoefficient = {
                qualification: form.qualification.value.trim(),
                coefficient: parseFloat(form.coefficient.value)
            };

            const coefficients = JSON.parse(localStorage.getItem(STORAGE_KEYS.TEACHER_COEFFICIENTS) || '[]');
            
            // Check for duplicate qualification
            if (coefficients.some(c => c.qualification === newCoefficient.qualification)) {
                window.showNotification('Bằng cấp này đã tồn tại', 'error');
                return;
            }

            add(STORAGE_KEYS.TEACHER_COEFFICIENTS, newCoefficient);
            this.loadTeacherCoefficientsInterface(container);
            form.reset();
            window.showNotification('Đã thêm hệ số mới', 'success');
        });
    }

    deleteTeacherCoefficient(id) {
        if (confirm('Bạn có chắc chắn muốn xóa hệ số này?')) {
            remove(STORAGE_KEYS.TEACHER_COEFFICIENTS, id);
            this.loadFunction('teacher-coefficients');
            window.showNotification('Đã xóa hệ số', 'success');
        }
    }

    loadClassCoefficientsInterface(container) {
        const coefficients = JSON.parse(localStorage.getItem(STORAGE_KEYS.CLASS_COEFFICIENTS) || '[]');
        container.innerHTML = `
            <div class="class-coefficients">
                <h3>Hệ số lớp</h3>
                <form id="classCoeffientForm" class="coefficient-form">
                    <div class="form-group">
                        <label for="classType">Loại lớp:</label>
                        <input type="text" id="classType" name="classType" required>
                    </div>
                    <div class="form-group">
                        <label for="coefficient">Hệ số:</label>
                        <input type="number" id="coefficient" name="coefficient" 
                               min="0" step="0.1" required>
                    </div>
                    <div class="form-actions">
                        <button type="submit" class="btn-save">Thêm</button>
                    </div>
                </form>
                <div class="table-container">
                    <table id="classCoefficientsTable">
                        <thead>
                            <tr>
                                <th>Loại lớp</th>
                                <th>Hệ số</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${coefficients.map(c => `
                                <tr>
                                    <td>${c.classType}</td>
                                    <td>${c.coefficient}</td>
                                    <td>
                                        <button class="btn-delete" onclick="dashboard.modules.teachingSalary.deleteClassCoefficient('${c.id}')">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        const form = container.querySelector('#classCoeffientForm');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const newCoefficient = {
                classType: form.classType.value.trim(),
                coefficient: parseFloat(form.coefficient.value)
            };

            const coefficients = JSON.parse(localStorage.getItem(STORAGE_KEYS.CLASS_COEFFICIENTS) || '[]');
            
            // Check for duplicate class type
            if (coefficients.some(c => c.classType === newCoefficient.classType)) {
                window.showNotification('Loại lớp này đã tồn tại', 'error');
                return;
            }

            add(STORAGE_KEYS.CLASS_COEFFICIENTS, newCoefficient);
            this.loadClassCoefficientsInterface(container);
            form.reset();
            window.showNotification('Đã thêm hệ số mới', 'success');
        });
    }

    deleteClassCoefficient(id) {
        if (confirm('Bạn có chắc chắn muốn xóa hệ số này?')) {
            remove(STORAGE_KEYS.CLASS_COEFFICIENTS, id);
            this.loadFunction('class-coefficients');
            window.showNotification('Đã xóa hệ số', 'success');
        }
    }

    loadCalculateSalaryInterface(container) {
        const teachers = JSON.parse(localStorage.getItem(STORAGE_KEYS.TEACHERS) || '[]');
        const semesters = JSON.parse(localStorage.getItem(STORAGE_KEYS.SEMESTERS) || '[]');
        
        container.innerHTML = `
            <div class="calculate-salary">
                <h3>Tính tiền dạy</h3>
                <form id="calculateSalaryForm" class="calculate-form">
                    <div class="form-group">
                        <label for="teacherSelect">Giáo viên:</label>
                        <select id="teacherSelect" name="teacherId" required>
                            <option value="">Chọn giáo viên</option>
                            ${teachers.map(t => `
                                <option value="${t.id}">${t.code} - ${t.name}</option>
                            `).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="semesterSelect">Kì học:</label>
                        <select id="semesterSelect" name="semesterId" required>
                            <option value="">Chọn kì học</option>
                            ${semesters.map(s => `
                                <option value="${s.id}">${s.name} ${s.academicYear}</option>
                            `).join('')}
                        </select>
                    </div>
                    <div class="form-actions">
                        <button type="submit" class="btn-calculate">Tính toán</button>
                    </div>
                </form>
                <div id="salaryResult" class="salary-result"></div>
            </div>
        `;

        const form = container.querySelector('#calculateSalaryForm');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.calculateSalary(
                form.teacherId.value,
                form.semesterId.value
            );
        });
    }

    calculateSalary(teacherId, semesterId) {
        const ratePerLesson = parseFloat(localStorage.getItem(STORAGE_KEYS.RATE_PER_LESSON) || '0');
        const teacher = JSON.parse(localStorage.getItem(STORAGE_KEYS.TEACHERS) || '[]')
            .find(t => t.id === teacherId);
        const classes = JSON.parse(localStorage.getItem(STORAGE_KEYS.CLASSES) || '[]')
            .filter(c => c.teacherId === teacherId && c.semesterId === semesterId);
        const courseModules = JSON.parse(localStorage.getItem(STORAGE_KEYS.COURSE_MODULES) || '[]');

        let totalSalary = 0;
        const details = [];

        classes.forEach(cls => {
            const courseModule = courseModules.find(cm => cm.id === cls.courseModuleId);
            if (courseModule) {
                const baseSalary = courseModule.periods * ratePerLesson;
                const classCoefficient = this.getClassCoefficient(cls);
                const teacherCoefficient = this.getTeacherCoefficient(teacher);
                
                const classSalary = baseSalary * classCoefficient * teacherCoefficient;
                totalSalary += classSalary;

                details.push({
                    className: cls.name,
                    periods: courseModule.periods,
                    baseSalary,
                    classCoefficient,
                    teacherCoefficient,
                    total: classSalary
                });
            }
        });

        const resultContainer = document.getElementById('salaryResult');
        resultContainer.innerHTML = `
            <h4>Kết quả tính toán</h4>
            <div class="salary-details">
                <table>
                    <thead>
                        <tr>
                            <th>Lớp</th>
                            <th>Số tiết</th>
                            <th>Lương cơ bản</th>
                            <th>Hệ số lớp</th>
                            <th>Hệ số GV</th>
                            <th>Thành tiền</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${details.map(d => `
                            <tr>
                                <td>${d.className}</td>
                                <td>${d.periods}</td>
                                <td>${d.baseSalary.toLocaleString()} VNĐ</td>
                                <td>${d.classCoefficient}</td>
                                <td>${d.teacherCoefficient}</td>
                                <td>${d.total.toLocaleString()} VNĐ</td>
                            </tr>
                        `).join('')}
                        <tr class="total-row">
                            <td colspan="5"><strong>Tổng cộng:</strong></td>
                            <td><strong>${totalSalary.toLocaleString()} VNĐ</strong></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        `;
    }

    getClassCoefficient(cls) {
        const coefficients = JSON.parse(localStorage.getItem(STORAGE_KEYS.CLASS_COEFFICIENTS) || '[]');
        // For now, just return 1 if no coefficient is found
        // TODO: Implement logic to determine class type and find appropriate coefficient
        return 1;
    }

    getTeacherCoefficient(teacher) {
        const coefficients = JSON.parse(localStorage.getItem(STORAGE_KEYS.TEACHER_COEFFICIENTS) || '[]');
        // For now, just return 1 if no coefficient is found
        // TODO: Implement logic to determine teacher qualification and find appropriate coefficient
        return 1;
    }
}