import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../api";

const StudentDashboard = () => {
  const [myGrades, setMyGrades] = useState({
    first_module_grades: [],
    second_module_grades: [],
    semester_grades: [],
  });
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Функция для получения профиля студента
  const fetchProfile = async () => {
    try {
      const res = await api.get("accounts/profile/student/");
      console.log("Student profile loaded:", res.data);
      setProfile(res.data);
    } catch (e) {
      console.error("Ошибка загрузки профиля:", e);
    }
  };

  // Функция для получения всех оценок студента
  const fetchAllGrades = async () => {
    try {
      const res = await api.get("result/api/grade-semesters/my_all_grades/");
      console.log("Student grades loaded:", res.data);
      setMyGrades(res.data);
    } catch (e) {
      console.error("Ошибка загрузки оценок:", e);
    }
  };

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        await Promise.all([fetchProfile(), fetchAllGrades()]);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  // Функция для получения общего количества курсов
  const getTotalCourses = () => {
    const allCourses = new Set();

    myGrades.first_module_grades.forEach((grade) => {
      allCourses.add(grade.course);
    });
    myGrades.second_module_grades.forEach((grade) => {
      allCourses.add(grade.course);
    });
    myGrades.semester_grades.forEach((grade) => {
      allCourses.add(grade.course);
    });

    return allCourses.size;
  };

  // Функция для расчета среднего GPA
  const calculateGPA = () => {
    const gradePoints = {
      "A+": 4.0,
      A: 4.0,
      "A-": 3.7,
      "B+": 3.3,
      B: 3.0,
      "B-": 2.7,
      "C+": 2.3,
      C: 2.0,
      "C-": 1.7,
      D: 1.0,
      F: 0.0,
    };

    const semesterGrades = myGrades.semester_grades;
    if (semesterGrades.length === 0) return "N/A";

    let totalPoints = 0;
    let validGrades = 0;

    semesterGrades.forEach((grade) => {
      if (grade.grade && gradePoints[grade.grade] !== undefined) {
        totalPoints += gradePoints[grade.grade];
        validGrades++;
      }
    });

    if (validGrades === 0) return "N/A";

    const gpa = totalPoints / validGrades;
    return gpa.toFixed(1);
  };

  // Функция для подсчета заданий с оценкой ниже C
  const countPendingAssignments = () => {
    const lowGrades = myGrades.semester_grades.filter((grade) => {
      const gradeValue = grade.grade;
      return gradeValue === "D" || gradeValue === "F" || !gradeValue;
    });
    return lowGrades.length;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 p-6 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-lg text-gray-600 font-medium">
            Загрузка данных...
          </div>
        </div>
      </div>
    );
  }

  const totalCourses = getTotalCourses();
  const currentGPA = calculateGPA();
  const pendingAssignments = countPendingAssignments();

  // Функция для получения цвета оценки
  const getGradeColor = (grade) => {
    if (grade === "A+" || grade === "A")
      return "text-emerald-600 bg-emerald-50";
    if (grade === "A-" || grade === "B+") return "text-blue-600 bg-blue-50";
    if (grade === "B" || grade === "B-") return "text-amber-600 bg-amber-50";
    if (grade === "C+" || grade === "C") return "text-orange-600 bg-orange-50";
    return "text-red-600 bg-red-50";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Приветствие и профиль */}
        <div className="mb-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-3 bg-white/80 backdrop-blur-sm rounded-2xl px-6 py-4 shadow-sm mb-4">
              <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-emerald-700 font-medium">
                Student Portal
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-3">
              Welcome back{profile ? `, ${profile.first_name}` : ""}!
            </h1>
            <p className="text-slate-600 text-lg max-w-2xl mx-auto">
              Here's your personalized academic dashboard with all your progress
              and achievements
            </p>
          </div>

          {/* Карточка профиля */}
          {profile && (
            <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200/60 p-6 mb-8 backdrop-blur-sm">
              <div className="flex flex-col sm:flex-row items-start gap-6">
                {/* Аватар */}
                <div className="flex-shrink-0">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl sm:text-3xl font-bold shadow-lg">
                    {profile.first_name?.[0]}
                    {profile.last_name?.[0]}
                  </div>
                </div>

                {/* Информация о профиле */}
                <div className="flex-grow">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
                    <div>
                      <h2 className="text-2xl font-bold text-slate-800 mb-1">
                        {profile.full_name}
                      </h2>
                      <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                        {profile.user_role}
                      </div>
                    </div>
                    {profile.id && (
                      <div className="mt-3 sm:mt-0 text-sm text-slate-500 font-mono">
                        ID: {profile.id}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    {/* Студенческая информация */}
                    {profile.level && (
                      <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                          🎓
                        </div>
                        <div>
                          <div className="text-slate-500 text-xs">Level</div>
                          <div className="text-slate-800 font-semibold">
                            {profile.level}
                          </div>
                        </div>
                      </div>
                    )}
                    {profile.program_name && (
                      <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600">
                          📚
                        </div>
                        <div>
                          <div className="text-slate-500 text-xs">Program</div>
                          <div className="text-slate-800 font-semibold">
                            {profile.program_name}
                          </div>
                        </div>
                      </div>
                    )}
                    {profile.group && (
                      <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                        <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600">
                          👥
                        </div>
                        <div>
                          <div className="text-slate-500 text-xs">Group</div>
                          <div className="text-slate-800 font-semibold">
                            {profile.group}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Личная информация */}
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                      <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-600">
                        📧
                      </div>
                      <div>
                        <div className="text-slate-500 text-xs">Email</div>
                        <div className="text-slate-800">{profile.email}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                      <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-600">
                        📱
                      </div>
                      <div>
                        <div className="text-slate-500 text-xs">Phone</div>
                        <div className="text-slate-800">
                          {profile.phone || "Not provided"}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                      <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-600">
                        👤
                      </div>
                      <div>
                        <div className="text-slate-500 text-xs">Username</div>
                        <div className="text-slate-800">{profile.username}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                      <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-600">
                        ⚧
                      </div>
                      <div>
                        <div className="text-slate-500 text-xs">Gender</div>
                        <div className="text-slate-800">
                          {profile.gender === "M"
                            ? "Male"
                            : profile.gender === "F"
                            ? "Female"
                            : "Not specified"}
                        </div>
                      </div>
                      .
                    </div>
                    {profile.address && (
                      <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl md:col-span-2">
                        <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-600">
                          📍
                        </div>
                        <div>
                          <div className="text-slate-500 text-xs">Address</div>
                          <div className="text-slate-800">
                            {profile.address}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Основная карточка дашборда */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 rounded-2xl p-8 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8">
              <div className="flex items-center gap-4 mb-4 sm:mb-0">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-2xl">
                  🎓
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    Academic Dashboard
                  </h2>
                  <p className="text-blue-100">
                    Track your progress and performance
                  </p>
                </div>
              </div>
              <span className="bg-white/20 px-4 py-2 rounded-full text-sm font-medium text-white backdrop-blur-sm">
                Student Profile
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center text-white">
                    📊
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">
                      {totalCourses}
                    </div>
                    <div className="text-blue-100 text-sm">Active Courses</div>
                  </div>
                </div>
                <div className="text-white/70 text-xs">Currently enrolled</div>
              </div>

              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center text-white">
                    ⚠️
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">
                      {pendingAssignments}
                    </div>
                    <div className="text-blue-100 text-sm">
                      Need Improvement
                    </div>
                  </div>
                </div>
                <div className="text-white/70 text-xs">Requires attention</div>
              </div>

              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center text-white">
                    ⭐
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">
                      {currentGPA}
                    </div>
                    <div className="text-blue-100 text-sm">Current GPA</div>
                  </div>
                </div>
                <div className="text-white/70 text-xs">Grade Point Average</div>
              </div>
            </div>
          </div>
        </div>

        {/* Быстрые действия */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="grid grid-cols-2 gap-4">
            <a
              href="/student/attendance"
              className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all duration-300 border border-slate-200 group"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white text-2xl group-hover:scale-110 transition-transform">
                  📊
                </div>
                <div>
                  <div className="font-bold text-slate-800 text-lg">
                    My Attendance
                  </div>
                  <div className="text-slate-600 text-sm">
                    View attendance records
                  </div>
                </div>
              </div>
            </a>
            <a
              href="/student/schedule"
              className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all duration-300 border border-slate-200 group"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-teal-600 rounded-xl flex items-center justify-center text-white text-2xl group-hover:scale-110 transition-transform">
                  📅
                </div>
                <div>
                  <div className="font-bold text-slate-800 text-lg">
                    My Schedule
                  </div>
                  <div className="text-slate-600 text-sm">
                    View weekly schedule
                  </div>
                </div>
              </div>
            </a>
            <a
              href="/change-password"
              className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all duration-300 border border-slate-200 group col-span-2"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center text-white text-2xl group-hover:scale-110 transition-transform">
                  🔒
                </div>
                <div>
                  <div className="font-bold text-slate-800 text-lg">
                    Change Password
                  </div>
                  <div className="text-slate-600 text-sm">
                    Update your account password
                  </div>
                </div>
              </div>
            </a>
          </div>
        </div>

        {/* Семестровые оценки */}
        <div className="mb-8 max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-2 h-8 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></div>
            <h3 className="text-2xl font-bold text-slate-800">
              Semester Grades
            </h3>
          </div>

          {myGrades.semester_grades.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 text-2xl mb-4 mx-auto">
                📝
              </div>
              <div className="text-slate-500 text-lg mb-2">
                No semester grades available
              </div>
              <div className="text-slate-400 text-sm">
                Your semester grades will appear here once available
              </div>
            </div>
          ) : (
            <div className="grid gap-4">
              {myGrades.semester_grades.map((grade) => (
                <div
                  key={grade.id}
                  className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-6 hover:shadow-md transition-all duration-300"
                >
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between mb-6 gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h4 className="text-xl font-semibold text-slate-800">
                          {grade.course_title}
                        </h4>
                        <span className="text-slate-500 text-sm font-mono bg-slate-100 px-2 py-1 rounded">
                          {grade.course_code}
                        </span>
                      </div>
                      <div className="space-y-2">
                        <p className="text-slate-600 flex items-center gap-2">
                          <span className="w-1 h-1 bg-slate-400 rounded-full"></span>
                          Lecturer:{" "}
                          <span className="font-medium">
                            {grade.lecturer_name}
                          </span>
                        </p>
                        <p className="text-slate-600 flex items-center gap-2">
                          <span className="w-1 h-1 bg-slate-400 rounded-full"></span>
                          Semester:{" "}
                          <span className="font-medium">
                            {grade.semester_name}
                          </span>
                        </p>
                      </div>
                    </div>
                    <div
                      className={`px-4 py-3 rounded-xl font-bold text-lg text-center min-w-[80px] ${getGradeColor(
                        grade.grade
                      )}`}
                    >
                      {grade.grade}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-slate-100">
                    <div className="text-center p-3 bg-slate-50 rounded-xl">
                      <div className="text-sm text-slate-600 mb-1">
                        Attendance
                      </div>
                      <div className="text-lg font-semibold text-slate-800">
                        {grade.attendance}
                      </div>
                    </div>
                    <div className="text-center p-3 bg-slate-50 rounded-xl">
                      <div className="text-sm text-slate-600 mb-1">
                        Activities
                      </div>
                      <div className="text-lg font-semibold text-slate-800">
                        {grade.activities}
                      </div>
                    </div>
                    <div className="text-center p-3 bg-slate-50 rounded-xl">
                      <div className="text-sm text-slate-600 mb-1">Exam</div>
                      <div className="text-lg font-semibold text-slate-800">
                        {grade.exam}
                      </div>
                    </div>
                    <div className="text-center p-3 bg-blue-50 rounded-xl">
                      <div className="text-sm text-blue-600 mb-1">Total</div>
                      <div className="text-lg font-semibold text-blue-700">
                        {grade.total}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Модульные оценки */}
        <div className="mb-8 max-w-4xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Первый модуль */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-2 h-6 bg-blue-500 rounded-full"></div>
                <h3 className="text-xl font-bold text-slate-800">
                  First Module
                </h3>
              </div>
              {myGrades.first_module_grades.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 text-center">
                  <div className="text-slate-400 text-sm">
                    No first module grades
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {myGrades.first_module_grades.map((grade) => (
                    <div
                      key={grade.id}
                      className="bg-white rounded-xl shadow-sm border border-slate-200/60 p-4 hover:shadow-md transition-all duration-200"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium text-slate-800 mb-1">
                            {grade.course_title}
                          </div>
                          <div className="text-sm text-slate-600">
                            Total:{" "}
                            <span className="font-semibold">{grade.total}</span>
                          </div>
                        </div>
                        <div
                          className={`px-3 py-2 rounded-lg font-bold ${getGradeColor(
                            grade.grade
                          )}`}
                        >
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
              <div className="flex items-center gap-3 mb-4">
                <div className="w-2 h-6 bg-purple-500 rounded-full"></div>
                <h3 className="text-xl font-bold text-slate-800">
                  Second Module
                </h3>
              </div>
              {myGrades.second_module_grades.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 text-center">
                  <div className="text-slate-400 text-sm">
                    No second module grades
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {myGrades.second_module_grades.map((grade) => (
                    <div
                      key={grade.id}
                      className="bg-white rounded-xl shadow-sm border border-slate-200/60 p-4 hover:shadow-md transition-all duration-200"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium text-slate-800 mb-1">
                            {grade.course_title}
                          </div>
                          <div className="text-sm text-slate-600">
                            Total:{" "}
                            <span className="font-semibold">{grade.total}</span>
                          </div>
                        </div>
                        <div
                          className={`px-3 py-2 rounded-lg font-bold ${getGradeColor(
                            grade.grade
                          )}`}
                        >
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
        <div className="mb-8 max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-2 h-8 bg-gradient-to-b from-emerald-500 to-blue-600 rounded-full"></div>
            <h3 className="text-2xl font-bold text-slate-800">
              Performance Summary
            </h3>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                <div className="text-2xl font-bold text-emerald-700 mb-1">
                  {
                    myGrades.semester_grades.filter(
                      (g) => g.grade === "A" || g.grade === "A+"
                    ).length
                  }
                </div>
                <div className="text-sm text-emerald-600 font-medium">
                  Excellent
                </div>
                <div className="text-xs text-emerald-500 mt-1">A/A+</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-xl border border-blue-100">
                <div className="text-2xl font-bold text-blue-700 mb-1">
                  {
                    myGrades.semester_grades.filter(
                      (g) => g.grade === "A-" || g.grade === "B+"
                    ).length
                  }
                </div>
                <div className="text-sm text-blue-600 font-medium">Good</div>
                <div className="text-xs text-blue-500 mt-1">A-/B+</div>
              </div>
              <div className="text-center p-4 bg-amber-50 rounded-xl border border-amber-100">
                <div className="text-2xl font-bold text-amber-700 mb-1">
                  {
                    myGrades.semester_grades.filter(
                      (g) => g.grade === "B" || g.grade === "B-"
                    ).length
                  }
                </div>
                <div className="text-sm text-amber-600 font-medium">
                  Satisfactory
                </div>
                <div className="text-xs text-amber-500 mt-1">B/B-</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-xl border border-red-100">
                <div className="text-2xl font-bold text-red-700 mb-1">
                  {
                    myGrades.semester_grades.filter(
                      (g) =>
                        g.grade === "C+" ||
                        g.grade === "C" ||
                        g.grade === "C-" ||
                        g.grade === "D" ||
                        g.grade === "F"
                    ).length
                  }
                </div>
                <div className="text-sm text-red-600 font-medium">
                  Needs Improvement
                </div>
                <div className="text-xs text-red-500 mt-1">C+ and below</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center mt-12 mb-8">
        <a
          href="/logout"
          className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-800 font-medium transition-colors duration-200"
        >
          <span>Logout</span>
          <span>→</span>
        </a>
      </div>
    </div>
  );
};

export default StudentDashboard;
