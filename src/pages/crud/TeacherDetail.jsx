import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api';

const TeacherDetail = () => {
    const { id } = useParams();
    const [teacher, setTeacher] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchTeacher();
    }, [id]);

    const fetchTeacher = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/accounts/users/${id}/`);
            setTeacher(response.data);
            setError(null);
        } catch (err) {
            console.error('Error fetching teacher:', err);
            setError('Не удалось загрузить информацию об учителе');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('ru-RU');
    };

    const getGenderText = (gender) => {
        switch (gender) {
            case 'M': return 'Мужской';
            case 'F': return 'Женский';
            default: return 'Не указано';
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white rounded-lg shadow p-6">
                <div className="text-center text-red-600">
                    <p className="text-lg font-semibold">{error}</p>
                    <button 
                        onClick={fetchTeacher}
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        Попробовать снова
                    </button>
                </div>
            </div>
        );
    }

    if (!teacher) {
        return (
            <div className="bg-white rounded-lg shadow p-6">
                <div className="text-center text-gray-600">
                    <p className="text-lg font-semibold">Учитель не найден</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            {/* Заголовок и кнопка назад */}
            <div className="mb-6 flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Информация об учителе</h1>
                <Link 
                    to="/admin/create-lecturers" 
                    className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                >
                    Назад к списку
                </Link>
            </div>

            {/* Основная информация */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-800">Основная информация</h2>
                </div>
                
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Левая колонка */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-600">ФИО</label>
                                <p className="mt-1 text-lg font-semibold text-gray-900">{teacher.full_name}</p>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-600">Имя пользователя</label>
                                <p className="mt-1 text-gray-900">{teacher.username}</p>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-600">Email</label>
                                <p className="mt-1 text-gray-900">{teacher.email}</p>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-600">Телефон</label>
                                <p className="mt-1 text-gray-900">{teacher.phone || 'Не указан'}</p>
                            </div>
                        </div>

                        {/* Правая колонка */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-600">Пол</label>
                                <p className="mt-1 text-gray-900">{getGenderText(teacher.gender)}</p>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-600">Дата регистрации</label>
                                <p className="mt-1 text-gray-900">{formatDate(teacher.date_joined)}</p>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-600">Роль</label>
                                <span className="inline-flex mt-1 px-3 py-1 text-sm font-semibold rounded-full bg-green-100 text-green-800">
                                    {teacher.user_role}
                                </span>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-600">ID</label>
                                <p className="mt-1 text-gray-900 font-mono">{teacher.id}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Дополнительные секции можно добавить здесь */}
            {teacher.bio && (
                <div className="mt-6 bg-white shadow rounded-lg overflow-hidden">
                    <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-800">О себе</h2>
                    </div>
                    <div className="p-6">
                        <p className="text-gray-700 whitespace-pre-line">{teacher.bio}</p>
                    </div>
                </div>
            )}

            {/* Кнопки действий */}
            <div className="mt-6 flex justify-end space-x-4">
                <Link
                    to={`/admin/teacher/${teacher.id}/edit`}
                    className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                    Редактировать
                </Link>
                <button
                    onClick={() => window.history.back()}
                    className="px-6 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors"
                >
                    Закрыть
                </button>
            </div>
        </div>
    );
};

export default TeacherDetail;