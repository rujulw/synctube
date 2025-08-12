export default function Navbar() {
    return (
      <nav className="bg-[#1e1f22] border-b border-purple-700 px-6 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-wide bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 bg-clip-text text-transparent animate-gradient">synctube</h1>
        <div className="space-x-4">
          <a href="/" className="text-gray-300 hover:text-purple-400 transition">Home</a>
          <a href="#about" className="text-gray-300 hover:text-purple-400 transition">About</a>
        </div>
      </nav>
    );
  }
  