'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { usePathname } from 'next/navigation'

export function Navigation() {
  const { data: session } = useSession()
  const pathname = usePathname()

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-gradient-primary">
              Ojas Skin Clinic
            </h1>
            <div className="ml-10 flex space-x-2">
              <Link 
                href="/dashboard" 
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  pathname === '/dashboard' 
                    ? 'text-white bg-gradient-to-r from-blue-600 to-indigo-600 shadow-md' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Dashboard
              </Link>
              <Link 
                href="/clients" 
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  pathname?.startsWith('/clients') 
                    ? 'text-white bg-gradient-to-r from-blue-600 to-indigo-600 shadow-md' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Clients
              </Link>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{session?.user?.name}</p>
              <p className="text-xs text-gray-500">{session?.user?.role}</p>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition shadow-md"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
