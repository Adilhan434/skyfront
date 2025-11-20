import React, { useState, useEffect } from "react";
import api from "../../api";

const AdminSchedule = () => {
  const [loading, setLoading] = useState(true);
  const [schedules, setSchedules] = useState([]);
  const [courses, setCourses] = useState([]);
  const [groups, setGroups] = useState([]);
  const [lessonTimes, setLessonTimes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [formData, setFormData] = useState({
    course: "",
    group: "",
    lesson_time: "",
    day: "Monday",
    date: "",
  });

  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      // Загружаем расписание
      const schedulesRes = await api.get("/attendance/schedules/");
      console.log("Schedules loaded:", schedulesRes.data);
      setSchedules(schedulesRes.data);

      // Загружаем курсы - используем правильный endpoint
      const coursesRes = await api.get("/programs/api/course/");
      console.log("Courses loaded:", coursesRes.data);
      // Проверяем формат данных
      const coursesData = Array.isArray(coursesRes.data)
        ? coursesRes.data
        : coursesRes.data.results || [];
      setCourses(coursesData);

      // Загружаем группы - используем правильный endpoint
      const groupsRes = await api.get("/accounts/api/groups/");
      console.log("Groups loaded:", groupsRes.data);
      // Проверяем формат данных
      const groupsData = Array.isArray(groupsRes.data)
        ? groupsRes.data
        : groupsRes.data.results || [];
      setGroups(groupsData);

      // Загружаем времена уроков
      const lessonTimesRes = await api.get("/attendance/lesson-times/");
      console.log("Lesson times loaded:", lessonTimesRes.data);
      const lessonTimesData = Array.isArray(lessonTimesRes.data)
        ? lessonTimesRes.data
        : lessonTimesRes.data.results || [];
      setLessonTimes(lessonTimesData);
    } catch (error) {
      console.error("Error loading data:", error);
      console.error("Error details:", error.response?.data);
      alert(
        `Ошибка загрузки данных: ${
          error.response?.data?.detail || error.message
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (schedule = null) => {
    if (schedule) {
      setEditingSchedule(schedule);
      setFormData({
        course: schedule.course,
        group: schedule.group,
        lesson_time: schedule.lesson_time || "",
        day: schedule.day,
        date: schedule.date || "",
      });
    } else {
      setEditingSchedule(null);
      setFormData({
        course: "",
        group: "",
        lesson_time: "",
        day: "Monday",
        date: "",
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingSchedule(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const data = {
        course: parseInt(formData.course),
        group: parseInt(formData.group),
        day: formData.day,
      };

      // Добавляем lesson_time если выбран
      if (formData.lesson_time) {
        data.lesson_time = parseInt(formData.lesson_time);
      }

      // Добавляем date если указан
      if (formData.date) {
        data.date = formData.date;
      }

      console.log("Submitting schedule data:", data);

      if (editingSchedule) {
        // Обновление
        const response = await api.put(
          `/attendance/schedules/${editingSchedule.id}/`,
          data
        );
        console.log("Update response:", response.data);
        alert("Расписание успешно обновлено!");
      } else {
        // Создание
        const response = await api.post("/attendance/schedules/", data);
        console.log("Create response:", response.data);
        alert("Расписание успешно создано!");
      }

      handleCloseModal();
      fetchAllData();
    } catch (error) {
      console.error("Error saving schedule:", error);
      console.error("Error response:", error.response?.data);

      // Более детальное сообщение об ошибке
      let errorMessage = "Ошибка при сохранении расписания";
      if (error.response?.data) {
        const errors = error.response.data;
        if (typeof errors === "object") {
          errorMessage +=
            ":\n" +
            Object.entries(errors)
              .map(
                ([key, value]) =>
                  `${key}: ${Array.isArray(value) ? value.join(", ") : value}`
              )
              .join("\n");
        } else {
          errorMessage += `: ${errors}`;
        }
      }
      alert(errorMessage);
    }
  };

  const handleDelete = async (scheduleId) => {
    if (!window.confirm("Вы уверены, что хотите удалить это занятие?")) {
      return;
    }

    try {
      await api.delete(`/attendance/schedules/${scheduleId}/`);
      console.log("Schedule deleted:", scheduleId);
      alert("Расписание успешно удалено!");
      fetchAllData();
    } catch (error) {
      console.error("Error deleting schedule:", error);
      console.error("Error response:", error.response?.data);
      alert(
        `Ошибка при удалении расписания: ${
          error.response?.data?.detail || error.message
        }`
      );
    }
  };

  // Группировка расписания по дням
  const schedulesByDay = daysOfWeek.reduce((acc, day) => {
    acc[day] = schedules
      .filter((s) => s.day === day)
      .sort((a, b) => {
        if (a.start < b.start) return -1;
        if (a.start > b.start) return 1;
        return a.order - b.order;
      });
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <div className="text-xl text-gray-600">Загрузка данных...</div>
        <div className="text-sm text-gray-500 mt-2">
          Получение расписания, курсов и групп
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Заголовок */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Управление расписанием
            </h1>
            <p className="text-gray-600">
              Создавайте и редактируйте расписание занятий
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={fetchAllData}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium"
              title="Обновить данные"
            >
              🔄 Обновить
            </button>
            <button
              onClick={() => handleOpenModal()}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              + Добавить занятие
            </button>
          </div>
        </div>

        {/* Статистика */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {schedules.length}
            </div>
            <div className="text-gray-600">Всего занятий</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {courses.length}
            </div>
            <div className="text-gray-600">Курсов</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {groups.length}
            </div>
            <div className="text-gray-600">Групп</div>
          </div>
        </div>

        {/* Расписание по дням */}
        <div className="space-y-6">
          {daysOfWeek.map((day) => (
            <div key={day} className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                {day}
              </h2>
              {schedulesByDay[day].length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  Нет занятий в этот день
                </div>
              ) : (
                <div className="grid gap-3">
                  {schedulesByDay[day].map((schedule) => (
                    <div
                      key={schedule.id}
                      className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-grow">
                          <h3 className="font-semibold text-lg text-gray-800">
                            {schedule.course_title}
                          </h3>
                          <div className="text-sm text-gray-600 mt-1">
                            <span className="font-medium">Код:</span>{" "}
                            {schedule.course_code}
                          </div>
                          <div className="text-sm text-gray-600">
                            <span className="font-medium">Группа:</span>{" "}
                            {schedule.group_name}
                          </div>
                          {schedule.start_time && schedule.end_time && (
                            <div className="text-sm text-gray-600">
                              <span className="font-medium">Время:</span>{" "}
                              {schedule.start_time} - {schedule.end_time}
                              {schedule.lesson_order && (
                                <span className="ml-2 bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs">
                                  Урок {schedule.lesson_order}
                                </span>
                              )}
                            </div>
                          )}
                          {schedule.schedule_date && (
                            <div className="text-sm text-gray-600">
                              <span className="font-medium">Дата:</span>{" "}
                              {new Date(schedule.schedule_date).toLocaleDateString('ru-RU')}
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleOpenModal(schedule)}
                            className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                          >
                            Изменить
                          </button>
                          <button
                            onClick={() => handleDelete(schedule.id)}
                            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                          >
                            Удалить
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Модальное окно */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold mb-4">
              {editingSchedule ? "Редактировать занятие" : "Добавить занятие"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Отладочная информация */}
              {courses.length === 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
                  ⚠️ Курсы не загружены. Проверьте консоль для деталей.
                </div>
              )}
              {groups.length === 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
                  ⚠️ Группы не загружены. Проверьте консоль для деталей.
                </div>
              )}
              {lessonTimes.length === 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
                  💡 Создайте времена уроков в разделе{" "}
                  <a href="/admin/lesson-times" className="underline font-semibold">
                    Управление временами уроков
                  </a>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Курс {courses.length > 0 && `(${courses.length} доступно)`}
                </label>
                <select
                  name="course"
                  value={formData.course}
                  onChange={handleInputChange}
                  required
                  disabled={courses.length === 0}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">
                    {courses.length === 0
                      ? "Курсы не найдены"
                      : "Выберите курс"}
                  </option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.title} ({course.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Группа {groups.length > 0 && `(${groups.length} доступно)`}
                </label>
                <select
                  name="group"
                  value={formData.group}
                  onChange={handleInputChange}
                  required
                  disabled={groups.length === 0}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">
                    {groups.length === 0
                      ? "Группы не найдены"
                      : "Выберите группу"}
                  </option>
                  {groups.map((group) => (
                    <option key={group.id} value={group.id}>
                      {group.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  День недели
                </label>
                <select
                  name="day"
                  value={formData.day}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {daysOfWeek.map((day) => (
                    <option key={day} value={day}>
                      {day}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Время урока {lessonTimes.length > 0 && `(${lessonTimes.length} доступно)`}
                </label>
                <select
                  name="lesson_time"
                  value={formData.lesson_time}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Не выбрано</option>
                  {lessonTimes
                    .sort((a, b) => a.order - b.order)
                    .map((lt) => (
                      <option key={lt.id} value={lt.id}>
                        Урок {lt.order}: {lt.start_time.slice(0, 5)} - {lt.end_time.slice(0, 5)}
                      </option>
                    ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Опционально. Время урока определяет начало и конец занятия.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Дата урока
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Опционально. Укажите конкретную дату урока.
                </p>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingSchedule ? "Сохранить" : "Создать"}
                </button>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                >
                  Отмена
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSchedule;
