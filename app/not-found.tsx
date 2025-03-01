import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { BrandLogo } from '@/components/ui/brand-logo'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="text-center space-y-6 max-w-md">
        <BrandLogo variant="large" />
        
        <h1 className="text-6xl font-bold text-gray-900">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700">Page Not Found</h2>
        
        <p className="text-gray-600">
          The page you are looking for doesn't exist or has been moved.
        </p>
        
        <div className="pt-6 flex justify-center space-x-4">
          <Button asChild>
            <Link href="/">
              Go Home
            </Link>
          </Button>
          <Button 
            variant="outline" 
            onClick={() => window.history.back()}
          >
            Go Back
          </Button>
        </div>
      </div>
    </div>
  )
} 