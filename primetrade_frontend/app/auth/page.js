'use client';
import { useState, useEffect, useRef } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ email: '', password: '', confirmPassword: '', name: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    const particleCount = 80;

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.z = Math.random() * 1000;
        this.size = Math.random() * 2 + 1;
        this.speedX = (Math.random() - 0.5) * 0.5;
        this.speedY = (Math.random() - 0.5) * 0.5;
        this.speedZ = Math.random() * 2 + 1;
      }

      update() {
        this.z -= this.speedZ;
        if (this.z <= 0) {
          this.z = 1000;
          this.x = Math.random() * canvas.width;
          this.y = Math.random() * canvas.height;
        }

        this.x += this.speedX;
        this.y += this.speedY;

        if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
        if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
      }

      draw() {
        const scale = 1000 / (1000 - this.z);
        const x2d = (this.x - canvas.width / 2) * scale + canvas.width / 2;
        const y2d = (this.y - canvas.height / 2) * scale + canvas.height / 2;
        const size = this.size * scale;

        // Validate values are finite before drawing
        if (!isFinite(x2d) || !isFinite(y2d) || !isFinite(size) || !isFinite(scale)) {
          return;
        }

        const opacity = Math.min(1, scale / 3);
        
        ctx.beginPath();
        ctx.arc(x2d, y2d, size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(99, 102, 241, ${opacity * 0.6})`;
        ctx.fill();

        const radiusGradient = size * 3;
        if (isFinite(radiusGradient) && radiusGradient > 0) {
          const gradient = ctx.createRadialGradient(x2d, y2d, 0, x2d, y2d, radiusGradient);
          gradient.addColorStop(0, `rgba(139, 92, 246, ${opacity * 0.3})`);
          gradient.addColorStop(1, 'rgba(139, 92, 246, 0)');
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(x2d, y2d, radiusGradient, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    let animationId;
    const animate = () => {
      ctx.fillStyle = 'rgba(15, 23, 42, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particles.forEach(particle => {
        particle.update();
        particle.draw();
      });

      particles.forEach((p1, i) => {
        particles.slice(i + 1).forEach(p2 => {
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 150) {
            const scale1 = 1000 / (1000 - p1.z);
            const scale2 = 1000 / (1000 - p2.z);
            const x1 = (p1.x - canvas.width / 2) * scale1 + canvas.width / 2;
            const y1 = (p1.y - canvas.height / 2) * scale1 + canvas.height / 2;
            const x2 = (p2.x - canvas.width / 2) * scale2 + canvas.width / 2;
            const y2 = (p2.y - canvas.height / 2) * scale2 + canvas.height / 2;

            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.strokeStyle = `rgba(139, 92, 246, ${(1 - dist / 150) * 0.15})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        });
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const validateForm = () => {
    const newErrors = {};

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!form.email) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(form.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!form.password) {
      newErrors.password = 'Password is required';
    } else if (form.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    } else if (form.password.length > 128) {
      newErrors.password = 'Password is too long';
    }

    if (!isLogin) {
      if (!form.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password';
      } else if (form.password !== form.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    if (!isLogin && form.name && form.name.length > 100) {
      newErrors.name = 'Name must be less than 100 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const route = isLogin ? '/api/auth/login' : '/api/auth/signup';
      const body = isLogin 
        ? { email: form.email, password: form.password }
        : { email: form.email, password: form.password, name: form.name };

      const res = await fetch(route, {
        method: 'POST',
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      const data = await res.json();

      if (res.ok) {
        if (!isLogin) {
          setServerError('');
          alert('Account created successfully! Please login.');
          setIsLogin(true);
          setForm({ email: form.email, password: '', confirmPassword: '', name: '' });
          setLoading(false);
          return;
        }
        
        setTimeout(() => {
          window.location.replace('/dashboard');
        }, 200);
      } else {
        setServerError(data.error || 'Authentication failed');
      }
    } catch (error) {
      setServerError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setErrors({});
    setServerError('');
    setForm({ email: '', password: '', confirmPassword: '', name: '' });
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      <canvas
        ref={canvasRef}
        className="fixed top-0 left-0 w-full h-full"
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
          zIndex: 0
        }}
      />

      <svg 
        className="fixed top-0 left-0 w-full h-full opacity-10"
        style={{ zIndex: 1 }}
      >
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(139, 92, 246, 0.3)" strokeWidth="0.5"/>
          </pattern>
          <radialGradient id="fadeGradient">
            <stop offset="0%" stopColor="white" stopOpacity="1"/>
            <stop offset="100%" stopColor="white" stopOpacity="0"/>
          </radialGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)"/>
      </svg>

      <div className="relative z-10 flex items-center justify-center min-h-screen py-12 px-4">
        <div className="w-full max-w-md">
          <div 
            className="bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-purple-100"
            style={{
              boxShadow: '0 8px 32px rgba(139, 92, 246, 0.3), 0 2px 8px rgba(0, 0, 0, 0.1)'
            }}
          >
            <h2 className="text-3xl font-bold text-center bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="text-center text-black mb-6">
              {isLogin ? 'Sign in to access your dashboard' : 'Sign up to get started'}
            </p>

            {serverError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                {serverError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div>
                  <label className="block text-sm font-medium text-black mb-1">
                    Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({...form, name: e.target.value})}
                    className={`w-full px-4 py-3 rounded-lg border text-black ${
                      errors.name ? 'border-red-500' : 'border-gray-300'
                    } focus:outline-none focus:ring-2 focus:ring-purple-500`}
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                  )}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => {
                    setForm({...form, email: e.target.value});
                    if (errors.email) setErrors({...errors, email: ''});
                  }}
                  className={`w-full px-4 py-3 rounded-lg border text-black ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  } focus:outline-none focus:ring-2 focus:ring-purple-500`}
                  autoComplete="email"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={(e) => {
                      setForm({...form, password: e.target.value});
                      if (errors.password) setErrors({...errors, password: ''});
                    }}
                    className={`w-full px-4 py-3 pr-12 rounded-lg border text-black ${
                      errors.password ? 'border-red-500' : 'border-gray-300'
                    } focus:outline-none focus:ring-2 focus:ring-purple-500`}
                    autoComplete={isLogin ? 'current-password' : 'new-password'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-black hover:text-black"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                )}
                {!isLogin && !errors.password && (
                  <p className="text-black text-sm mt-1">Minimum 6 characters</p>
                )}
              </div>

              {!isLogin && (
                <div>
                  <label className="block text-sm font-medium text-black mb-1">
                    Confirm Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={form.confirmPassword}
                      onChange={(e) => {
                        setForm({...form, confirmPassword: e.target.value});
                        if (errors.confirmPassword) setErrors({...errors, confirmPassword: ''});
                      }}
                      className={`w-full px-4 py-3 pr-12 rounded-lg border text-black ${
                        errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                      } focus:outline-none focus:ring-2 focus:ring-purple-500`}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-black hover:text-black"
                    >
                      {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
                  )}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-lg font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Register')}
              </button>

              <div className="text-center mt-4">
                <button
                  type="button"
                  onClick={toggleMode}
                  className="text-indigo-600 hover:text-indigo-700 text-sm font-medium hover:underline"
                >
                  {isLogin ? "New here? Create an account" : "Already have an account? Login"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}