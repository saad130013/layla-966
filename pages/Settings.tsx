import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { useI18n } from '../hooks/useI18n';
import Card from '../components/ui/Card';
import { PlusCircle, Edit, Trash2, Save, X, User as UserIcon } from 'lucide-react';
import { User, UserRole } from '../types';

const Settings: React.FC = () => {
    const { user } = useContext(AppContext);
    
    if (!user) return null;

    return (
        <div className="space-y-6">
            {user.role === UserRole.Supervisor ? <SupervisorSettings /> : <InspectorSettings />}
        </div>
    );
};

// =================================================================================================
// SUPERVISOR SETTINGS - USER MANAGEMENT
// =================================================================================================
const SupervisorSettings = () => {
    const { users, addUser, updateUser, deleteUser } = useContext(AppContext);
    const { t } = useI18n();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);

    const openAddModal = () => {
        setEditingUser(null);
        setIsModalOpen(true);
    };

    const openEditModal = (user: User) => {
        setEditingUser(user);
        setIsModalOpen(true);
    };
    
    const handleDelete = (userId: string) => {
        if(window.confirm(t('confirmDelete'))) {
            deleteUser(userId);
            alert(t('userDeleted'));
        }
    }

    const inspectors = users.filter(u => u.role === UserRole.Inspector);
    const supervisors = users.filter(u => u.role === UserRole.Supervisor);

    return (
        <>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-brand-blue-dark dark:text-gray-200">{t('userManagement')}</h1>
                <button 
                    onClick={openAddModal}
                    className="flex items-center px-4 py-2 bg-brand-teal text-white font-semibold rounded-md shadow-sm hover:bg-brand-blue-dark transition-colors"
                >
                    <PlusCircle size={18} className="me-2" />
                    {t('addUser')}
                </button>
            </div>
            
            <Card title={t('supervisors')}>
                <UserTable users={supervisors} onEdit={openEditModal} onDelete={handleDelete} />
            </Card>

            <Card title={t('inspectors')}>
                <UserTable users={inspectors} onEdit={openEditModal} onDelete={handleDelete} />
            </Card>
            
            {isModalOpen && <UserModal user={editingUser} onClose={() => setIsModalOpen(false)} />}
        </>
    );
};

const UserTable: React.FC<{users: User[], onEdit: (user: User) => void, onDelete: (userId: string) => void}> = ({users, onEdit, onDelete}) => {
    const { t } = useI18n();
    return(
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-500 dark:text-gray-400 uppercase bg-gray-50 dark:bg-gray-700">
                    <tr>
                        <th className="px-4 py-2">{t('fullName')}</th>
                        <th className="px-4 py-2">{t('username')}</th>
                        <th className="px-4 py-2">{t('role')}</th>
                        <th className="px-4 py-2 text-center">{t('actions')}</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(u => (
                         <tr key={u.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                             <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-200">{u.name}</td>
                             <td className="px-4 py-3">{u.username}</td>
                             <td className="px-4 py-3">{t(u.role.toLowerCase())}</td>
                             <td className="px-4 py-3 text-center">
                                 <button onClick={() => onEdit(u)} className="p-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"><Edit size={16}/></button>
                                 <button onClick={() => onDelete(u.id)} className="p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"><Trash2 size={16}/></button>
                             </td>
                         </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

const UserModal: React.FC<{user: User | null, onClose: () => void}> = ({user, onClose}) => {
    const { addUser, updateUser } = useContext(AppContext);
    const { t } = useI18n();
    const [formData, setFormData] = useState({
        name: user?.name || '',
        username: user?.username || '',
        password: '',
        role: user?.role || UserRole.Inspector,
    });
    
    const isEditing = user !== null;
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({...formData, [e.target.name]: e.target.value});
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(isEditing && user) {
            updateUser({ ...user, ...formData, password: formData.password || user.password });
             alert(t('userUpdated'));
        } else {
            if(!formData.password) {
                alert("Password is required for new users.");
                return;
            }
            addUser(formData);
            alert(t('userCreated'));
        }
        onClose();
    };

    const formElementClasses = "w-full p-2 border rounded-md bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-brand-teal focus:border-brand-teal";

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
             <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
                 <form onSubmit={handleSubmit}>
                    <div className="p-6 border-b dark:border-gray-700">
                        <h3 className="text-xl font-bold">{isEditing ? t('editUser') : t('addUser')}</h3>
                    </div>
                    <div className="p-6 space-y-4">
                         <div>
                            <label className="block text-sm font-medium mb-1">{t('fullName')}</label>
                            <input type="text" name="name" value={formData.name} onChange={handleChange} required className={formElementClasses} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">{t('username')}</label>
                            <input type="text" name="username" value={formData.username} onChange={handleChange} required className={formElementClasses} />
                        </div>
                         <div>
                            <label className="block text-sm font-medium mb-1">{t('password')}</label>
                            <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder={isEditing ? 'Leave blank to keep unchanged' : ''} required={!isEditing} className={formElementClasses} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">{t('role')}</label>
                            <select name="role" value={formData.role} onChange={handleChange} className={formElementClasses}>
                                <option value={UserRole.Inspector}>{t('inspector')}</option>
                                <option value={UserRole.Supervisor}>{t('supervisor')}</option>
                            </select>
                        </div>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-700/50 flex justify-end gap-4 rounded-b-lg">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500">{t('cancel')}</button>
                        <button type="submit" className="px-4 py-2 bg-brand-teal text-white rounded-md hover:bg-brand-blue-dark">{t('save')}</button>
                    </div>
                 </form>
             </div>
        </div>
    );
};

// =================================================================================================
// INSPECTOR SETTINGS - CHANGE PASSWORD
// =================================================================================================
const InspectorSettings = () => {
    const { user, changePassword } = useContext(AppContext);
    const { t } = useI18n();
    const [passwords, setPasswords] = useState({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPasswords({ ...passwords, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (passwords.newPassword !== passwords.confirmNewPassword) {
            setError(t('passwordMismatch'));
            return;
        }

        if (user && changePassword(user.id, passwords.currentPassword, passwords.newPassword)) {
            setSuccess(t('passwordUpdated'));
            setPasswords({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
        } else {
            setError(t('incorrectPassword'));
        }
    };
    
    const formElementClasses = "w-full p-2 border rounded-md bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-brand-teal focus:border-brand-teal";

    return (
         <Card>
            <h1 className="text-2xl font-bold text-brand-blue-dark dark:text-gray-200 mb-6">{t('myProfile')}</h1>
            <form onSubmit={handleSubmit} className="max-w-md space-y-4">
                 <h3 className="text-lg font-semibold text-brand-blue-dark dark:text-brand-green">{t('changePassword')}</h3>
                 <div>
                    <label className="block text-sm font-medium mb-1">{t('currentPassword')}</label>
                    <input type="password" name="currentPassword" value={passwords.currentPassword} onChange={handleChange} required className={formElementClasses} />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">{t('newPassword')}</label>
                    <input type="password" name="newPassword" value={passwords.newPassword} onChange={handleChange} required className={formElementClasses} />
                </div>
                 <div>
                    <label className="block text-sm font-medium mb-1">{t('confirmNewPassword')}</label>
                    <input type="password" name="confirmNewPassword" value={passwords.confirmNewPassword} onChange={handleChange} required className={formElementClasses} />
                </div>
                {error && <p className="text-red-500 text-sm">{error}</p>}
                {success && <p className="text-green-600 text-sm">{success}</p>}
                <div>
                     <button type="submit" className="px-4 py-2 bg-brand-teal text-white rounded-md hover:bg-brand-blue-dark">{t('changePassword')}</button>
                </div>
            </form>
         </Card>
    );
};


export default Settings;
