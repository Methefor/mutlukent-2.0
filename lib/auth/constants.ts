export const PERMISSIONS = {
    // Report permissions
    VIEW_REPORTS_ALL: 'view_reports:all', // View all reports (Admin)
    VIEW_REPORTS_BRANCH: 'view_reports:branch', // View reports for own branch
    VIEW_REPORTS_OWN: 'view_reports:own', // View only own reports
    CREATE_REPORT: 'create_report',
    EDIT_REPORT_ALL: 'edit_report:all',
    EDIT_REPORT_BRANCH: 'edit_report:branch', // Edit reports in own branch
    EDIT_REPORT_OWN: 'edit_report:own', // Edit only own reports (maybe restricted to recent?)
    DELETE_REPORT_ALL: 'delete_report:all',
    DELETE_REPORT_OWN: 'delete_report:own',

    // Branch permissions
    MANAGE_BRANCHES: 'manage_branches', // Create/Edit/Delete branches
    VIEW_BRANCHES: 'view_branches',

    // User permissions
    MANAGE_USERS: 'manage_users', // Create/Edit users, assign roles
} as const

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS]

export const ROLES = {
    ADMIN: 'admin',
    BRANCH_MANAGER: 'branch_manager',
    STAFF: 'staff',
} as const

export const ROLE_DEFINITIONS = {
    [ROLES.ADMIN]: {
        name: 'admin',
        display_name: 'Yönetici',
        permissions: [
            PERMISSIONS.VIEW_REPORTS_ALL,
            PERMISSIONS.CREATE_REPORT,
            PERMISSIONS.EDIT_REPORT_ALL,
            PERMISSIONS.DELETE_REPORT_ALL,
            PERMISSIONS.MANAGE_BRANCHES,
            PERMISSIONS.VIEW_BRANCHES,
            PERMISSIONS.MANAGE_USERS,
        ],
    },
    [ROLES.BRANCH_MANAGER]: {
        name: 'branch_manager',
        display_name: 'Şube Müdürü',
        permissions: [
            PERMISSIONS.VIEW_REPORTS_BRANCH,
            PERMISSIONS.CREATE_REPORT,
            PERMISSIONS.EDIT_REPORT_BRANCH, // Can edit reports in their branch
            PERMISSIONS.VIEW_BRANCHES, // Can see branch list
        ],
    },
    [ROLES.STAFF]: {
        name: 'staff',
        display_name: 'Personel',
        permissions: [
            PERMISSIONS.VIEW_REPORTS_OWN,
            PERMISSIONS.CREATE_REPORT,
            // Staff usually cannot delete or edit after submission, maybe short window?
            // For now, no edit/delete for staff.
        ],
    },
}
