import React, { useState, useEffect } from 'react'
import api from '../../api'

const StudentsPanel = () => {
    const [formData, setFormData] = useState({
        username: 'ddddd',
        first_name: '',
        last_name: '',
        gender: '',
        address: '',
        phone: '',
        email: '',
        level: '',
        program: '',
        group: '' // Добавляем поле группы
    })
    
    const [programs, setPrograms] = useState([])
    const [groups, setGroups] = useState([]) // Добавляем состояние для групп
    const [message, setMessage] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [loadingPrograms, setLoadingPrograms] = useState(true)
    const [loadingGroups, setLoadingGroups] = useState(true) // Добавляем состояние загрузки групп
    const [students, setStudents] = useState([])

    const levels = [
        { value: 'Bachelor', label: 'Бакалавриат' },
        { value: 'MASTER_DEGREE', label: 'Магистратура' },
    ]

    const genders = [
        { value: 'M', label: 'Мужской' },
        { value: 'F', label: 'Женский' },
    ]

    // Загрузка списка программ
    useEffect(() => {
        const fetchPrograms = async () => {
            try {
                const response = await api.get('programs/api/') 
                setPrograms(response.data || [])
            } catch (error) {
                console.error('Error fetching programs:', error)
            } finally {
                setLoadingPrograms(false)
            }
        }
        fetchPrograms()
    }, [])

    // Загрузка списка групп
    useEffect(() => {
        const fetchGroups = async () => {
            try {
                const response = await api.get('accounts/api/groups/') 
                setGroups(response.data || [])
            } catch (error) {
                console.error('Error fetching groups:', error)
            } finally {
                setLoadingGroups(false)
            }
        }
        fetchGroups()
    }, [])

    useEffect(() => {
        const fetchStudents = async() => {
            setLoading(true)
            try{
                const response = await api.get('accounts/api/students/')
                setStudents(response.data)
            }catch(error){
                console.error('Error fetching students:', error)
            }finally{
                setLoading(false)
            }
        }
        fetchStudents()
    }, [])

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

        const requiredFields = ['username', 'first_name', 'last_name', 'gender', 'email', 'level', 'program', 'group']
        const missingFields = requiredFields.filter(field => !formData[field])
        
        if (missingFields.length > 0) {
            setError(`Заполните обязательные поля: ${missingFields.join(', ')}`)
            setLoading(false)
            return
        }

        try {
            const submitData = {
                username: formData.username,
                first_name: formData.first_name,
                last_name: formData.last_name,
                gender: formData.gender,
                address: formData.address,
                phone: formData.phone,
                email: formData.email,
                level: formData.level,
                program: parseInt(formData.program),
                group: parseInt(formData.group) // Добавляем группу в данные для отправки
            }

            const response = await api.post('accounts/create-student/', submitData)
            setMessage('Студент успешно создан!')
            
            // Очистка формы
            setFormData({
                username: 'ddd',
                first_name: '',
                last_name: '',
                gender: '',
                address: '',
                phone: '',
                email: '',
                level: '',
                program: '',
                group: ''
            })
        } catch (error) {
            console.error('Error creating student:', error)
            if (error.response && error.response.data) {
                const errorData = error.response.data
                
                if (errorData.details) {
                    if (typeof errorData.details === 'object') {
                        const errorMessages = Object.entries(errorData.details)
                            .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
                            .join('; ')
                        setError(`Ошибка валидации: ${errorMessages}`)
                    } else {
                        setError(`Ошибка: ${errorData.details}`)
                    }
                } else if (errorData.error) {
                    setError(`Ошибка: ${errorData.error}`)
                } else {
                    setError('Произошла ошибка при создании студента')
                }
            } else {
                setError('Произошла ошибка при создании студента')
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
            <a href="/"><p>вернуться в главное меню</p></a>
            <h2 className="text-2xl font-bold mb-6">Создание студента</h2>
            
            {message && (
                <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
                    {message}
                </div>
            )}
            
            {error && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Логин */}
                  

                    {/* Email */}
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

                    {/* Имя */}
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

                    {/* Фамилия */}
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

                    {/* Пол */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Пол *
                        </label>
                        <select
                            name="gender"
                            value={formData.gender}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Выберите пол</option>
                            {genders.map(gender => (
                                <option key={gender.value} value={gender.value}>
                                    {gender.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Телефон */}
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

                    {/* Уровень обучения */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Уровень обучения *
                        </label>
                        <select
                            name="level"
                            value={formData.level}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Выберите уровень</option>
                            {levels.map(level => (
                                <option key={level.value} value={level.value}>
                                    {level.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Программа */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Программа *
                        </label>
                        {loadingPrograms ? (
                            <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100">
                                Загрузка программ...
                            </div>
                        ) : (
                            <select
                                name="program"
                                value={formData.program}
                                onChange={handleChange}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Выберите программу</option>
                                {programs.map(program => (
                                    <option key={program.id} value={program.id}>
                                        {program.title || program.name}
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>

                    {/* Группа */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Группа *
                        </label>
                        {loadingGroups ? (
                            <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100">
                                Загрузка групп...
                            </div>
                        ) : (
                            <select
                                name="group"
                                value={formData.group}
                                onChange={handleChange}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Выберите группу</option>
                                {groups.map(group => (
                                    <option key={group.id} value={group.id}>
                                        {group.name || group.title} {/* Поддержка разных названий полей */}
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>
                </div>

                {/* Адрес */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Адрес
                    </label>
                    <textarea
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        rows="3"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Создание...' : 'Создать студента'}
                    </button>
                </div>
            </form>

            {/* Таблица студентов */}
            <div className="mt-8">
                <h3 className="text-xl font-bold mb-4">Список студентов</h3>
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                ФИО
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Логин
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Email
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Телефон
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Пол
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Дата регистрации
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Роль
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                группа
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {(students.students || students).map(student => (
                            <tr 
                                key={student.id} 
                                className="hover:bg-gray-50 transition-colors duration-150 cursor-pointer"
                                onClick={() => window.location.href = '/admin/student/' + student.id}
                            >
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">
                                        {student.full_name}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-500">
                                        {student.username}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-600">
                                        {student.email}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-600">
                                        {student.phone || '-'}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-600">
                                        {student.gender === 'M' ? 'Мужской' : student.gender === 'F' ? 'Женский' : '-'}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-600">
                                        {new Date(student.date_joined).toLocaleDateString('ru-RU')}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                        {student.user_role}
                                    </span>
                                </td>
                                 <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                        {student.group || '-'}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default StudentsPanel