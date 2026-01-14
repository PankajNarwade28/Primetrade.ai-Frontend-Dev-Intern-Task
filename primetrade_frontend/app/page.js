import Navbar from '../app/components/Navbar';

export default function Home() {
  // In a real app, you'd check cookies/JWT here to set isLoggedIn
  const isLoggedIn = false; 

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar isLoggedIn={isLoggedIn} />
      <div className="container mx-auto text-center py-20 px-4">
        <h2 className="text-4xl font-extrabold text-gray-900 mb-4">
          Manage Your Tasks Efficiently
        </h2>
        <p className="text-lg text-gray-600 mb-8">
          A scalable web application built with Next.js, PostgreSQL, and JWT Authentication.
        </p>
        <div className="flex justify-center gap-4">
          <button className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold">
            Get Started
          </button>
        </div>
      </div>
    </main>
  );
}