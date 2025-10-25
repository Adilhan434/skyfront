import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api';

const StudentEdit = ({role}) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        gender: '',
        address: '',
        phone: '',
        email: '',
        group: '',
        level:'',
        program: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [initialLoad, setInitialLoad] = useState(true);
    const [programs, setPrograms] = useState([]);
    const [groups, setGroups] = useState([]);
    const [loadingPrograms, setLoadingPrograms] = useState(false);
    const [loadingGroups, setLoadingGroups] = useState(false);

    const levels = [
        { value: 'Bachelor', label: 'Бакалавриат' },
        { value: 'MASTER_DEGREE', label: 'Магистратура' },
    ];

    useEffect(() => {
        fetchStudent();
        fetchPrograms();
        fetchGroups();
    }, [id]);

    const fetchStudent = async () => {
        try {
            setInitialLoad(true);
            const response = await api.get(`/accounts/api/student/${id}/`);
            const studentData = response.data;
            
            console.log('Received student data:', studentData);
            
            setFormData({
                first_name: studentData.first_name || '',
                last_name: studentData.last_name || '',
                gender: studentData.gender || '',
                address: studentData.address || '',
                phone: studentData.phone || '',
                email: studentData.email || '',
                group: studentData.group || '',
                level: studentData.level || '',
                program: studentData.program || '',
            });
            
            setInitialLoad(false);
        } catch (err) {
            console.error('Error fetching student:', err);
            console.error('Error details:', err.response);
            setError('Не удалось загрузить данные студента');
            setInitialLoad(false);
        }
    };

    const fetchPrograms = async () => {
        try {
            setLoadingPrograms(true);
            const response = await api.get('programs/api/');
            setPrograms(response.data || []);
        } catch (error) {
            console.error('Error fetching programs:', error);
        } finally {
            setLoadingPrograms(false);
        }
    };

    const fetchGroups = async () => {
        try {
            setLoadingGroups(true);
            const response = await api.get('accounts/api/groups/');
            setGroups(response.data || []);
        } catch (error) {
            console.error('Error fetching groups:', error);
        } finally {
            setLoadingGroups(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        
        const submitData = {
            first_name: formData.first_name,
            last_name: formData.last_name,
            gender: formData.gender,
            address: formData.address,
            phone: formData.phone,
            email: formData.email,
            group: formData.group,
            level: formData.level,
            program: formData.program,
        };
        
        // Remove empty strings that might cause validation issues
        Object.keys(submitData).forEach(key => {
            if (submitData[key] === '') {
                delete submitData[key];
            }
        });
        
        console.log('Submitting data:', submitData);
        
        try {
            await api.patch(`/accounts/api/student-update/${id}/`, submitData);
            navigate(`/admin/student/${id}`);
        } catch (err) {
            console.error('Error:', err.response?.data);
            setError(`Ошибка обновления: ${JSON.stringify(err.response?.data)}`);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    // Показываем загрузку только при первоначальной загрузке
    if (initialLoad) {
        return (
            <div className="max-w-2xl mx-auto">
                <div className="flex justify-center items-center h-64">
                    <p className="text-gray-600">Загрузка данных студента...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Редактирование {
                    role === 'teacher' ? "учителя" :
                    role === 'student' ? "студента" : 
                    "родителя"}</h1>
                <p className="text-gray-600">ID: {id}</p>
            </div>

            {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-red-700">{error}</p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6">
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Имя</label>
                            <input
                                type="text"
                                name="first_name"
                                value={formData.first_name}
                                onChange={handleChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Введите имя"
                            />
                            <p className="text-xs text-gray-500 mt-1">Текущее значение: {formData.first_name || 'не указано'}</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Фамилия</label>
                            <input
                                type="text"
                                name="last_name"
                                value={formData.last_name}
                                onChange={handleChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Введите фамилию"
                            />
                            <p className="text-xs text-gray-500 mt-1">Текущее значение: {formData.last_name || 'не указано'}</p>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Пол</label>
                        <select
                            name="gender"
                            value={formData.gender}
                            onChange={handleChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="">Не указан</option>
                            <option value="M">Мужской</option>
                            <option value="F">Женский</option>
                        </select>
                        <p className="text-xs text-gray-500 mt-1">Текущее значение: {formData.gender === 'M' ? 'Мужской' : formData.gender === 'F' ? 'Женский' : 'не указано'}</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Адрес</label>
                        <textarea
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            rows={3}
                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Введите адрес"
                        />
                        <p className="text-xs text-gray-500 mt-1">Текущее значение: {formData.address || 'не указано'}</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Телефон</label>
                        <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Введите телефон"
                        />
                        <p className="text-xs text-gray-500 mt-1">Текущее значение: {formData.phone || 'не указано'}</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email *</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Введите email"
                        />
                        <p className="text-xs text-gray-500 mt-1">Текущее значение: {formData.email || 'не указано'}</p>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Группа</label>
                            {loadingGroups ? (
                                <div className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-100">
                                    Загрузка групп...
                                </div>
                            ) : (
                                <select
                                    name="group"
                                    value={formData.group}
                                    onChange={handleChange}
                                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="">Выберите группу</option>
                                    {groups.map(group => (
                                        <option key={group.id} value={group.id}>
                                            {group.name || group.title}
                                        </option>
                                    ))}
                                </select>
                            )}
                            <p className="text-xs text-gray-500 mt-1">Текущее значение: {formData.group || 'не указано'}</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Уровень</label>
                            <select
                                name="level"
                                value={formData.level}
                                onChange={handleChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="">Выберите уровень</option>
                                {levels.map(level => (
                                    <option key={level.value} value={level.value}>
                                        {level.label}
                                    </option>
                                ))}
                            </select>
                            <p className="text-xs text-gray-500 mt-1">Текущее значение: {formData.level || 'не указано'}</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Программа</label>
                            {loadingPrograms ? (
                                <div className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-100">
                                    Загрузка программ...
                                </div>
                            ) : (
                                <select
                                    name="program"
                                    value={formData.program}
                                    onChange={handleChange}
                                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="">Выберите программу</option>
                                    {programs.map(program => (
                                        <option key={program.id} value={program.id}>
                                            {program.title || program.name}
                                        </option>
                                    ))}
                                </select>
                            )}
                            <p className="text-xs text-gray-500 mt-1">Текущее значение: {formData.program || 'не указано'}</p>
                        </div>
                    </div>
                </div>

                <div className="mt-6 flex justify-end space-x-4">
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="px-6 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors"
                    >
                        Отмена
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                        {loading ? 'Сохранение...' : 'Сохранить изменения'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default StudentEdit;