"use client";
import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import {
  Container,
  Paper,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Chip,
  Box,
  Alert,
  CircularProgress,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Grid,
  Card,
  CardContent,
  Fade,
  Slide,
  Snackbar,
  Avatar,
  Divider,
  Tooltip,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Assignment as AssignmentIcon,
  Person as PersonIcon,
  TrendingUp as TrendingUpIcon,
  Close as CloseIcon,
  Logout as LogoutIcon,
} from "@mui/icons-material";

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
        // Unauthorized - redirect to login
        window.location.href = '/auth';
      } else {
        setError("Failed to fetch profile. Refreshing page...");
        setTimeout(() => window.location.reload(), 2000);
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
      setError("Network error. Refreshing page...");
      setTimeout(() => window.location.reload(), 2000);
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
        setError("");
      } else if (res.status === 401) {
        // Unauthorized - redirect to login
        window.location.href = '/auth';
      } else {
        setError("Failed to fetch tasks. Refreshing page...");
        setTimeout(() => window.location.reload(), 2000);
      }
    } catch (err) {
      console.error("Network error:", err);
      setError("Network error. Refreshing page...");
      setTimeout(() => window.location.reload(), 2000);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTasks();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, filterStatus]);

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
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
      } else {
        const data = await res.json();
        setError(data.error);
      }
    } catch (err) {
      console.error("Error creating task:", err);
      setError("Network error. Refreshing page...");
      setTimeout(() => window.location.reload(), 2000);
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
      } else {
        const data = await res.json();
        setError(data.error);
      }
    } catch (err) {
      console.error("Error updating task:", err);
      setError("Network error. Refreshing page...");
      setTimeout(() => window.location.reload(), 2000);
    }
  };

  const handleDeleteTask = async (id) => {
    if (!confirm("Are you sure you want to delete this task?")) return;
    try {
      const res = await fetch(`/api/tasks/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchTasks();
        showSnackbar("Task deleted successfully!", "info");
      } else {
        setError("Failed to delete task");
      }
    } catch (err) {
      console.error("Error deleting task:", err);
      setError("Network error. Refreshing page...");
      setTimeout(() => window.location.reload(), 2000);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      // Validate current password is provided
      if (!profileForm.currentPassword) {
        setError("Please enter your current password to update profile");
        return;
      }

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
        setError("");
        showSnackbar("Profile updated successfully!");
      } else {
        const data = await res.json();
        setError(data.error);
      }
    } catch (err) {
      setError("Failed to update profile");
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
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      window.location.href = "/auth";
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "success";
      case "in-progress":
        return "warning";
      default:
        return "default";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return <CheckCircleIcon />;
      case "in-progress":
        return <ScheduleIcon />;
      default:
        return <AssignmentIcon />;
    }
  };

  const completionRate = tasks.length > 0 
    ? Math.round((tasks.filter((t) => t.status === "completed").length / tasks.length) * 100)
    : 0;

  if (loading && !user) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <>
      <Navbar user={user} onLogout={handleLogout} />
      <Box sx={{ bgcolor: "#f5f7fa", minHeight: "100vh", pb: 6 }}>
        <Container maxWidth="lg" sx={{ pt: 4 }}>
          {/* Hero Section */}
          <Fade in timeout={800}>
            <Paper
              elevation={0}
              sx={{
                p: 4,
                mb: 4,
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "white",
                borderRadius: 3,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Avatar sx={{ width: 64, height: 64, bgcolor: "rgba(255,255,255,0.2)", fontSize: "2rem" }}>
                    {user?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || "U"}
                  </Avatar>
                  <Box>
                    <Typography variant="h4" fontWeight="700" gutterBottom>
                      Welcome back, {user?.name || "User"}! 👋
                    </Typography>
                    <Typography variant="body1" sx={{ opacity: 0.9 }}>
                      {user?.email}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: "flex", gap: 2 }}>
                  <Button
                    variant="contained"
                    startIcon={<PersonIcon />}
                    onClick={() => setOpenProfileDialog(true)}
                    sx={{
                      bgcolor: "rgba(255,255,255,0.2)",
                      backdropFilter: "blur(10px)",
                      "&:hover": { bgcolor: "rgba(255,255,255,0.3)" },
                      borderRadius: 2,
                      px: 3,
                    }}
                  >
                    Edit Profile
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<LogoutIcon />}
                    onClick={handleLogout}
                    sx={{
                      bgcolor: "rgba(255,255,255,0.15)",
                      backdropFilter: "blur(10px)",
                      "&:hover": { bgcolor: "rgba(255,255,255,0.25)" },
                      borderRadius: 2,
                      px: 3,
                    }}
                  >
                    Logout
                  </Button>
                </Box>
              </Box>
            </Paper>
          </Fade>

          {/* Stats Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Slide direction="up" in timeout={600}>
                <Card sx={{ borderRadius: 3, boxShadow: "0 4px 20px rgba(0,0,0,0.08)", transition: "transform 0.2s", "&:hover": { transform: "translateY(-4px)" } }}>
                  <CardContent>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <Box>
                        <Typography color="text.secondary" variant="body2" fontWeight="600">
                          Total Tasks
                        </Typography>
                        <Typography variant="h4" fontWeight="700" sx={{ mt: 1 }}>
                          {tasks.length}
                        </Typography>
                      </Box>
                      <Avatar sx={{ bgcolor: "#e3f2fd", color: "#1976d2", width: 56, height: 56 }}>
                        <AssignmentIcon />
                      </Avatar>
                    </Box>
                  </CardContent>
                </Card>
              </Slide>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Slide direction="up" in timeout={700}>
                <Card sx={{ borderRadius: 3, boxShadow: "0 4px 20px rgba(0,0,0,0.08)", transition: "transform 0.2s", "&:hover": { transform: "translateY(-4px)" } }}>
                  <CardContent>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <Box>
                        <Typography color="text.secondary" variant="body2" fontWeight="600">
                          Completed
                        </Typography>
                        <Typography variant="h4" fontWeight="700" sx={{ mt: 1 }}>
                          {tasks.filter((t) => t.status === "completed").length}
                        </Typography>
                      </Box>
                      <Avatar sx={{ bgcolor: "#e8f5e9", color: "#2e7d32", width: 56, height: 56 }}>
                        <CheckCircleIcon />
                      </Avatar>
                    </Box>
                  </CardContent>
                </Card>
              </Slide>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Slide direction="up" in timeout={800}>
                <Card sx={{ borderRadius: 3, boxShadow: "0 4px 20px rgba(0,0,0,0.08)", transition: "transform 0.2s", "&:hover": { transform: "translateY(-4px)" } }}>
                  <CardContent>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <Box>
                        <Typography color="text.secondary" variant="body2" fontWeight="600">
                          In Progress
                        </Typography>
                        <Typography variant="h4" fontWeight="700" sx={{ mt: 1 }}>
                          {tasks.filter((t) => t.status === "in-progress").length}
                        </Typography>
                      </Box>
                      <Avatar sx={{ bgcolor: "#fff3e0", color: "#e65100", width: 56, height: 56 }}>
                        <ScheduleIcon />
                      </Avatar>
                    </Box>
                  </CardContent>
                </Card>
              </Slide>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Slide direction="up" in timeout={900}>
                <Card sx={{ borderRadius: 3, boxShadow: "0 4px 20px rgba(0,0,0,0.08)", transition: "transform 0.2s", "&:hover": { transform: "translateY(-4px)" } }}>
                  <CardContent>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <Box>
                        <Typography color="text.secondary" variant="body2" fontWeight="600">
                          Completion Rate
                        </Typography>
                        <Typography variant="h4" fontWeight="700" sx={{ mt: 1 }}>
                          {completionRate}%
                        </Typography>
                      </Box>
                      <Avatar sx={{ bgcolor: "#f3e5f5", color: "#7b1fa2", width: 56, height: 56 }}>
                        <TrendingUpIcon />
                      </Avatar>
                    </Box>
                  </CardContent>
                </Card>
              </Slide>
            </Grid>
          </Grid>

          {/* Tasks Section */}
          <Fade in timeout={1000}>
            <Paper elevation={0} sx={{ p: 4, borderRadius: 3, boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3, flexWrap: "wrap", gap: 2 }}>
                <Typography variant="h5" fontWeight="700">
                  Your Tasks
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={openCreateDialog}
                  sx={{
                    borderRadius: 2,
                    px: 3,
                    py: 1.2,
                    textTransform: "none",
                    fontSize: "1rem",
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    boxShadow: "0 4px 12px rgba(102, 126, 234, 0.4)",
                    "&:hover": {
                      boxShadow: "0 6px 16px rgba(102, 126, 234, 0.6)",
                    },
                  }}
                >
                  Create Task
                </Button>
              </Box>

              <Divider sx={{ mb: 3 }} />

              {/* Search and Filter */}
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} md={8}>
                  <TextField
                    fullWidth
                    placeholder="Search tasks..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                      startAdornment: <SearchIcon sx={{ mr: 1, color: "text.secondary" }} />,
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                        bgcolor: "#f8f9fa",
                        "&:hover": { bgcolor: "#fff" },
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth>
                    <InputLabel>Filter Status</InputLabel>
                    <Select
                      value={filterStatus}
                      label="Filter Status"
                      onChange={(e) => setFilterStatus(e.target.value)}
                      sx={{ borderRadius: 2, bgcolor: "#f8f9fa" }}
                    >
                      <MenuItem value="">All</MenuItem>
                      <MenuItem value="pending">Pending</MenuItem>
                      <MenuItem value="in-progress">In Progress</MenuItem>
                      <MenuItem value="completed">Completed</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              {/* Tasks List */}
              {loading ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
                  <CircularProgress />
                </Box>
              ) : tasks.length === 0 ? (
                <Box sx={{ textAlign: "center", py: 8 }}>
                  <AssignmentIcon sx={{ fontSize: 80, color: "text.secondary", opacity: 0.3, mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    No tasks found
                  </Typography>
                  <Typography color="text.secondary" sx={{ mb: 3 }}>
                    Create your first task to get started!
                  </Typography>
                </Box>
              ) : (
                <Grid container spacing={2}>
                  {tasks.map((task, index) => (
                    <Grid item xs={12} key={task.id}>
                      <Slide direction="up" in timeout={200 + index * 100}>
                        <Card
                          sx={{
                            borderRadius: 2,
                            border: "1px solid #e0e0e0",
                            transition: "all 0.3s",
                            "&:hover": {
                              boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                              transform: "translateY(-2px)",
                              borderColor: "#667eea",
                            },
                          }}
                        >
                          <CardContent>
                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 2 }}>
                              <Box sx={{ flex: 1 }}>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
                                  <Typography variant="h6" fontWeight="600">
                                    {task.title}
                                  </Typography>
                                  <Chip
                                    icon={getStatusIcon(task.status)}
                                    label={task.status.replace("-", " ")}
                                    color={getStatusColor(task.status)}
                                    size="small"
                                    sx={{ textTransform: "capitalize", fontWeight: 600 }}
                                  />
                                </Box>
                                {task.description && (
                                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                    {task.description}
                                  </Typography>
                                )}
                                <Typography variant="caption" color="text.secondary">
                                  Created: {new Date(task.created_at).toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                  })}
                                </Typography>
                              </Box>
                              <Box sx={{ display: "flex", gap: 1 }}>
                                <Tooltip title="Edit">
                                  <IconButton
                                    onClick={() => openEditDialog(task)}
                                    size="small"
                                    sx={{
                                      bgcolor: "#e3f2fd",
                                      color: "#1976d2",
                                      "&:hover": { bgcolor: "#1976d2", color: "#fff" },
                                    }}
                                  >
                                    <EditIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Delete">
                                  <IconButton
                                    onClick={() => handleDeleteTask(task.id)}
                                    size="small"
                                    sx={{
                                      bgcolor: "#ffebee",
                                      color: "#d32f2f",
                                      "&:hover": { bgcolor: "#d32f2f", color: "#fff" },
                                    }}
                                  >
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            </Box>
                          </CardContent>
                        </Card>
                      </Slide>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Paper>
          </Fade>
        </Container>

        {/* Task Create/Edit Dialog */}
        <Dialog
          open={openDialog}
          onClose={() => setOpenDialog(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{ sx: { borderRadius: 3 } }}
        >
          <DialogTitle sx={{ pb: 1, fontSize: "1.5rem", fontWeight: 700 }}>
            {editingTask ? "Edit Task" : "Create New Task"}
          </DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              label="Task Title"
              fullWidth
              value={taskForm.title}
              onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
              margin="normal"
              required
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
            />
            <TextField
              label="Description"
              fullWidth
              value={taskForm.description}
              onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
              margin="normal"
              multiline
              rows={3}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Status</InputLabel>
              <Select
                value={taskForm.status}
                label="Status"
                onChange={(e) => setTaskForm({ ...taskForm, status: e.target.value })}
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="in-progress">In Progress</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button onClick={() => setOpenDialog(false)} sx={{ borderRadius: 2 }}>
              Cancel
            </Button>
            <Button
              onClick={editingTask ? handleUpdateTask : handleCreateTask}
              variant="contained"
              sx={{
                borderRadius: 2,
                px: 3,
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              }}
            >
              {editingTask ? "Update" : "Create"}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Profile Edit Dialog */}
        <Dialog
          open={openProfileDialog}
          onClose={() => setOpenProfileDialog(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{ sx: { borderRadius: 3 } }}
        >
          <DialogTitle sx={{ pb: 1, fontSize: "1.5rem", fontWeight: 700 }}>
            Edit Profile
          </DialogTitle>
          <DialogContent>
            <Alert severity="info" sx={{ mb: 2 }}>
              Enter your current password to update your profile information
            </Alert>
            <TextField
              label="Name"
              fullWidth
              value={profileForm.name}
              onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
              margin="normal"
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
            />
            <TextField
              label="Email"
              fullWidth
              value={profileForm.email}
              onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
              margin="normal"
              type="email"
              required
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
            />
            <TextField
              label="Current Password"
              fullWidth
              value={profileForm.currentPassword}
              onChange={(e) => setProfileForm({ ...profileForm, currentPassword: e.target.value })}
              margin="normal"
              type="password"
              required
              placeholder="Enter your password to verify"
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
              helperText="Required to verify it's you"
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button onClick={() => setOpenProfileDialog(false)} sx={{ borderRadius: 2 }}>
              Cancel
            </Button>
            <Button
              onClick={handleUpdateProfile}
              variant="contained"
              sx={{
                borderRadius: 2,
                px: 3,
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              }}
            >
              Update Profile
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar for success messages */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        >
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
            sx={{ borderRadius: 2 }}
            variant="filled"
          >
            {snackbar.message}
          </Alert>
        </Snackbar>

        {/* Error Snackbar */}
        <Snackbar
          open={!!error}
          autoHideDuration={6000}
          onClose={() => setError("")}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        >
          <Alert
            onClose={() => setError("")}
            severity="error"
            sx={{ borderRadius: 2 }}
            variant="filled"
          >
            {error}
          </Alert>
        </Snackbar>
      </Box>
    </>
  );
}