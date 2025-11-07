import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import api from "../../api";

const TeacherDashboard = () => {
  const [myCourses, setMyCourses] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);

  // Функция для получения профиля преподавателя
  const fetchProfile = async () => {
    try {
      const res = await api.get("accounts/profile/");
      console.log("Teacher profile loaded:", res.data);
      setProfile(res.data);
    } catch (e) {
      console.error("Ошибка загрузки профиля:", e);
    }
  };

  // Функция для получения группы по ID
  const fetchGroupById = async (groupName) => {
    try {
      const res = await api.get(`accounts/api/groups/${groupName}/`);
      return res.data;
    } catch (e) {
      console.error(`Ошибка загрузки группы ${groupName}:`, e);
      return null;
    }
  };

  // Функция для получения курса по ID
  const fetchCourseById = async (courseId) => {
    try {
      const res = await api.get(`programs/api/course/${courseId}/`);
      return res.data;
    } catch (e) {
      console.error(`Ошибка загрузки курса ${courseId}:`, e);
      return null;
    }
  };

  // Основная функция для получения детальных данных
  const fetchDetailedAllocations = useCallback(async () => {
    setLoading(true);
    try {
      // Получаем базовые allocation данные
      const allocationsRes = await api.get("programs/api/teacher-allocations/");
      console.log("adilhan, you did good job", allocationsRes.data);
      const allocations = allocationsRes.data;

      // Для каждого allocation получаем детальную информацию
      const detailedAllocations = await Promise.all(
        allocations.map(async (allocation) => {
          let groupDetails = null;
          const courseDetails = [];

          // Получаем детали группы (если есть group_id)
          if (allocation.group_id) {
            groupDetails = await fetchGroupById(allocation.group_id);
          }

          // Получаем детали курсов
          if (allocation.courses && allocation.courses.length > 0) {
            for (const courseId of allocation.courses) {
              const courseDetail = await fetchCourseById(courseId);
              if (courseDetail) {
                courseDetails.push(courseDetail);
              }
            }
          }

          return {
            ...allocation,
            group_details: groupDetails,
            courses_details: courseDetails,
          };
        })
      );

      setMyCourses(detailedAllocations);
    } catch (e) {
      console.error("Ошибка загрузки детальных данных:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const fetchAllData = async () => {
      await Promise.all([fetchProfile(), fetchDetailedAllocations()]);
    };
    fetchAllData();
  }, [fetchDetailedAllocations]);

  const commonCardStyles =
    "rounded-xl p-8 shadow-lg transition-all duration-300 hover:shadow-xl";
  const teacherStyles =
    "bg-gradient-to-br from-green-500 to-teal-600 text-white";

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 flex items-center justify-center">
        <div className="text-xl">Загрузка данных...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Приветствие и профиль */}
        <div className="mb-8">
          <div className="text-center mb-6">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              Welcome back{profile ? `, ${profile.first_name}` : ""}!
            </h1>
            <p className="text-gray-600 text-lg">
              Here's your personalized dashboard
            </p>
          </div>

          {/* Карточка профиля */}
          {profile && (
            <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-6 mb-6">
              <div className="flex items-start gap-6">
                {/* Аватар */}
                <div className="flex-shrink-0">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center text-white text-3xl font-bold">
                    {profile.first_name?.[0]}
                    {profile.last_name?.[0]}
                  </div>
                </div>

                {/* Информация о профиле */}
                <div className="flex-grow">
                  <h2 className="text-2xl font-bold text-gray-800 mb-1">
                    {profile.full_name}
                  </h2>
                  <p className="text-green-600 font-medium mb-4">
                    {profile.role}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">📧 Email:</span>
                      <span className="text-gray-800">{profile.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">📱 Phone:</span>
                      <span className="text-gray-800">
                        {profile.phone || "Not provided"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">👤 Username:</span>
                      <span className="text-gray-800">{profile.username}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">⚧ Gender:</span>
                      <span className="text-gray-800">
                        {profile.gender === "M"
                          ? "Male"
                          : profile.gender === "F"
                          ? "Female"
                          : "Not specified"}
                      </span>
                    </div>
                    {profile.address && (
                      <div className="flex items-center gap-2 md:col-span-2">
                        <span className="text-gray-500">📍 Address:</span>
                        <span className="text-gray-800">{profile.address}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Основная карточка дашборда */}
        <div className="max-w-4xl mx-auto">
          <div className={`${commonCardStyles} ${teacherStyles}`}>
            <div className="flex items-center justify-between mb-6">
              <div className="text-4xl">👨‍🏫</div>
              <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium">
                Teacher
              </span>
            </div>
            <h2 className="text-3xl font-bold mb-4">Teacher Dashboard</h2>
            <p className="text-green-100 mb-6">
              Create courses, manage students, and grade assignments
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white/20 p-4 rounded-lg">
                <div className="text-2xl font-bold">{myCourses.length}</div>
                <div className="text-sm">Active Courses</div>
              </div>
              <div className="bg-white/20 p-4 rounded-lg">
                <div className="text-2xl font-bold">24</div>
                <div className="text-sm">Students</div>
              </div>
              <div className="bg-white/20 p-4 rounded-lg">
                <div className="text-2xl font-bold">12</div>
                <div className="text-sm">Assignments to Grade</div>
              </div>
            </div>
          </div>
        </div>

        {/* Быстрые действия */}
        <div className="max-w-4xl mx-auto mt-8 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <a
              href="/change-password"
              className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all duration-300 border border-slate-200 group"
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

        {/* Список курсов */}
        <div className="mt-8 max-w-4xl mx-auto">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">My Courses</h3>
          {myCourses.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              No courses found
            </div>
          ) : (
            <div className="grid gap-4">
              {myCourses.map((allocation) => (
                <div
                  key={allocation.id}
                  className="bg-white rounded-lg shadow-md p-6"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="text-xl font-semibold text-gray-800">
                        {allocation.courses_details?.[0]?.title || "Course"}
                      </h4>
                      <p className="text-gray-600">
                        Group: {allocation.group_name}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Link
                        to={`/teacher/grades/${allocation.id}`}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                      >
                        Manage Grades
                      </Link>
                      <Link
                        to={`/teacher/attendance/${allocation.id}`}
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                      >
                        Attendance
                      </Link>
                    </div>
                  </div>

                  {allocation.courses_details &&
                    allocation.courses_details.length > 0 && (
                      <div>
                        <h5 className="font-medium text-gray-700 mb-2">
                          Courses:
                        </h5>
                        <div className="grid gap-2">
                          {allocation.courses_details.map((course) => (
                            <div
                              key={course.id}
                              className="bg-gray-50 rounded-lg p-3"
                            >
                              <div className="font-medium">{course.title}</div>
                              <div className="text-sm text-gray-600">
                                Code: {course.code} | Credits: {course.credit} |
                                Level: {course.level}
                              </div>
                              {course.summary && (
                                <div className="text-sm text-gray-500 mt-1">
                                  {course.summary}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <a
        href="/logout"
        className="block text-center mt-8 text-blue-600 hover:text-blue-800"
      >
        logout
      </a>
    </div>
  );
};

export default TeacherDashboard;
