import React,{ useState, useEffect} from 'react'
import api from '../../api'

const StudentDashboard = () => {
  const [myGrades, setMyGrades] = useState({
    first_module_grades: [],
    second_module_grades: [],
    semester_grades: []
  })
  const [loading, setLoading] = useState(true)

  // Функция для получения всех оценок студента
  const fetchAllGrades = async () => {
    try {
      const res = await api.get('result/api/grade-semesters/my_all_grades/')
      console.log('Student grades loaded:', res.data)
      setMyGrades(res.data)
    } catch (e) {
      console.error('Ошибка загрузки оценок:', e)
    }
  }

  // Функция для получения семестровых оценок
  const fetchSemesterGrades = async () => {
    try {
      const res = await api.get('resutlt/api/grade-semesters/my_grades/')
      return res.data
    } catch (e) {
      console.error('Ошибка загрузки семестровых оценок:', e)
      return []
    }
  }

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true)
      try {
        await fetchAllGrades()
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAllData()
  }, [])

  const commonCardStyles = "rounded-xl p-8 shadow-lg transition-all duration-300 hover:shadow-xl"
  const studentStyles = "bg-gradient-to-br from-blue-500 to-purple-600 text-white"

  // Функция для получения общего количества курсов
  const getTotalCourses = () => {
    const allCourses = new Set()
    
    myGrades.first_module_grades.forEach(grade => {
      allCourses.add(grade.course)
    })
    myGrades.second_module_grades.forEach(grade => {
      allCourses.add(grade.course)
    })
    myGrades.semester_grades.forEach(grade => {
      allCourses.add(grade.course)
    })
    
    return allCourses.size
  }

  // Функция для расчета среднего GPA
  const calculateGPA = () => {
    const gradePoints = {
      'A+': 4.0, 'A': 4.0, 'A-': 3.7,
      'B+': 3.3, 'B': 3.0, 'B-': 2.7,
      'C+': 2.3, 'C': 2.0, 'C-': 1.7,
      'D': 1.0, 'F': 0.0
    }

    const semesterGrades = myGrades.semester_grades
    if (semesterGrades.length === 0) return 'N/A'

    let totalPoints = 0
    let validGrades = 0

    semesterGrades.forEach(grade => {
      if (grade.grade && gradePoints[grade.grade] !== undefined) {
        totalPoints += gradePoints[grade.grade]
        validGrades++
      }
    })

    if (validGrades === 0) return 'N/A'

    const gpa = totalPoints / validGrades
    return gpa.toFixed(1)
  }

  // Функция для подсчета заданий с оценкой ниже C
  const countPendingAssignments = () => {
    const lowGrades = myGrades.semester_grades.filter(grade => {
      const gradeValue = grade.grade
      return gradeValue === 'D' || gradeValue === 'F' || !gradeValue
    })
    return lowGrades.length
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 flex items-center justify-center">
        <div className="text-xl">Загрузка данных...</div>
      </div>
    )
  }

  const totalCourses = getTotalCourses()
  const currentGPA = calculateGPA()
  const pendingAssignments = countPendingAssignments()

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Приветствие */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Welcome back!
          </h1>
          <p className="text-gray-600 text-lg">
            Here's your personalized dashboard
          </p>
        </div>

        {/* Основная карточка дашборда */}
        <div className="max-w-4xl mx-auto">
          <div className={`${commonCardStyles} ${studentStyles}`}>
            <div className="flex items-center justify-between mb-6">
              <div className="text-4xl">🎓</div>
              <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium">
                Student
              </span>
            </div>
            <h2 className="text-3xl font-bold mb-4">Student Dashboard</h2>
            <p className="text-blue-100 mb-6">Track your academic progress and grades</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white/20 p-4 rounded-lg">
                <div className="text-2xl font-bold">{totalCourses}</div>
                <div className="text-sm">Active Courses</div>
              </div>
              <div className="bg-white/20 p-4 rounded-lg">
                <div className="text-2xl font-bold">{pendingAssignments}</div>
                <div className="text-sm">Need Improvement</div>
              </div>
              <div className="bg-white/20 p-4 rounded-lg">
                <div className="text-2xl font-bold">{currentGPA}</div>
                <div className="text-sm">Current GPA</div>
              </div>
            </div>
          </div>
        </div>

        {/* Семестровые оценки */}
        <div className="mt-8 max-w-4xl mx-auto">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">Semester Grades</h3>
          {myGrades.semester_grades.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              No semester grades available
            </div>
          ) : (
            <div className="grid gap-4">
              {myGrades.semester_grades.map((grade) => (
                <div key={grade.id} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="text-xl font-semibold text-gray-800">
                        {grade.course_title} ({grade.course_code})
                      </h4>
                      <p className="text-gray-600">
                        Lecturer: {grade.lecturer_name}
                      </p>
                      <p className="text-gray-600">
                        Semester: {grade.semester_name}
                      </p>
                    </div>
                    <div className={`text-2xl font-bold ${
                      grade.grade === 'A+' || grade.grade === 'A' ? 'text-green-600' :
                      grade.grade === 'A-' || grade.grade === 'B+' ? 'text-blue-600' :
                      grade.grade === 'B' || grade.grade === 'B-' ? 'text-yellow-600' :
                      grade.grade === 'C+' || grade.grade === 'C' ? 'text-orange-600' :
                      'text-red-600'
                    }`}>
                      {grade.grade}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    <div className="text-center">
                      <div className="text-sm text-gray-600">Attendance</div>
                      <div className="text-lg font-semibold">{grade.attendance}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-gray-600">Activities</div>
                      <div className="text-lg font-semibold">{grade.activities}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-gray-600">Exam</div>
                      <div className="text-lg font-semibold">{grade.exam}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-gray-600">Total</div>
                      <div className="text-lg font-semibold text-blue-600">{grade.total}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Модульные оценки */}
        <div className="mt-8 max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Первый модуль */}
            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">First Module Grades</h3>
              {myGrades.first_module_grades.length === 0 ? (
                <div className="text-center text-gray-500 py-4">
                  No first module grades
                </div>
              ) : (
                <div className="grid gap-3">
                  {myGrades.first_module_grades.map((grade) => (
                    <div key={grade.id} className="bg-white rounded-lg shadow-sm p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium text-gray-800">{grade.course_title}</div>
                          <div className="text-sm text-gray-600">Total: {grade.total}</div>
                        </div>
                        <div className={`font-bold ${
                          grade.grade === 'A+' || grade.grade === 'A' ? 'text-green-600' :
                          grade.grade === 'A-' || grade.grade === 'B+' ? 'text-blue-600' :
                          grade.grade === 'B' || grade.grade === 'B-' ? 'text-yellow-600' :
                          'text-orange-600'
                        }`}>
                          {grade.grade}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Второй модуль */}
            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">Second Module Grades</h3>
              {myGrades.second_module_grades.length === 0 ? (
                <div className="text-center text-gray-500 py-4">
                  No second module grades
                </div>
              ) : (
                <div className="grid gap-3">
                  {myGrades.second_module_grades.map((grade) => (
                    <div key={grade.id} className="bg-white rounded-lg shadow-sm p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium text-gray-800">{grade.course_title}</div>
                          <div className="text-sm text-gray-600">Total: {grade.total}</div>
                        </div>
                        <div className={`font-bold ${
                          grade.grade === 'A+' || grade.grade === 'A' ? 'text-green-600' :
                          grade.grade === 'A-' || grade.grade === 'B+' ? 'text-blue-600' :
                          grade.grade === 'B' || grade.grade === 'B-' ? 'text-yellow-600' :
                          'text-orange-600'
                        }`}>
                          {grade.grade}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Статистика успеваемости */}
        <div className="mt-8 max-w-4xl mx-auto">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">Performance Summary</h3>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {myGrades.semester_grades.filter(g => g.grade === 'A' || g.grade === 'A+').length}
                </div>
                <div className="text-sm text-gray-600">Excellent (A/A+)</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {myGrades.semester_grades.filter(g => g.grade === 'A-' || g.grade === 'B+').length}
                </div>
                <div className="text-sm text-gray-600">Good (A-/B+)</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-600">
                  {myGrades.semester_grades.filter(g => g.grade === 'B' || g.grade === 'B-').length}
                </div>
                <div className="text-sm text-gray-600">Satisfactory (B/B-)</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">
                  {myGrades.semester_grades.filter(g => g.grade === 'C+' || g.grade === 'C' || g.grade === 'C-' || g.grade === 'D' || g.grade === 'F').length}
                </div>
                <div className="text-sm text-gray-600">Needs Improvement</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <a href="/logout" className="block text-center mt-8 text-blue-600 hover:text-blue-800">
        logout
      </a>
    </div>
  )
}

export default StudentDashboard