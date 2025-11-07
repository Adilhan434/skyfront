import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../../../api";

const TeacherGradesPage = () => {
  const { allocationId } = useParams();
  const navigate = useNavigate();
  const [allocation, setAllocation] = useState(null);
  const [students, setStudents] = useState([]);
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedModule, setSelectedModule] = useState("1st_module");
  const [activeTab, setActiveTab] = useState("grades");

  // Функция для получения информации о студенте по ID
  const fetchStudentById = async (studentId) => {
    try {
      const res = await api.get(`accounts/api/student/${studentId}/`);
      return res.data;
    } catch (error) {
      console.error(`Error fetching student ${studentId}:`, error);
      return null;
    }
  };

  // Функция для получения всех студентов группы
  const fetchStudentsByGroup = async (groupName) => {
    try {
      const res = await api.get(`accounts/api/groups/${groupName}/students`);
      return res.data || [];
    } catch (error) {
      console.error(`Error fetching students for group ${groupName}:`, error);
      return [];
    }
  };

  // Загружаем данные allocation и оценки
  useEffect(() => {
    const fetchAllocationAndGrades = async () => {
      try {
        setLoading(true);

        // Получаем allocation данные
        const allocationsRes = await api.get(
          "programs/api/teacher-allocations/"
        );
        const currentAllocation = allocationsRes.data.find(
          (a) => a.id === parseInt(allocationId)
        );

        if (!currentAllocation) {
          console.error("Allocation not found");
          navigate("/teacher");
          return;
        }

        setAllocation(currentAllocation);

        // Загружаем оценки
        await loadGrades(currentAllocation, selectedModule);
      } catch (error) {
        console.error("Error fetching allocation data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllocationAndGrades();
  }, [allocationId, navigate]);

  const loadGrades = async (alloc, moduleType) => {
    try {
      // Проверяем, есть ли курсы в allocation
      if (!alloc.courses_details || alloc.courses_details.length === 0) {
        console.error("No courses found in allocation");
        setGrades([]);
        await loadStudentsFromGroup(alloc.group_name);
        return;
      }

      const courseId = alloc.courses_details[0].id;

      // СНАЧАЛА ВСЕГДА загружаем всех студентов группы
      console.log("Loading all students from group:", alloc.group_name);
      const studentsList = await loadStudentsFromGroup(alloc.group_name);

      // ПОТОМ загружаем существующие оценки
      let endpoint = "";
      switch (moduleType) {
        case "1st_module":
          endpoint = `result/api/grade-1st-modules/?course=${courseId}`;
          break;
        case "2nd_module":
          endpoint = `result/api/grade-2nd-modules/?course=${courseId}`;
          break;
        case "semester":
          endpoint = `result/api/grade-semesters/?course=${courseId}`;
          break;
        default:
          endpoint = `result/api/grade-1st-modules/?course=${courseId}`;
      }

      console.log("Loading grades from:", endpoint);
      const gradesRes = await api.get(endpoint);

      const gradesData = gradesRes.data || [];
      console.log("Grades response data:", gradesData);

      // Объединяем данные: для студентов с оценками берем их оценки, для новых - нули
      mergeStudentsWithGrades(studentsList, gradesData, courseId);
    } catch (error) {
      console.error("Error loading grades:", error);
      console.error("Error details:", error.response?.data);
      // В случае ошибки все равно показываем студентов с пустыми оценками
      if (alloc) {
        await loadStudentsFromGroup(alloc.group_name);
        setGrades([]);
      } else {
        setStudents([]);
        setGrades([]);
      }
    }
  };

  // Загружаем студентов на основе данных из оценок (старая функция - оставляем для обратной совместимости)
  const loadStudentsFromGrades = async (gradesData) => {
    try {
      const uniqueStudentIds = [
        ...new Set(gradesData.map((grade) => grade.student)),
      ];
      console.log("Unique student IDs from grades:", uniqueStudentIds);

      const studentsPromises = uniqueStudentIds.map((studentId) =>
        fetchStudentById(studentId)
      );

      const studentsData = await Promise.all(studentsPromises);
      const validStudents = studentsData.filter((student) => student !== null);

      console.log("Loaded students:", validStudents);
      setStudents(validStudents);
    } catch (error) {
      console.error("Error loading students from grades:", error);
      setStudents([]);
    }
  };

  // Загружаем ВСЕХ студентов группы (без создания оценок здесь)
  const loadStudentsFromGroup = async (groupName) => {
    try {
      console.log("Loading ALL students from group:", groupName);
      const studentsData = await fetchStudentsByGroup(groupName);
      console.log("Loaded students from group:", studentsData);

      const studentsList = studentsData.students || studentsData;
      setStudents(studentsList);

      console.log(
        `✅ Loaded ${studentsList.length} students from group ${groupName}`
      );
      return studentsList;
    } catch (error) {
      console.error("Error loading students from group:", error);
      setStudents([]);
      return [];
    }
  };

  // НОВАЯ ФУНКЦИЯ: Объединяем студентов с их оценками
  const mergeStudentsWithGrades = (studentsList, gradesData, courseId) => {
    try {
      // studentsList передан явно из loadStudentsFromGroup
      // Теперь создаем массив оценок для всех студентов
      const mergedGrades = studentsList.map((student) => {
        // Ищем существующую оценку для этого студента
        const existingGrade = gradesData.find(
          (grade) => grade.student === student.id
        );

        if (existingGrade) {
          // Если оценка есть - используем её
          console.log(
            `✅ Found existing grade for student ${student.id} (${student.first_name} ${student.last_name})`
          );
          return existingGrade;
        } else {
          // Если оценки нет - создаем пустую (с нулями)
          console.log(
            `➕ No grade found for NEW student ${student.id} (${student.first_name} ${student.last_name}), creating empty grade`
          );
          return {
            student: student.id,
            course: courseId,
            attendance: 0,
            activities: 0,
            exam: 0,
            total: 0,
          };
        }
      });

      console.log(
        `📊 Merged grades for ${mergedGrades.length} students (${
          gradesData.length
        } existing + ${mergedGrades.length - gradesData.length} new)`
      );
      setGrades(mergedGrades);
    } catch (error) {
      console.error("Error merging students with grades:", error);
      // В случае ошибки создаем пустые оценки для всех студентов
      const emptyGrades = studentsList.map((student) => ({
        student: student.id,
        course: courseId,
        attendance: 0,
        activities: 0,
        exam: 0,
        total: 0,
      }));
      setGrades(emptyGrades);
    }
  };

  const handleModuleChange = (module) => {
    setSelectedModule(module);
    if (allocation) {
      loadGrades(allocation, module);
    }
  };

  const handleGradeChange = (studentId, field, value) => {
    const numericValue = value === "" ? 0 : parseFloat(value);

    setGrades((prevGrades) => {
      const existingGradeIndex = prevGrades.findIndex(
        (g) => g.student === studentId
      );

      // ВСЕГДА обновляем существующую оценку (она уже создана с нулями)
      if (existingGradeIndex >= 0) {
        const updatedGrades = [...prevGrades];
        updatedGrades[existingGradeIndex] = {
          ...updatedGrades[existingGradeIndex],
          [field]: numericValue,
          total: calculateUpdatedTotal(
            updatedGrades[existingGradeIndex],
            field,
            numericValue
          ),
        };
        return updatedGrades;
      }

      // Этот блок больше не нужен, но оставляем на всякий случай
      const newGrade = {
        student: studentId,
        course: allocation.courses_details[0].id,
        attendance: field === "attendance" ? numericValue : 0,
        activities: field === "activities" ? numericValue : 0,
        exam: field === "exam" ? numericValue : 0,
        total:
          field === "attendance"
            ? numericValue
            : field === "activities"
            ? numericValue
            : field === "exam"
            ? numericValue
            : 0,
      };
      return [...prevGrades, newGrade];
    });
  };

  const calculateUpdatedTotal = (grade, changedField, newValue) => {
    const attendance =
      changedField === "attendance"
        ? newValue
        : parseFloat(grade.attendance) || 0;
    const activities =
      changedField === "activities"
        ? newValue
        : parseFloat(grade.activities) || 0;
    const exam =
      changedField === "exam" ? newValue : parseFloat(grade.exam) || 0;
    return attendance + activities + exam;
  };

  // Валидация оценок перед сохранением
  const validateGradesBeforeSave = () => {
    const errors = [];

    // Проверяем, что у всех студентов есть оценки
    if (grades.length === 0) {
      errors.push("No grades to save");
      return errors;
    }

    // Проверяем корректность оценок
    grades.forEach((grade) => {
      const student = students.find((s) => s.id === grade.student);
      const studentName = student
        ? student.get_full_name || `${student.first_name} ${student.last_name}`
        : `Student ${grade.student}`;

      const attendance = parseFloat(grade.attendance) || 0;
      const activities = parseFloat(grade.activities) || 0;
      const exam = parseFloat(grade.exam) || 0;

      if (attendance < 0 || attendance > 30) {
        errors.push(`${studentName}: Attendance must be between 0-30`);
      }
      if (activities < 0 || activities > 30) {
        errors.push(`${studentName}: Activities must be between 0-30`);
      }
      if (exam < 0 || exam > 40) {
        errors.push(`${studentName}: Exam must be between 0-40`);
      }

      const total = attendance + activities + exam;
      if (total > 100) {
        errors.push(`${studentName}: Total score cannot exceed 100%`);
      }
    });

    return errors;
  };

  // Bulk сохранение оценок через новый эндпоинт
  const saveGrades = async () => {
    try {
      setSaving(true);

      // Сохраняем ВСЕ оценки, даже с нулями
      const gradesToSave = grades;

      // Валидация перед отправкой
      const validationErrors = validateGradesBeforeSave();
      if (validationErrors.length > 0) {
        alert(
          "Please fix the following errors:\n\n" + validationErrors.join("\n")
        );
        return;
      }

      if (
        allocation &&
        allocation.courses_details &&
        allocation.courses_details.length > 0
      ) {
        const courseId = allocation.courses_details[0].id;

        // Подготавливаем данные для bulk update через НОВЫЙ эндпоинт
        const bulkData = {
          course_id: courseId,
          grade_type: selectedModule,
          grades: gradesToSave.map((grade) => ({
            student_id: grade.student,
            attendance: parseFloat(grade.attendance) || 0,
            activities: parseFloat(grade.activities) || 0,
            exam: parseFloat(grade.exam) || 0,
          })),
        };

        console.log(
          `Saving ${gradesToSave.length} grades via bulk update:`,
          bulkData
        );

        // ИСПОЛЬЗУЕМ НОВЫЙ ЭНДПОИНТ
        const response = await api.post(
          "/result/api/lecturer/bulk-grades/bulk-update/",
          bulkData
        );
        if (response.data.detail) {
          alert(`✅ ${response.data.detail}`);
          // Перезагружаем оценки для обновления интерфейса
          await loadGrades(allocation, selectedModule);
        } else {
          alert("Grades saved successfully!");
        }
      } else {
        alert("Error: Course information not found");
      }
    } catch (error) {
      console.error("Error bulk saving grades:", error);
      console.error("Error details:", error.response?.data);

      // Детальная обработка ошибок
      if (error.response?.status === 403) {
        alert("Permission denied: Only lecturers can update grades");
      } else if (error.response?.status === 400) {
        const errorDetail = error.response.data.detail || "Invalid data format";
        alert(`Validation error: ${errorDetail}`);
      } else if (error.response?.status === 404) {
        alert("Server endpoint not found. Please check the API configuration.");
      } else {
        const errorMessage =
          error.response?.data?.detail ||
          error.response?.data?.message ||
          error.message ||
          "Unknown error occurred";
        alert(`Error saving grades: ${errorMessage}`);
      }
    } finally {
      setSaving(false);
    }
  };

  // Получение оценок по курсу для обзора (новый эндпоинт)
  const loadCourseGradesOverview = async () => {
    try {
      if (
        !allocation ||
        !allocation.courses_details ||
        allocation.courses_details.length === 0
      ) {
        return;
      }

      const courseId = allocation.courses_details[0].id;

      // Используем новый эндпоинт для получения всех оценок по курсу
      const response = await api.get(
        `result/api/lecturer/course-grades/course_grades/?course_id=${courseId}`
      );

      if (response.data) {
        // Обрабатываем данные в зависимости от выбранного модуля
        let moduleGrades = [];
        switch (selectedModule) {
          case "1st_module":
            moduleGrades = response.data.first_module || [];
            break;
          case "2nd_module":
            moduleGrades = response.data.second_module || [];
            break;
          case "semester":
            moduleGrades = response.data.semester || [];
            break;
          default:
            moduleGrades = response.data.first_module || [];
        }

        setGrades(moduleGrades);

        // Загружаем студентов из оценок
        if (moduleGrades.length > 0) {
          await loadStudentsFromGrades(moduleGrades);
        }
      }
    } catch (error) {
      console.error("Error loading course grades overview:", error);
      // В случае ошибки используем старый метод загрузки
      await loadGrades(allocation, selectedModule);
    }
  };

  const getStudentGrade = (studentId) => {
    return grades.find((grade) => grade.student === studentId) || {};
  };

  const calculateTotal = (grade) => {
    if (!grade || Object.keys(grade).length === 0) return 0;

    const attendance = parseFloat(grade.attendance) || 0;
    const activities = parseFloat(grade.activities) || 0;
    const exam = parseFloat(grade.exam) || 0;
    return attendance + activities + exam;
  };

  // Функция для определения буквенной оценки на основе total
  const calculateLetterGrade = (total) => {
    if (total >= 90) return "A+";
    if (total >= 85) return "A";
    if (total >= 80) return "A-";
    if (total >= 75) return "B+";
    if (total >= 70) return "B";
    if (total >= 65) return "B-";
    if (total >= 60) return "C+";
    if (total >= 55) return "C";
    if (total >= 50) return "C-";
    if (total >= 45) return "D";
    return "F";
  };

  // Обновляем загрузку оценок при переключении табов
  useEffect(() => {
    if (allocation && activeTab === "overview") {
      loadCourseGradesOverview();
    }
  }, [activeTab, selectedModule, allocation]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!allocation) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-red-600">Allocation not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link
            to="/"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            ← Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-800">Grade Management</h1>
          <div className="mt-2 bg-white rounded-lg p-4 shadow">
            <h2 className="text-xl font-semibold text-gray-700">
              {allocation.courses_details?.[0]?.title || "Course"} -{" "}
              {allocation.group_name}
            </h2>
            <p className="text-gray-600">
              Lecturer: {allocation.lecturer_name}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Students: {students.length} | Grades loaded: {grades.length} |
              Module: {selectedModule}
              {grades.length === 0 && students.length > 0 && (
                <span className="ml-2 text-orange-600 font-medium">
                  (No grades found - showing empty form)
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab("grades")}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                  activeTab === "grades"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Grade Students
              </button>
              <button
                onClick={() => setActiveTab("overview")}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                  activeTab === "overview"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Grade Overview
              </button>
            </nav>
          </div>
        </div>

        {/* Module Selection */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Grading Period:
          </label>
          <div className="flex space-x-4">
            {["1st_module", "2nd_module", "semester"].map((module) => (
              <button
                key={module}
                onClick={() => handleModuleChange(module)}
                className={`px-4 py-2 rounded-md font-medium ${
                  selectedModule === module
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {module.replace("_", " ").toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {activeTab === "grades" && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {/* Info Message if No Grades Found */}
            {grades.length === 0 && students.length > 0 && (
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-yellow-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700">
                      <strong>No grades found for this module.</strong> You can
                      initialize grades by entering values below and clicking
                      "Save All Grades".
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Grades Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Attendance (30%)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Activities (30%)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Exam (40%)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Grade
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {students.map((student) => {
                    const grade = getStudentGrade(student.id);
                    const total = calculateTotal(grade);
                    const letterGrade =
                      grade.grade || calculateLetterGrade(total);

                    return (
                      <tr key={student.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {student.get_full_name ||
                              `${student.first_name} ${student.last_name}`}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {student.student_id || `ST${student.id}`}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="number"
                            min="0"
                            max="30"
                            step="0.1"
                            value={grade.attendance || 0}
                            onChange={(e) =>
                              handleGradeChange(
                                student.id,
                                "attendance",
                                e.target.value
                              )
                            }
                            className="w-20 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="0-30"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="number"
                            min="0"
                            max="30"
                            step="0.1"
                            value={grade.activities || 0}
                            onChange={(e) =>
                              handleGradeChange(
                                student.id,
                                "activities",
                                e.target.value
                              )
                            }
                            className="w-20 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="0-30"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="number"
                            min="0"
                            max="40"
                            step="0.1"
                            value={grade.exam || 0}
                            onChange={(e) =>
                              handleGradeChange(
                                student.id,
                                "exam",
                                e.target.value
                              )
                            }
                            className="w-20 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="0-40"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {total > 0 ? total.toFixed(1) : "0.0"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">
                          {letterGrade &&
                          letterGrade !== "F" &&
                          letterGrade !== "null" &&
                          letterGrade !== null ? (
                            <span
                              className={`px-2 py-1 rounded-full text-xs ${
                                letterGrade === "A+" || letterGrade === "A"
                                  ? "bg-green-100 text-green-800"
                                  : letterGrade === "A-" || letterGrade === "B+"
                                  ? "bg-blue-100 text-blue-800"
                                  : letterGrade === "B" || letterGrade === "B-"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : letterGrade === "C+" || letterGrade === "C"
                                  ? "bg-orange-100 text-orange-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {letterGrade}
                            </span>
                          ) : (
                            <span className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-800">
                              {!letterGrade || letterGrade === "null"
                                ? "N/A"
                                : letterGrade}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Save Button */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <button
                onClick={saveGrades}
                disabled={saving}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {saving ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Saving {grades.length} grades...
                  </>
                ) : (
                  `Save All Grades (${grades.length} students)`
                )}
              </button>
            </div>
          </div>
        )}

        {activeTab === "overview" && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Grade Distribution</h3>
            {grades.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No grades available for this module. Enter grades in the "Grade
                Students" tab first.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                  "A+",
                  "A",
                  "A-",
                  "B+",
                  "B",
                  "B-",
                  "C+",
                  "C",
                  "C-",
                  "D",
                  "F",
                ].map((grade) => {
                  const count = grades.filter((g) => g.grade === grade).length;
                  return (
                    <div
                      key={grade}
                      className="bg-gray-50 rounded-lg p-4 text-center"
                    >
                      <div className="text-2xl font-bold text-gray-800">
                        {count}
                      </div>
                      <div className="text-sm text-gray-600">{grade}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherGradesPage;
