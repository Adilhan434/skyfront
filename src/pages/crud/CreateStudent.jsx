import React from 'react'
import { useState, useEffect } from 'react'
import api from '../../api.js'

const CreateStudent = () => {
    const [formData, setFormData] = useState({
        username: '',
        first_name: '',
        last_name: '',
        gender: '',
        address: '',
        phone: '',
        email: '',
        level: '',
        program: ''
    })
    
    const [programs, setPrograms] = useState([])
    const [message, setMessage] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [loadingPrograms, setLoadingPrograms] = useState(true)

    // Уровни обучения (аналогично бэкенду)
    const levels = [
        { value: 'BACHELOR', label: 'Бакалавриат' },
        { value: 'MASTER', label: 'Магистратура' },
        { value: 'PHD', label: 'Аспирантура' },
        { value: 'ASSOCIATE', label: 'Ассоциированная степень' },
        { value: 'DIPLOMA', label: 'Диплом' },
        { value: 'CERTIFICATE', label: 'Сертификат' }
    ]

    // Загрузка списка программ
    useEffect(() => {
        const fetchPrograms = async () => {
            try {
                // Предполагаем, что у вас есть endpoint для получения программ
                // Если нет - создайте его или замените на статический список
                const response = await api.get('api/programs/') // или ваш endpoint
                setPrograms(response.data)
            } catch (error) {
                console.error('Error fetching programs:', error)
                setError('Не удалось загрузить список программ')
                // Можно установить статический список программ для тестирования
                setPrograms([
                    { id: 1, name: 'Компьютерные науки' },
                    { id: 2, name: 'Инженерия' },
                    { id: 3, name: 'Бизнес-администрирование' }
                ])
            } finally {
                setLoadingPrograms(false)
            }
        }
        fetchPrograms()
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

        // Преобразуем program в число (если это ID)
        const submitData = {
            ...formData,
            program: parseInt(formData.program) || formData.program
        }

        try {
            const response = await api.post('accounts/create-student/', submitData)
            setMessage('Студент успешно создан!')
            console.log('Student created successfully:', response.data)
            
            // Очистка формы после успешного создания
            setFormData({
                username: '',
                first_name: '',
                last_name: '',
                gender: '',
                address: '',
                phone: '',
                email: '',
                level: '',
                program: ''
            })
        } catch (error) {
            console.error('Error creating student:', error)
            if (error.response && error.response.data) {
                const errorData = error.response.data
                if (typeof errorData === 'object') {
                    // Обработка ошибок валидации
                    if (errorData.details) {
                        const errorMessages = Object.values(errorData.details).flat().join(', ')
                        setError(`Ошибка валидации: ${errorMessages}`)
                    } else {
                        const errorMessages = Object.values(errorData).flat().join(', ')
                        setError(`Ошибка: ${errorMessages}`)
                    }
                } else {
                    setError(`Ошибка: ${errorData}`)
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
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Создание студента</h2>
            
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
                            placeholder="Введите имя пользователя"
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
                            placeholder="example@email.com"
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
                            placeholder="Введите имя"
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
                            placeholder="Введите фамилию"
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
                            placeholder="+7 (XXX) XXX-XX-XX"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Программа обучения *
                        </label>
                        <select
                            name="program"
                            value={formData.program}
                            onChange={handleChange}
                            required
                            disabled={loadingPrograms}
                            className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                loadingPrograms ? 'bg-gray-100 cursor-not-allowed' : ''
                            }`}
                        >
                            <option value="">Выберите программу</option>
                            {programs.map(program => (
                                <option key={program.id} value={program.id}>
                                    {program.name}
                                </option>
                            ))}
                        </select>
                        {loadingPrograms && (
                            <p className="text-xs text-gray-500 mt-1">Загрузка программ...</p>
                        )}
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
                        placeholder="Введите адрес проживания"
                    />
                </div>

                <div className="flex justify-end pt-4">
                    <button
                        type="submit"
                        disabled={loading || loadingPrograms}
                        className={`px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 ${
                            loading || loadingPrograms ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                    >
                        {loading ? 'Создание...' : 'Создать студента'}
                    </button>
                </div>
            </form>
        </div>
    )
}

export default CreateStudent