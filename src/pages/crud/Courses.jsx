import React, { useState, useEffect } from 'react';
import api from '../../api';


// Simple modal component
function Modal({ open, title, onClose, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl max-w-3xl w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button className="text-gray-500 hover:text-gray-700" onClick={onClose}>
            ✕
          </button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
}


function CourseAllocations() {
  const [allocations, setAllocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lecturers, setLecturers] = useState([]);
  const [availableCourses, setAvailableCourses] = useState([]);


  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const [selected, setSelected] = useState(null); // selected allocation for edit/detail

  // form state for create/edit
  const emptyForm = { id: null, name: "", lecturer: null, courses: [] };
  const [form, setForm] = useState(emptyForm);

  

  // helper to load list
  const fetchList = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("programs/course-allocations/");
      console.log("Loaded allocations:", res.data);
      console.log("Loaded allocations courses details:", res.data[0].courses_details[0].title);
      setAllocations(res.data || []);
    } catch (e) {
      console.error(e);
      setError("Не удалось загрузить назначения");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);
    const fetchLecturers = async () => {
    try {
      const res = await api.get("accounts/api/lecturers/"); 
      setLecturers(res.data || []);
    } catch (e) {
      console.error("Ошибка загрузки преподавателей:", e);
    }
  };

   const fetchCourses = async () => {
    try {
      const res = await api.get("programs/api/course/");
      setAvailableCourses(res.data || []);
    } catch (e) {
      console.error("Ошибка загрузки курсов:", e);
    }
  };

  useEffect(() => {
    fetchList();
    fetchLecturers();
    fetchCourses();
  }, []);



  // create
   const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        lecturer: form.lecturer,
        courses: form.courses,
      };
      const res = await api.post("programs/course-allocations/", payload);
      setAllocations((s) => [res.data, ...s]);
      setIsCreateOpen(false);
      setForm(emptyForm);
    } catch (err) {
      console.error(err);
      alert("Ошибка при создании. Проверьте поля и авторизацию.");
    }
  };

  // retrieve single
  const openDetail = async (id) => {
    try {
      const res = await api.get(`programs/course-allocations/${id}/`);
      setSelected(res.data);
      setIsDetailOpen(true);
    } catch (err) {
      console.error(err);
      alert("Не удалось получить данные");
    }
  };

  // open edit with data
  const openEdit = async (id) => {
    try {
      const res = await api.get(`programs/course-allocations/${id}/`);
      setForm({
        id: res.data.id,
        name: res.data.name || "",
        lecturer: res.data.lecturer || null,
        courses: res.data.courses || [],
      });
      setIsEditOpen(true);
    } catch (err) {
      console.error(err);
      alert("Не удалось загрузить данные для редактирования");
    }
  };

  // update (PUT)
  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const payload = { name: form.name, lecturer: form.lecturer, courses: form.courses };
      const res = await api.put(`/programs/course-allocations/${form.id}/`, payload);
      setAllocations((s) => s.map((it) => (it.id === res.data.id ? res.data : it)));
      setIsEditOpen(false);
      setForm(emptyForm);
    } catch (err) {
      console.error(err);
      alert("Ошибка при обновлении");
    }
  };

  // partial update (PATCH) — example: change name only
  const handlePatchName = async (id, newName) => {
    try {
      const res = await api.patch(`programs/course-allocations/${id}/`, { name: newName });
      setAllocations((s) => s.map((it) => (it.id === res.data.id ? res.data : it)));
    } catch (err) {
      console.error(err);
      alert("Ошибка при частичном обновлении");
    }
  };

  // delete
  const handleDelete = async (id) => {
    if (!confirm("Удалить назначение?")) return;
    try {
      await api.delete(`programs/course-allocations/${id}/`);
      setAllocations((s) => s.filter((it) => it.id !== id));
    } catch (err) {
      console.error(err);
      alert("Ошибка при удалении");
    }
  };

  // add courses to allocation
  const handleAddCourses = async (id, coursesToAdd) => {
    try {
      const res = await api.post(`programs/course-allocations/${id}/add_courses/`, { courses: coursesToAdd });
      setAllocations((s) => s.map((it) => (it.id === res.data.id ? res.data : it)));
      alert("Курсы добавлены");
    } catch (err) {
      console.error(err);
      alert("Ошибка при добавлении курсов");
    }
  };

  // remove courses
  const handleRemoveCourses = async (id, coursesToRemove) => {
    try {
      const res = await api.post(`programs/course-allocations/${id}/remove_courses/`, { courses: coursesToRemove });
      setAllocations((s) => s.map((it) => (it.id === res.data.id ? res.data : it)));
      alert("Курсы удалены");
    } catch (err) {
      console.error(err);
      alert("Ошибка при удалении курсов");
    }
  };

  // simple controlled inputs handler
  const onChange = (field) => (e) => {
    const value = e?.target ? e.target.value : e;
    setForm((f) => ({ ...f, [field]: value }));
  };

  // helper to toggle course in form.courses
  const toggleCourseInForm = (courseId) => {
    setForm((f) => {
      const exists = f.courses.includes(courseId);
      return { ...f, courses: exists ? f.courses.filter((c) => c !== courseId) : [...f.courses, courseId] };
    });
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Course Allocations</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setIsCreateOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            + Create
          </button>
          <button
            onClick={fetchList}
            className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <div>Загрузка...</div>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : allocations.length === 0 ? (
        <div className="text-gray-600">Нет назначений</div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lecturer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Courses</th>
                <th className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {allocations.map((a) => (
                <tr key={a.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{a.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {a.lecturer_name ? a.lecturer_name : "-"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                    {a.courses_details?.length > 0 ? (
                        <div className="flex flex-col gap-1">
                        {a.courses_details.map((course, index) => (
                            <div key={course.id || index} className="flex items-center justify-between bg-gray-50 px-2 py-1 rounded">
                            <span className="font-medium">{course.title}</span>
                            <span className="text-xs text-gray-500 ml-2">
                                ({course.code} - {course.credit} credits)
                            </span>
                            </div>
                        ))}
                        </div>
                    ) : (
                        <span className="text-gray-400">-</span>
                    )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex gap-2">
                        <button
                        onClick={() => openDetail(a.id)}
                        className="px-2 py-1 bg-gray-100 rounded hover:bg-gray-200 text-sm"
                        >
                        View
                        </button>
                        <button
                        onClick={() => openEdit(a.id)}
                        className="px-2 py-1 bg-yellow-100 rounded hover:bg-yellow-200 text-sm"
                        >
                        Edit
                        </button>
                        <button
                        onClick={() => handleDelete(a.id)}
                        className="px-2 py-1 bg-red-100 rounded hover:bg-red-200 text-sm"
                        >
                        Delete
                        </button>
                    </div>
                    </td>
                </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Modal */}
       <Modal open={isCreateOpen} title="Create Course Allocation" onClose={() => setIsCreateOpen(false)}>
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input 
              value={form.name} 
              onChange={onChange("name")} 
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" 
              required 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Lecturer</label>
            <select 
              value={form.lecturer || ""} 
              onChange={onChange("lecturer")} 
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            >
              <option value="">Select Lecturer</option>
              {lecturers.map((lecturer) => (
                <option key={lecturer.id} value={lecturer.id}>
                  {lecturer.full_name} 
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Courses</label>
            <div className="mt-2 max-h-40 overflow-y-auto border rounded-md p-2">
              {availableCourses.map((course) => (
                <div key={course.id} className="flex items-center mb-2">
                  <input
                    type="checkbox"
                    id={`course-${course.id}`}
                    checked={form.courses.includes(course.id)}
                    onChange={() => toggleCourseInForm(course.id)}
                    className="mr-2"
                  />
                  <label htmlFor={`course-${course.id}`} className="text-sm">
                    {course.code} - {course.title}
                  </label>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-1">Выберите курсы из списка</p>
          </div>

          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setIsCreateOpen(false)} className="px-4 py-2 rounded bg-gray-100">Cancel</button>
            <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white">Create</button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
<Modal open={isEditOpen} title="Edit Course Allocation" onClose={() => setIsEditOpen(false)}>
  <form onSubmit={handleUpdate} className="space-y-4">
    <div>
      <label className="block text-sm font-medium text-gray-700">Name</label>
      <input 
        value={form.name} 
        onChange={onChange("name")} 
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" 
        required 
      />
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700">Lecturer</label>
      <select 
        value={form.lecturer || ""} 
        onChange={onChange("lecturer")} 
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
      >
        <option value="">Select Lecturer</option>
        {lecturers.map((lecturer) => (
          <option key={lecturer.id} value={lecturer.id}>
            {lecturer.full_name} 
          </option>
        ))}
      </select>
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700">Courses</label>
      <div className="mt-2 max-h-40 overflow-y-auto border rounded-md p-2">
        {availableCourses.map((course) => (
          <div key={course.id} className="flex items-center mb-2">
            <input
              type="checkbox"
              id={`edit-course-${course.id}`}
              checked={form.courses.includes(course.id)}
              onChange={() => toggleCourseInForm(course.id)}
              className="mr-2"
            />
            <label htmlFor={`edit-course-${course.id}`} className="text-sm">
              {course.code} - {course.title}
            </label>
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-400 mt-1">Selected: {form.courses.length} courses</p>
    </div>

    <div className="flex justify-between items-center pt-4 border-t">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => {
            const add = prompt("Course IDs to add (comma separated):");
            if (!add) return;
            const ids = add.split(",").map((s) => Number(s.trim())).filter(Boolean);
            handleAddCourses(form.id, ids);
          }}
          className="px-3 py-2 rounded bg-green-100 hover:bg-green-200 text-sm"
        >
          + Add courses by ID
        </button>

        <button
          type="button"
          onClick={() => {
            const rem = prompt("Course IDs to remove (comma separated):");
            if (!rem) return;
            const ids = rem.split(",").map((s) => Number(s.trim())).filter(Boolean);
            handleRemoveCourses(form.id, ids);
          }}
          className="px-3 py-2 rounded bg-red-100 hover:bg-red-200 text-sm"
        >
          - Remove courses by ID
        </button>
      </div>

      <div className="flex gap-2">
        <button 
          type="button" 
          onClick={() => {
            setIsEditOpen(false);
            setForm(emptyForm);
          }} 
          className="px-4 py-2 rounded bg-gray-100 hover:bg-gray-200"
        >
          Cancel
        </button>
        <button 
          type="submit" 
          className="px-4 py-2 rounded bg-yellow-500 hover:bg-yellow-600 text-white"
        >
          Save Changes
        </button>
      </div>
    </div>
  </form>
</Modal>

      {/* Detail Modal */}
      <Modal open={isDetailOpen} title={`Allocation #${selected?.id || ""}`} onClose={() => setIsDetailOpen(false)}>
        {selected ? (
          <div className="space-y-3">
            <div>
              <strong>Name:</strong> {selected.name}
            </div>
            <div>
              <strong>Lecturer:</strong> {selected.lecturer?.name || selected.lecturer || "-"}
            </div>
            <div>
              <strong>Courses:</strong>
              <ul className="list-disc pl-6">
                {(selected.courses || []).map((c) => (
                  <li key={c.id || c}>{c.title || c}</li>
                ))}
              </ul>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  const newName = prompt("Новое имя:", selected.name);
                  if (!newName) return;
                  handlePatchName(selected.id, newName);
                }}
                className="px-3 py-2 rounded bg-blue-100"
              >
                Rename
              </button>

              <button
                onClick={() => {
                  setIsDetailOpen(false);
                  openEdit(selected.id);
                }}
                className="px-3 py-2 rounded bg-yellow-100"
              >
                Edit
              </button>

              <button onClick={() => handleDelete(selected.id)} className="px-3 py-2 rounded bg-red-100">
                Delete
              </button>
            </div>
          </div>
        ) : (
          <div>Loading...</div>
        )}
      </Modal>
    </div>
  );
}



const Courses = () => {
    const [courses, setCourses] = useState([]);
    const [programs, setPrograms] = useState([]);
    const [activeTab, setActiveTab] = useState('programs');
    const [newProgram, setNewProgram] = useState({ title: '', summary: '' });
    const [newCourse, setNewCourse] = useState({ 
        title: '', 
        code: '', 
        credit: 0, 
        summary: '', 
        program: '', 
        level: '', 
        year: 1, 
        semester: '', 
        is_elective: false 
    });
    const [editingProgram, setEditingProgram] = useState(null);
    const [editingCourse, setEditingCourse] = useState(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    
    // Предопределенные значения для выпадающих списков
    const levelOptions = ['Bachelor', 'Master', 'PhD', 'Foundation'];
    const yearOptions = [1, 2, 3, 4, 5];
    const semesterOptions = ['First', 'Second', 'Summer'];
    
    useEffect(() => {
        fetchPrograms();
        fetchCourses();
    }, []);

    // Programs API functions
    const fetchPrograms = async () => {
        try {
            const url = searchQuery ? `/programs/api?q=${searchQuery}` : '/programs/api';
            const response = await api.get(url);
            setPrograms(response.data);
        } catch (error) {
            console.error('Error fetching programs:', error);
        }
    };

    const programDetails = async (programId) => {
        try {
            const response = await api.get(`/programs/api/${programId}/`);
            alert(`Program Details:\nTitle: ${response.data.title}\nDescription: ${response.data.summary}`);
            console.log('Program Details:', response.data);
        } catch (error) {
            console.error('Error fetching program details:', error);
        }
    };

    const handleAddProgram = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post('/programs/api/', newProgram);
            setPrograms([...programs, response.data]);
            setNewProgram({ title: '', summary: '' });
            setShowAddForm(false);
            alert('Program added successfully!');
        } catch (error) {
            console.error('Error adding program:', error);
            alert('Error adding program. Please try again.');
        }
    };

    const handleEditProgram = async (e) => {
        e.preventDefault();
        try {
            const response = await api.put(`/programs/api/${editingProgram.id}/`, editingProgram);
            setPrograms(programs.map(program => 
                program.id === editingProgram.id ? response.data : program
            ));
            setEditingProgram(null);
            alert('Program updated successfully!');
        } catch (error) {
            console.error('Error updating program:', error);
            alert('Error updating program. Please try again.');
        }
    };

    const handleDeleteProgram = async (programId) => {
        if (window.confirm('Are you sure you want to delete this program?')) {
            try {
                await api.delete(`/programs/api/${programId}/`);
                setPrograms(programs.filter(program => program.id !== programId));
                alert('Program deleted successfully!');
            } catch (error) {
                console.error('Error deleting program:', error);
                alert('Error deleting program. Please try again.');
            }
        }
    };

    // Courses API functions
    const fetchCourses = async () => {
        try {
            const url = searchQuery ? `/programs/api/course/?q=${searchQuery}` : '/programs/api/course/';
            const response = await api.get(url);
            setCourses(response.data);
        } catch (error) {
            console.error('Error fetching courses:', error);
        }
    };

    const courseDetails = async (courseSlug) => {
        try {
            const response = await api.get(`/programs/api/course/${courseSlug}/`);
            alert(`Course Details:\nTitle: ${response.data.title}\nCode: ${response.data.code}\nCredits: ${response.data.credit}`);
            console.log('Course Details:', response.data);
        } catch (error) {
            console.error('Error fetching course details:', error);
        }
    };

    const handleAddCourse = async (e) => {
        e.preventDefault();
        try {
            // Преобразуем числовые поля
            const courseData = {
                ...newCourse,
                credit: parseInt(newCourse.credit),
                year: parseInt(newCourse.year),
                program: parseInt(newCourse.program)
            };
            
            console.log('Sending course data:', courseData);
            
            const response = await api.post('/programs/api/course/', courseData);
            setCourses([...courses, response.data]);
            setNewCourse({ 
                title: '', 
                code: '', 
                credit: 0, 
                summary: '', 
                program: '', 
                level: '', 
                year: 1, 
                semester: '', 
                is_elective: false 
            });
            setShowAddForm(false);
            alert('Course added successfully!');
        } catch (error) {
            console.error('Error adding course:', error);
            console.error('Error response:', error.response);
            alert(`Error adding course: ${error.response?.data ? JSON.stringify(error.response.data) : 'Please check all required fields'}`);
        }
    };

    const handleEditCourse = async (e) => {
        e.preventDefault();
        try {
            const courseData = {
                ...editingCourse,
                credit: parseInt(editingCourse.credit),
                year: parseInt(editingCourse.year),
                program: parseInt(editingCourse.program)
            };
            
            console.log('Updating course data:', courseData);
            
            const response = await api.put(`/programs/api/course/${editingCourse.slug}/`, courseData);
            setCourses(courses.map(course => 
                course.slug === editingCourse.slug ? response.data : course
            ));
            setEditingCourse(null);
            alert('Course updated successfully!');
        } catch (error) {
            console.error('Error updating course:', error);
            console.error('Error response:', error.response);
            alert(`Error updating course: ${error.response?.data ? JSON.stringify(error.response.data) : 'Please check all required fields'}`);
        }
    };

    const handleDeleteCourse = async (courseSlug, courseTitle) => {
        if (window.confirm(`Are you sure you want to delete the course "${courseTitle}"?`)) {
            try {
                await api.delete(`/programs/api/course/${courseSlug}/`);
                setCourses(courses.filter(course => course.slug !== courseSlug));
                alert('Course deleted successfully!');
            } catch (error) {
                console.error('Error deleting course:', error);
                alert('Error deleting course. Please try again.');
            }
        }
    };

    const startEditingProgram = (program) => {
        setEditingProgram({ ...program });
    };

    const startEditingCourse = (course) => {
        setEditingCourse({ ...course });
    };

    const cancelEditing = () => {
        setEditingProgram(null);
        setEditingCourse(null);
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (activeTab === 'programs') {
            fetchPrograms();
        } else {
            fetchCourses();
        }
    };

    const clearSearch = () => {
        setSearchQuery('');
        if (activeTab === 'programs') {
            fetchPrograms();
        } else {
            fetchCourses();
        }
    };

    return (
        <div>
            <h1>Academic Management</h1>
            <a href="/">вернуться домой</a>
            
            {/* Tab Navigation */}
            <div style={{ marginBottom: '20px' }}>
                <button 
                    onClick={() => setActiveTab('programs')}
                    style={{ 
                        marginRight: '10px', 
                        padding: '10px 20px',
                        backgroundColor: activeTab === 'programs' ? '#007bff' : '#f8f9fa',
                        color: activeTab === 'programs' ? 'white' : 'black',
                        border: '1px solid #dee2e6'
                    }}
                >
                    Programs
                </button>
                <button 
                    onClick={() => setActiveTab('courses')}
                    style={{ 
                        padding: '10px 20px',
                        backgroundColor: activeTab === 'courses' ? '#007bff' : '#f8f9fa',
                        color: activeTab === 'courses' ? 'white' : 'black',
                        border: '1px solid #dee2e6'
                    }}
                >
                    Courses
                </button>
            </div>

            {/* Search Form */}
            <form onSubmit={handleSearch} style={{ marginBottom: '20px' }}>
                <input
                    type="text"
                    placeholder={`Search ${activeTab}...`}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ marginRight: '10px', padding: '5px', width: '300px' }}
                />
                <button type="submit">Search</button>
                <button 
                    type="button" 
                    onClick={clearSearch}
                    style={{ marginLeft: '10px' }}
                >
                    Clear
                </button>
            </form>

            {/* Add Button */}
            <button 
                onClick={() => setShowAddForm(true)}
                style={{ marginBottom: '20px', padding: '10px' }}
            >
                Add New {activeTab === 'programs' ? 'Program' : 'Course'}
            </button>

            {/* Add Form */}
            {showAddForm && (
                <div style={{ border: '1px solid #ccc', padding: '20px', marginBottom: '20px' }}>
                    <h3>Add New {activeTab === 'programs' ? 'Program' : 'Course'}</h3>
                    {activeTab === 'programs' ? (
                        <form onSubmit={handleAddProgram}>
                            <div style={{ marginBottom: '10px' }}>
                                <input
                                    type="text"
                                    placeholder="Title"
                                    value={newProgram.title}
                                    onChange={(e) => setNewProgram({...newProgram, title: e.target.value})}
                                    required
                                    style={{ width: '100%', padding: '8px' }}
                                />
                            </div>
                            <div style={{ marginBottom: '10px' }}>
                                <textarea
                                    placeholder="Summary"
                                    value={newProgram.summary}
                                    onChange={(e) => setNewProgram({...newProgram, summary: e.target.value})}
                                    style={{ width: '100%', padding: '8px', minHeight: '80px' }}
                                />
                            </div>
                            <button type="submit">Add Program</button>
                            <button 
                                type="button" 
                                onClick={() => setShowAddForm(false)}
                                style={{ marginLeft: '10px' }}
                            >
                                Cancel
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleAddCourse}>
                            <div style={{ marginBottom: '10px' }}>
                                <input
                                    type="text"
                                    placeholder="Course Title"
                                    value={newCourse.title}
                                    onChange={(e) => setNewCourse({...newCourse, title: e.target.value})}
                                    required
                                    style={{ width: '100%', padding: '8px' }}
                                />
                            </div>
                            <div style={{ marginBottom: '10px' }}>
                                <input
                                    type="text"
                                    placeholder="Course Code"
                                    value={newCourse.code}
                                    onChange={(e) => setNewCourse({...newCourse, code: e.target.value})}
                                    required
                                    style={{ width: '100%', padding: '8px' }}
                                />
                            </div>
                            <div style={{ marginBottom: '10px' }}>
                                <input
                                    type="number"
                                    placeholder="Credits"
                                    value={newCourse.credit}
                                    onChange={(e) => setNewCourse({...newCourse, credit: parseInt(e.target.value) || 0})}
                                    required
                                    min="0"
                                    style={{ width: '100%', padding: '8px' }}
                                />
                            </div>
                            <div style={{ marginBottom: '10px' }}>
                                <textarea
                                    placeholder="Course Summary"
                                    value={newCourse.summary}
                                    onChange={(e) => setNewCourse({...newCourse, summary: e.target.value})}
                                    style={{ width: '100%', padding: '8px', minHeight: '60px' }}
                                />
                            </div>
                            <div style={{ marginBottom: '10px' }}>
                                <select
                                    value={newCourse.program}
                                    onChange={(e) => setNewCourse({...newCourse, program: e.target.value})}
                                    required
                                    style={{ width: '100%', padding: '8px' }}
                                >
                                    <option value="">Select Program</option>
                                    {programs.map(program => (
                                        <option key={program.id} value={program.id}>
                                            {program.title}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div style={{ marginBottom: '10px' }}>
                                <select
                                    value={newCourse.level}
                                    onChange={(e) => setNewCourse({...newCourse, level: e.target.value})}
                                    required
                                    style={{ width: '100%', padding: '8px' }}
                                >
                                    <option value="">Select Level</option>
                                    {levelOptions.map(level => (
                                        <option key={level} value={level}>
                                            {level}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div style={{ marginBottom: '10px' }}>
                                <select
                                    value={newCourse.year}
                                    onChange={(e) => setNewCourse({...newCourse, year: parseInt(e.target.value)})}
                                    required
                                    style={{ width: '100%', padding: '8px' }}
                                >
                                    <option value="">Select Year</option>
                                    {yearOptions.map(year => (
                                        <option key={year} value={year}>
                                            {year}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div style={{ marginBottom: '10px' }}>
                                <select
                                    value={newCourse.semester}
                                    onChange={(e) => setNewCourse({...newCourse, semester: e.target.value})}
                                    required
                                    style={{ width: '100%', padding: '8px' }}
                                >
                                    <option value="">Select Semester</option>
                                    {semesterOptions.map(semester => (
                                        <option key={semester} value={semester}>
                                            {semester}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div style={{ marginBottom: '10px' }}>
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={newCourse.is_elective}
                                        onChange={(e) => setNewCourse({...newCourse, is_elective: e.target.checked})}
                                        style={{ marginRight: '8px' }}
                                    />
                                    Is Elective Course
                                </label>
                            </div>
                            <button type="submit">Add Course</button>
                            <button 
                                type="button" 
                                onClick={() => setShowAddForm(false)}
                                style={{ marginLeft: '10px' }}
                            >
                                Cancel
                            </button>
                        </form>
                    )}
                </div>
            )}

            {/* Programs List */}
            {activeTab === 'programs' && (
                <div>
                    <h2>Programs</h2>
                    <ul>
                        {programs.map(program => (
                            <li key={program.id} style={{ marginBottom: '10px', padding: '10px', border: '1px solid #eee' }}>
                                {editingProgram && editingProgram.id === program.id ? (
                                    <form onSubmit={handleEditProgram}>
                                        <div style={{ marginBottom: '10px' }}>
                                            <input
                                                type="text"
                                                value={editingProgram.title}
                                                onChange={(e) => setEditingProgram({...editingProgram, title: e.target.value})}
                                                required
                                                style={{ width: '100%', padding: '5px' }}
                                            />
                                        </div>
                                        <div style={{ marginBottom: '10px' }}>
                                            <textarea
                                                value={editingProgram.summary || ''}
                                                onChange={(e) => setEditingProgram({...editingProgram, summary: e.target.value})}
                                                style={{ width: '100%', padding: '5px', minHeight: '60px' }}
                                            />
                                        </div>
                                        <button type="submit">Save</button>
                                        <button 
                                            type="button" 
                                            onClick={cancelEditing}
                                            style={{ marginLeft: '10px' }}
                                        >
                                            Cancel
                                        </button>
                                    </form>
                                ) : (
                                    <div>
                                        <strong>{program.title}</strong>
                                        {program.summary && (
                                            <p style={{ margin: '5px 0', fontSize: '0.9em', color: '#666' }}>
                                                {program.summary}
                                            </p>
                                        )}
                                        <div style={{ marginTop: '5px' }}>
                                            <button onClick={() => programDetails(program.id)}>Details</button>
                                            <button 
                                                onClick={() => startEditingProgram(program)}
                                                style={{ marginLeft: '5px' }}
                                            >
                                                Edit
                                            </button>
                                            <button 
                                                onClick={() => handleDeleteProgram(program.id)}
                                                style={{ marginLeft: '5px', backgroundColor: '#ff4444', color: 'white' }}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>
                    {programs.length === 0 && <p>No programs found.</p>}
                </div>
            )}

            {/* Courses List */}
            {activeTab === 'courses' && (
                <div>
                    <h2>Courses</h2>
                    <ul>
                        {courses.map(course => (
                            <li key={course.id} style={{ marginBottom: '10px', padding: '10px', border: '1px solid #eee' }}>
                                {editingCourse && editingCourse.id === course.id ? (
                                    <form onSubmit={handleEditCourse}>
                                        <div style={{ marginBottom: '10px' }}>
                                            <input
                                                type="text"
                                                placeholder="Title"
                                                value={editingCourse.title}
                                                onChange={(e) => setEditingCourse({...editingCourse, title: e.target.value})}
                                                required
                                                style={{ width: '100%', padding: '5px' }}
                                            />
                                        </div>
                                        <div style={{ marginBottom: '10px' }}>
                                            <input
                                                type="text"
                                                placeholder="Code"
                                                value={editingCourse.code}
                                                onChange={(e) => setEditingCourse({...editingCourse, code: e.target.value})}
                                                required
                                                style={{ width: '100%', padding: '5px' }}
                                            />
                                        </div>
                                        <div style={{ marginBottom: '10px' }}>
                                            <input
                                                type="number"
                                                placeholder="Credits"
                                                value={editingCourse.credit}
                                                onChange={(e) => setEditingCourse({...editingCourse, credit: parseInt(e.target.value) || 0})}
                                                required
                                                min="0"
                                                style={{ width: '100%', padding: '5px' }}
                                            />
                                        </div>
                                        <div style={{ marginBottom: '10px' }}>
                                            <textarea
                                                placeholder="Summary"
                                                value={editingCourse.summary || ''}
                                                onChange={(e) => setEditingCourse({...editingCourse, summary: e.target.value})}
                                                style={{ width: '100%', padding: '5px', minHeight: '60px' }}
                                            />
                                        </div>
                                        <div style={{ marginBottom: '10px' }}>
                                            <select
                                                value={editingCourse.program}
                                                onChange={(e) => setEditingCourse({...editingCourse, program: e.target.value})}
                                                required
                                                style={{ width: '100%', padding: '5px' }}
                                            >
                                                <option value="">Select Program</option>
                                                {programs.map(program => (
                                                    <option key={program.id} value={program.id}>
                                                        {program.title}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div style={{ marginBottom: '10px' }}>
                                            <select
                                                value={editingCourse.level}
                                                onChange={(e) => setEditingCourse({...editingCourse, level: e.target.value})}
                                                required
                                                style={{ width: '100%', padding: '5px' }}
                                            >
                                                <option value="">Select Level</option>
                                                {levelOptions.map(level => (
                                                    <option key={level} value={level}>
                                                        {level}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div style={{ marginBottom: '10px' }}>
                                            <select
                                                value={editingCourse.year}
                                                onChange={(e) => setEditingCourse({...editingCourse, year: parseInt(e.target.value)})}
                                                required
                                                style={{ width: '100%', padding: '5px' }}
                                            >
                                                <option value="">Select Year</option>
                                                {yearOptions.map(year => (
                                                    <option key={year} value={year}>
                                                        {year}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div style={{ marginBottom: '10px' }}>
                                            <select
                                                value={editingCourse.semester}
                                                onChange={(e) => setEditingCourse({...editingCourse, semester: e.target.value})}
                                                required
                                                style={{ width: '100%', padding: '5px' }}
                                            >
                                                <option value="">Select Semester</option>
                                                {semesterOptions.map(semester => (
                                                    <option key={semester} value={semester}>
                                                        {semester}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div style={{ marginBottom: '10px' }}>
                                            <label>
                                                <input
                                                    type="checkbox"
                                                    checked={editingCourse.is_elective}
                                                    onChange={(e) => setEditingCourse({...editingCourse, is_elective: e.target.checked})}
                                                    style={{ marginRight: '8px' }}
                                                />
                                                Is Elective Course
                                            </label>
                                        </div>
                                        <button type="submit">Save</button>
                                        <button 
                                            type="button" 
                                            onClick={cancelEditing}
                                            style={{ marginLeft: '10px' }}
                                        >
                                            Cancel
                                        </button>
                                    </form>
                                ) : (
                                    <div>
                                        <strong>{course.title} ({course.code})</strong>
                                        <div style={{ fontSize: '0.9em', color: '#666' }}>
                                            <div>Credits: {course.credit}</div>
                                            <div>Program: {course.program_name}</div>
                                            <div>Level: {course.level} | Year: {course.year} | Semester: {course.semester}</div>
                                            <div>Elective: {course.is_elective ? 'Yes' : 'No'}</div>
                                            {course.summary && <div>Summary: {course.summary}</div>}
                                        </div>
                                        <div style={{ marginTop: '5px' }}>
                                            <button onClick={() => courseDetails(course.slug)}>Details</button>
                                            <button 
                                                onClick={() => startEditingCourse(course)}
                                                style={{ marginLeft: '5px' }}
                                            >
                                                Edit
                                            </button>
                                            <button 
                                                onClick={() => handleDeleteCourse(course.slug, course.title)}
                                                style={{ marginLeft: '5px', backgroundColor: '#ff4444', color: 'white' }}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>
                    {courses.length === 0 && <p>No courses found.</p>}
                </div>
            )}
            <CourseAllocations/>
        </div>
    );
};

export default Courses;