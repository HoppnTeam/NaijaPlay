import Link from 'next/link'
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-green-600 to-green-800">
      <div className="container mx-auto px-4 py-16">
        <nav className="flex justify-between items-center mb-16">
          <h1 className="text-3xl font-bold text-white">NaijaPlay</h1>
          <div className="space-x-4">
            <Link href="/login">
              <Button variant="outline" className="text-white border-white hover:bg-white hover:text-green-800">
                Login
              </Button>
            </Link>
            <Link href="/signup">
              <Button className="bg-white text-green-800 hover:bg-gray-100">
                Sign Up
              </Button>
            </Link>
          </div>
        </nav>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-5xl font-bold text-white leading-tight">
              Nigeria's Premier Fantasy Football Platform
            </h2>
            <p className="text-xl text-white/90">
              Join thousands of Nigerian football fans in building your dream team, competing with friends, and winning exciting prizes!
            </p>
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Create and manage your ultimate football team</span>
              </div>
              <div className="flex items-center space-x-2 text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Compete in private leagues with friends</span>
              </div>
              <div className="flex items-center space-x-2 text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Place bets on real matches and win big</span>
              </div>
            </div>
            <div className="pt-4">
              <Link href="/signup">
                <Button size="lg" className="bg-white text-green-800 hover:bg-gray-100">
                  Get Started Now
                </Button>
              </Link>
            </div>
          </div>
          <div className="relative hidden md:block">
            <div className="absolute inset-0 bg-white/10 backdrop-blur-sm rounded-lg"></div>
            <div className="relative bg-white/5 p-8 rounded-lg border border-white/10">
              <h3 className="text-2xl font-bold text-white mb-4">Weekly Prizes</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center text-white">
                  <span>1st Place</span>
                  <span className="font-bold">₦100,000</span>
                </div>
                <div className="flex justify-between items-center text-white">
                  <span>2nd Place</span>
                  <span className="font-bold">₦50,000</span>
                </div>
                <div className="flex justify-between items-center text-white">
                  <span>3rd Place</span>
                  <span className="font-bold">₦25,000</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

