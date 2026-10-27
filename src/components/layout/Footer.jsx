import { Link } from 'react-router-dom'

export function Footer() {
  return (
    <footer className="bg-navy-900 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="h-8 w-8 rounded-lg bg-saffron-500 flex items-center justify-center">
                <span className="text-white text-sm font-bold">JS</span>
              </div>
              <span className="font-bold text-lg">JanSight</span>
            </div>
            <p className="text-navy-200 text-sm leading-relaxed">
              One Photo. One Report. A Better India.
            </p>
            <p className="text-navy-300 text-xs mt-3">
              ⚠️ This is a civic-tech prototype. Reports are not connected to official government systems unless explicitly configured.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-3 text-sm uppercase tracking-wider text-navy-300">Citizens</h4>
            <ul className="space-y-2 text-sm text-navy-200">
              <li><Link to="/report" className="hover:text-white transition-colors">Report an Issue</Link></li>
              <li><Link to="/map" className="hover:text-white transition-colors">View Map</Link></li>
              <li><Link to="/my-reports" className="hover:text-white transition-colors">My Reports</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-3 text-sm uppercase tracking-wider text-navy-300">Info</h4>
            <ul className="space-y-2 text-sm text-navy-200">
              <li><span>Powered by Supabase + Gemini AI</span></li>
              <li><span>Maps: OpenStreetMap</span></li>
              <li><span>Made with ❤️ for India</span></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-navy-800 text-center text-xs text-navy-400">
          © {new Date().getFullYear()} JanSight · Civic Issue Reporting Platform · India
        </div>
      </div>
    </footer>
  )
}
