import Navbar from "../components/Navbar";

export default function Dashboard() {
  const user = { email: "pankaj@example.com", name: "Pankaj Narwade" }; // Mock data

  return (
    <main className="min-h-screen bg-gray-100">
      <Navbar isLoggedIn={true} userEmail={user.email} />
      
      <div className="container mx-auto p-6">
        <header className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800">User Dashboard</h2>
          <p className="text-gray-600">Welcome back, {user.name}!</p>
        </header>

        {/* Stats/Info Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-gray-500 text-sm font-medium">Total Tasks</h3>
            <p className="text-3xl font-bold">12</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-gray-500 text-sm font-medium">Status</h3>
            <p className="text-green-500 font-bold">Active Profile</p>
          </div>
        </div>

        {/* Sample Entity CRUD Section */}
        <section className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">Your Recent Tasks</h3>
            <button className="bg-green-600 text-white px-4 py-2 rounded text-sm">
              + Create New Task
            </button>
          </div>
          
          <div className="border-t pt-4">
            {/* Table or List would go here */}
            <p className="text-gray-500 italic text-center py-10">
              No tasks found. Start by creating one!
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}