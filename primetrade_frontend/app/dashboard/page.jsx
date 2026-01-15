'use client';
import { useEffect, useState } from "react";
import { 
  Plus, Edit2, Trash2, Search, CheckCircle, Clock, 
  FileText, User, TrendingUp, LogOut, X 
} from 'lucide-react';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [openProfileDialog, setOpenProfileDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    status: "pending",
  });
  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    currentPassword: "",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  useEffect(() => {
    fetchProfile();
    fetchTasks();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/profile");
      if (res.ok) {
        const data = await res.json();
        setUser(data.profile);
        setProfileForm({
          name: data.profile.name || "",
          email: data.profile.email,
          currentPassword: "",
        });
      } else if (res.status === 401) {
        window.location.href = '/auth';
      }
    } catch (err) {
      console.error("Error:", err);
    }
  };

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append("search", searchTerm);
      if (filterStatus) params.append("status", filterStatus);
      const res = await fetch(`/api/tasks?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setTasks(data.tasks);
      }
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => fetchTasks(), 300);
    return () => clearTimeout(timer);
  }, [searchTerm, filterStatus]);

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
    setTimeout(() => setSnackbar({ open: false, message: "", severity: "success" }), 4000);
  };

  const handleCreateTask = async () => {
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(taskForm),
      });
      if (res.ok) {
        setOpenDialog(false);
        setTaskForm({ title: "", description: "", status: "pending" });
        fetchTasks();
        showSnackbar("Task created successfully!");
      }
    } catch (err) {
      console.error("Error:", err);
    }
  };

  const handleUpdateTask = async () => {
    try {
      const res = await fetch(`/api/tasks/${editingTask.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(taskForm),
      });
      if (res.ok) {
        setOpenDialog(false);
        setEditingTask(null);
        setTaskForm({ title: "", description: "", status: "pending" });
        fetchTasks();
        showSnackbar("Task updated successfully!");
      }
    } catch (err) {
      console.error("Error:", err);
    }
  };

  const handleDeleteTask = async (id) => {
    if (!confirm("Delete this task?")) return;
    try {
      const res = await fetch(`/api/tasks/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchTasks();
        showSnackbar("Task deleted!", "info");
      }
    } catch (err) {
      console.error("Error:", err);
    }
  };

  const handleUpdateProfile = async () => {
    if (!profileForm.currentPassword) {
      showSnackbar("Enter password to update", "error");
      return;
    }

    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileForm),
      });
      
      if (res.ok) {
        const data = await res.json();
        setUser(data.profile);
        setOpenProfileDialog(false);
        setProfileForm({
          name: data.profile.name || "",
          email: data.profile.email,
          currentPassword: "",
        });
        showSnackbar("Profile updated!");
      }
    } catch (err) {
      console.error("Error:", err);
    }
  };

  const openEditDialog = (task) => {
    setEditingTask(task);
    setTaskForm({
      title: task.title,
      description: task.description || "",
      status: task.status,
    });
    setOpenDialog(true);
  };

  const openCreateDialog = () => {
    setEditingTask(null);
    setTaskForm({ title: "", description: "", status: "pending" });
    setOpenDialog(true);
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/auth";
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-800";
      case "in-progress": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed": return <CheckCircle size={16} />;
      case "in-progress": return <Clock size={16} />;
      default: return <FileText size={16} />;
    }
  };

  const completionRate = tasks.length > 0 
    ? Math.round((tasks.filter(t => t.status === "completed").length / tasks.length) * 100)
    : 0;

  if (loading && !user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile-First Navbar */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              TaskMaster
            </h1>
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={() => setOpenProfileDialog(true)}
                className="flex items-center gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center text-white font-semibold text-xs sm:text-sm">
                  {user?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || "U"}
                </div>
                <span className="hidden sm:inline text-sm text-black font-medium truncate max-w-[100px] md:max-w-none">
                  {user?.name || "User"}
                </span>
              </button>
              <button
                onClick={handleLogout}
                className="p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 text-black transition-colors"
                title="Logout"
              >
                <LogOut size={18} className="sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content with Proper Padding */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 text-black">
        
        {/* Hero Section - Mobile First */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl sm:rounded-2xl lg:rounded-3xl p-4 sm:p-6 lg:p-8 mb-4 sm:mb-6 lg:mb-8 text-white">
          <div className="flex flex-col gap-4 sm:gap-6">
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-xl sm:text-2xl lg:text-3xl font-bold flex-shrink-0">
                {user?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || "U"}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-1 break-words">
                  Welcome, {user?.name || "User"}! 👋
                </h2>
                <p className="text-xs sm:text-sm lg:text-base opacity-90 truncate">
                  {user?.email}
                </p>
              </div>
            </div>
            <button
              onClick={() => setOpenProfileDialog(true)}
              className="flex items-center justify-center gap-2 px-4 py-2.5 sm:py-3 bg-white/20 backdrop-blur-sm rounded-lg sm:rounded-xl hover:bg-white/30 transition-all font-medium text-sm sm:text-base"
            >
              <User size={18} />
              <span>Edit Profile</span>
            </button>
          </div>
        </div>

        {/* Stats Cards - Flexbox Equal Height, Mobile First */}
        <div className="flex flex-wrap gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6 lg:mb-8">
          <div className="flex-1 basis-[calc(50%-0.375rem)] sm:basis-[calc(50%-0.5rem)] lg:basis-[calc(25%-1.125rem)] min-w-0">
            <div className="bg-white rounded-lg sm:rounded-xl lg:rounded-2xl p-3 sm:p-4 lg:p-6 shadow-sm hover:shadow-md transition-all h-full">
              <div className="flex justify-between items-start gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] sm:text-xs lg:text-sm font-semibold text-black mb-1 sm:mb-2">
                    Total Tasks
                  </p>
                  <p className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-black truncate">
                    {tasks.length}
                  </p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-lg sm:rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <FileText className="text-blue-600 w-5 h-5 sm:w-6 sm:h-6" />
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 basis-[calc(50%-0.375rem)] sm:basis-[calc(50%-0.5rem)] lg:basis-[calc(25%-1.125rem)] min-w-0">
            <div className="bg-white rounded-lg sm:rounded-xl lg:rounded-2xl p-3 sm:p-4 lg:p-6 shadow-sm hover:shadow-md transition-all h-full">
              <div className="flex justify-between items-start gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] sm:text-xs lg:text-sm font-semibold text-black mb-1 sm:mb-2">
                    Completed
                  </p>
                  <p className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-black truncate">
                    {tasks.filter(t => t.status === "completed").length}
                  </p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-lg sm:rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="text-green-600 w-5 h-5 sm:w-6 sm:h-6" />
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 basis-[calc(50%-0.375rem)] sm:basis-[calc(50%-0.5rem)] lg:basis-[calc(25%-1.125rem)] min-w-0">
            <div className="bg-white rounded-lg sm:rounded-xl lg:rounded-2xl p-3 sm:p-4 lg:p-6 shadow-sm hover:shadow-md transition-all h-full">
              <div className="flex justify-between items-start gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] sm:text-xs lg:text-sm font-semibold text-black mb-1 sm:mb-2">
                    In Progress
                  </p>
                  <p className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-black truncate">
                    {tasks.filter(t => t.status === "in-progress").length}
                  </p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-lg sm:rounded-xl bg-yellow-50 flex items-center justify-center flex-shrink-0">
                  <Clock className="text-yellow-600 w-5 h-5 sm:w-6 sm:h-6" />
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 basis-[calc(50%-0.375rem)] sm:basis-[calc(50%-0.5rem)] lg:basis-[calc(25%-1.125rem)] min-w-0">
            <div className="bg-white rounded-lg sm:rounded-xl lg:rounded-2xl p-3 sm:p-4 lg:p-6 shadow-sm hover:shadow-md transition-all h-full">
              <div className="flex justify-between items-start gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] sm:text-xs lg:text-sm font-semibold text-black mb-1 sm:mb-2">
                    Completion
                  </p>
                  <p className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-black truncate">
                    {completionRate}%
                  </p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-lg sm:rounded-xl bg-purple-50 flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="text-purple-600 w-5 h-5 sm:w-6 sm:h-6" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tasks Section */}
        <div className="bg-white rounded-lg sm:rounded-xl lg:rounded-2xl p-4 sm:p-5 lg:p-6 xl:p-8 shadow-sm">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
            <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-black">Your Tasks</h3>
            <button
              onClick={openCreateDialog}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 sm:py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg sm:rounded-xl hover:shadow-lg transition-all font-medium text-sm sm:text-base"
            >
              <Plus size={18} />
              <span>Create Task</span>
            </button>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-black" size={18} />
                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm sm:text-base text-black placeholder:text-black"
                />
              </div>
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full sm:w-40 md:w-48 px-3 py-2.5 border border-gray-300 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-sm sm:text-base text-black"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          {/* Tasks List */}
          {loading ? (
            <div className="flex justify-center py-12 sm:py-16">
              <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-4 border-indigo-600 border-t-transparent"></div>
            </div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-12 sm:py-16">
              <FileText className="mx-auto text-black mb-3 sm:mb-4" size={48} />
              <h4 className="text-base sm:text-lg lg:text-xl font-semibold text-black mb-2">No tasks found</h4>
              <p className="text-sm sm:text-base text-black">Create your first task to get started!</p>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="border border-gray-200 rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-5 hover:shadow-md hover:border-indigo-300 transition-all"
                >
                  <div className="flex flex-col sm:flex-row justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-start gap-2 mb-2">
                        <h4 className="text-sm sm:text-base lg:text-lg font-semibold text-black break-words flex-1">
                          {task.title}
                        </h4>
                        <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${getStatusColor(task.status)}`}>
                          {getStatusIcon(task.status)}
                          <span className="capitalize whitespace-nowrap">{task.status.replace("-", " ")}</span>
                        </span>
                      </div>
                      {task.description && (
                        <p className="text-xs sm:text-sm lg:text-base text-black mb-2 sm:mb-3 break-words">
                          {task.description}
                        </p>
                      )}
                      <p className="text-[10px] sm:text-xs lg:text-sm text-black">
                        Created: {new Date(task.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex sm:flex-col gap-2 justify-end">
                      <button
                        onClick={() => openEditDialog(task)}
                        className="flex-1 sm:flex-none p-2 sm:p-2.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="flex-1 sm:flex-none p-2 sm:p-2.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Task Dialog */}
      {openDialog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 z-50">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-4 sm:p-6 flex justify-between items-center">
              <h3 className="text-lg sm:text-xl font-bold text-black">
                {editingTask ? "Edit Task" : "Create Task"}
              </h3>
              <button onClick={() => setOpenDialog(false)} className="p-2  text-black hover:bg-gray-100 rounded-lg">
                <X size={20} />
              </button>
            </div>
            <div className="p-4 sm:p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                  className="w-full px-4 py-2.5 sm:py-3 border rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm sm:text-base text-black placeholder:text-black"
                  placeholder="Task title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-2">Description</label>
                <textarea
                  value={taskForm.description}
                  onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2.5 sm:py-3 border rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none text-sm sm:text-base text-black placeholder:text-black"
                  placeholder="Task description"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-2">Status</label>
                <select
                  value={taskForm.status}
                  onChange={(e) => setTaskForm({ ...taskForm, status: e.target.value })}
                  className="w-full px-4 py-2.5 sm:py-3 border rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-sm sm:text-base text-black"
                >
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
            <div className="sticky bottom-0 bg-white border-t p-4 sm:p-6 flex gap-3">
              <button
                onClick={() => setOpenDialog(false)}
                className="flex-1 px-6 text-black py-2.5 sm:py-3 border rounded-lg sm:rounded-xl hover:bg-gray-50 font-medium text-sm sm:text-base"
              >
                Cancel
              </button>
              <button
                onClick={editingTask ? handleUpdateTask : handleCreateTask}
                className="flex-1 px-6 text-black py-2.5 sm:py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg sm:rounded-xl hover:shadow-lg font-medium text-sm sm:text-base"
              >
                {editingTask ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Profile Dialog */}
      {openProfileDialog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 z-50">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-4 sm:p-6 flex justify-between items-center">
              <h3 className="text-lg sm:text-xl font-bold">Edit Profile</h3>
              <button onClick={() => setOpenProfileDialog(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X size={20} />
              </button>
            </div>
            <div className="p-4 sm:p-6 space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs sm:text-sm text-blue-800">
                  Enter your current password to update profile
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-2">Name</label>
                <input
                  type="text"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  className="w-full px-4 py-2.5 sm:py-3 border rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm sm:text-base text-black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={profileForm.email}
                  onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                  className="w-full px-4 py-2.5 sm:py-3 border rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm sm:text-base text-black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={profileForm.currentPassword}
                  onChange={(e) => setProfileForm({ ...profileForm, currentPassword: e.target.value })}
                  className="w-full px-4 py-2.5 sm:py-3 border rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm sm:text-base text-black placeholder:text-black"
                  placeholder="Verify with password"
                />
              </div>
            </div>
            <div className="sticky bottom-0 bg-white border-t p-4 sm:p-6 flex gap-3">
              <button
                onClick={() => setOpenProfileDialog(false)}
                className="flex-1 px-6 py-2.5  text-black sm:py-3 border rounded-lg sm:rounded-xl hover:bg-gray-50 font-medium text-sm sm:text-base"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateProfile}
                className="flex-1 px-6 py-2.5 sm:py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg sm:rounded-xl hover:shadow-lg font-medium text-sm sm:text-base"
              >
                Update Profile  
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Snackbar */}
      {snackbar.open && (
        <div className={`fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 px-4 py-3 rounded-lg shadow-lg text-sm sm:text-base z-50  
          ${snackbar.severity === "success" ? "bg-green-600 text-white" : ""}
          ${snackbar.severity === "error" ? "bg-red-600 text-white" : ""}
          ${snackbar.severity === "info" ? "bg-blue-600 text-white" : ""}
        `}>
          {snackbar.message}
        </div>  
      )}
    </div>
  );
}