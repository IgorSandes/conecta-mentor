export default function Footer() {
  return (
    <footer className="bg-gray-600 text-white py-4 w-full">
      <div className="container mx-auto px-4 flex justify-center gap-6">
        <a
          href="https://facebook.com"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-blue-400 transition"
        >
          Facebook
        </a>
        <a
          href="https://linkedin.com"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-blue-300 transition"
        >
          LinkedIn
        </a>
        <a
          href="https://github.com"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-gray-400 transition"
        >
          GitHub
        </a>
      </div>
    </footer>
  );
}
