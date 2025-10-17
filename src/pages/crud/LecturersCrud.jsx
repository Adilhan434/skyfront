import React from 'react'
import { useState, useEffect } from 'react'
import api from '../../api.js'

const LecturersPanel = () => {
    const [formData, setFormData] = useState({
        username: '',
        first_name: '',
        last_name: '',
        gender: '',
        address: '',
        phone: '',
        email: '',

    })
    const [teachersList, setTeachersList] = useState([])
    
    const [message, setMessage] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setMessage('')
        setError('')

        try {
            const response = await api.post('accounts/create-staff/', formData)
            setMessage('Преподаватель успешно создан!')
            console.log('Lecturer created successfully:', response.data)
            
            // Очистка формы после успешного создания
            setFormData({
                username: '',
                first_name: '',
                last_name: '',
                gender: '',
                address: '',
                phone: '',
                email: ''
            })
        } catch (error) {
            console.error('Error creating lecturer:', error)
            if (error.response && error.response.data) {
                const errorData = error.response.data
                if (typeof errorData === 'object') {
                    const errorMessages = Object.values(errorData).flat().join(', ')
                    setError(`Ошибка: ${errorMessages}`)
                } else {
                    setError(`Ошибка: ${errorData}`)
                }
            } else {
                setError('Произошла ошибка при создании преподавателя')
            }
        } finally {
            setLoading(false)
        }
    }

            useEffect(() => {
            const fetchLecturers = async () => {
                try {
                    const response = await api.get('accounts/create-staff/') 
                    // Обрабатываем оба варианта структуры ответа
                    setTeachersList(response.data.lecturers || response.data || [])
                } catch (error) {
                    console.error('Error fetching teachers:', error)              
                } finally {
                    setLoading(false)
                }
            }
            fetchLecturers()
        }, [])
    return (
        <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Создание преподавателя</h2>
            
            {message && (
                <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
                    {message}
                </div>
            )}
            
            {error && (
                <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Имя пользователя *
                        </label>
                        <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email *
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Имя *
                        </label>
                        <input
                            type="text"
                            name="first_name"
                            value={formData.first_name}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Фамилия *
                        </label>
                        <input
                            type="text"
                            name="last_name"
                            value={formData.last_name}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Пол
                        </label>
                        <select
                            name="gender"
                            value={formData.gender}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Выберите пол</option>
                            <option value="M">Мужской</option>
                            <option value="F">Женский</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Телефон
                        </label>
                        <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Адрес
                    </label>
                    <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                

                <div className="flex justify-end pt-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className={`px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                            loading ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                    >
                        {loading ? 'Создание...' : 'Создать преподавателя'}
                    </button>
                </div>
            </form>

           <div className="max-w-7xl mx-auto p-6">
                {loading ? (
                    <div className="text-center text-lg text-gray-600 py-10">
                        Загрузка преподавателей...
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Заголовок с количеством */}
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-bold text-gray-900">
                                Преподаватели
                            </h2>
                            <span className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full font-medium">
                                Всего: {teachersList.count || teachersList.length}
                            </span>
                        </div>

                        {/* Таблица преподавателей */}
                        <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                ФИО
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Логин
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Email
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Телефон
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Пол
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Дата регистрации
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Роль
                                            </th>
                                        </tr>
                                    </thead>
                                   <tbody className="bg-white divide-y divide-gray-200">
                                    {(teachersList.lecturers || teachersList).map(teacher => (
                                        <tr 
                                            key={teacher.id} 
                                            className="hover:bg-gray-50 transition-colors duration-150 cursor-pointer"
                                            onClick={() => window.location.href = '/admin/teacher/' + teacher.id}
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {teacher.full_name}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-500">
                                                    {teacher.username}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-600">
                                                    {teacher.email}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-600">
                                                    {teacher.phone || '-'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-600">
                                                    {teacher.gender === 'M' ? 'Мужской' : teacher.gender === 'F' ? 'Женский' : '-'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-600">
                                                    {new Date(teacher.date_joined).toLocaleDateString('ru-RU')}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                                    {teacher.user_role}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default LecturersPanel