export class QualificationManager {
    constructor() {
        this.qualifications = [];
    }

    init() {
        this.loadQualifications();
    }

    loadQualifications() {
        this.qualifications = JSON.parse(localStorage.getItem('qualifications') || '[]');
    }

    getAllQualifications() {
        return this.qualifications;
    }

    addQualification(name, shortName) {
        const qualification = {
            id: Date.now().toString(),
            name,
            shortName
        };
        this.qualifications.push(qualification);
        this.saveQualifications();
        return qualification;
    }

    updateQualification(id, name, shortName) {
        const index = this.qualifications.findIndex(qual => qual.id === id);
        if (index !== -1) {
            this.qualifications[index] = {
                ...this.qualifications[index],
                name,
                shortName
            };
            this.saveQualifications();
            return this.qualifications[index];
        }
        return null;
    }

    deleteQualification(id) {
        this.qualifications = this.qualifications.filter(qual => qual.id !== id);
        this.saveQualifications();
    }

    saveQualifications() {
        localStorage.setItem('qualifications', JSON.stringify(this.qualifications));
    }

    getQualificationById(id) {
        return this.qualifications.find(qual => qual.id === id);
    }
}

// Initialize with default qualifications if none exist
export function initializeQualifications() {
    const qualifications = JSON.parse(localStorage.getItem('qualifications') || '[]');
    if (qualifications.length === 0) {
        const defaultQualifications = [{
                id: '1',
                name: 'Tiến sĩ',
                shortName: 'TS'
            },
            {
                id: '2',
                name: 'Thạc sĩ',
                shortName: 'ThS'
            },
            {
                id: '3',
                name: 'Kỹ sư',
                shortName: 'KS'
            },
            {
                id: '4',
                name: 'Cử nhân',
                shortName: 'CN'
            }
        ];
        localStorage.setItem('qualifications', JSON.stringify(defaultQualifications));
    }
}