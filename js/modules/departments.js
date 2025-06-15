export class DepartmentManager {
    constructor() {
        this.departments = [];
    }

    init() {
        this.loadDepartments();
    }

    loadDepartments() {
        this.departments = JSON.parse(localStorage.getItem('departments') || '[]');
    }

    getAllDepartments() {
        return this.departments;
    }

    addDepartment(name, shortName, description) {
        const department = {
            id: Date.now().toString(),
            name,
            shortName,
            description
        };
        this.departments.push(department);
        this.saveDepartments();
        return department;
    }

    updateDepartment(id, name, shortName, description) {
        const index = this.departments.findIndex(dept => dept.id === id);
        if (index !== -1) {
            this.departments[index] = {
                ...this.departments[index],
                name,
                shortName,
                description
            };
            this.saveDepartments();
            return this.departments[index];
        }
        return null;
    }

    deleteDepartment(id) {
        this.departments = this.departments.filter(dept => dept.id !== id);
        this.saveDepartments();
    }

    saveDepartments() {
        localStorage.setItem('departments', JSON.stringify(this.departments));
    }

    getDepartmentById(id) {
        return this.departments.find(dept => dept.id === id);
    }
}

// Initialize with default departments if none exist
export function initializeDepartments() {
    const departments = JSON.parse(localStorage.getItem('departments') || '[]');
    if (departments.length === 0) {
        const defaultDepartments = [{
                id: '1',
                name: 'Khoa Công nghệ thông tin',
                shortName: 'CNTT',
                description: 'Đào tạo và nghiên cứu trong lĩnh vực công nghệ thông tin'
            },
            {
                id: '2',
                name: 'Khoa Kinh tế',
                shortName: 'KT',
                description: 'Đào tạo và nghiên cứu trong lĩnh vực kinh tế và quản trị'
            },
            {
                id: '3',
                name: 'Khoa Ngoại ngữ',
                shortName: 'NN',
                description: 'Đào tạo và nghiên cứu về ngôn ngữ và văn hóa quốc tế'
            }
        ];
        localStorage.setItem('departments', JSON.stringify(defaultDepartments));
    }
}