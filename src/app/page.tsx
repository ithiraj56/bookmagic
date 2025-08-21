'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowRightIcon, DocumentTextIcon, BookOpenIcon, PrinterIcon } from '@heroicons/react/24/outline'
import { useMockAuth } from '@/lib/mock-auth'

export default function HomePage() {
  const { user, isLoading } = useMockAuth()
  const router = useRouter()

  useEffect(() => {
    // Redirect authenticated users to dashboard
    if (!isLoading && user) {
      router.push('/app/dashboard')
    }
  }, [user, isLoading, router])

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // Don't show landing page if user is authenticated (will redirect)
  if (user) {
    return null
  }

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="relative isolate px-6 pt-14 lg:px-8">
        <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
          <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-blue-400 to-purple-600 opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" />
        </div>
        
        <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Professional Book Formatting in 
              <span className="text-blue-600"> Minutes</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Transform your manuscripts into beautiful EPUBs and print-ready PDFs with our professional formatting templates. 
              No design skills required.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                href="/auth/login"
                className="rounded-md bg-blue-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              >
                Get Started
                <ArrowRightIcon className="ml-2 h-4 w-4 inline" />
              </Link>
              <a href="#features" className="text-sm font-semibold leading-6 text-gray-900">
                Learn more <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-base font-semibold leading-7 text-blue-600">Everything you need</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Professional publishing tools
            </p>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Upload your manuscript and get store-ready files in minutes. Our templates are designed by 
              professional book designers and tested with major retailers.
            </p>
          </div>
          
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-2 lg:gap-y-16">
              <div className="relative pl-16">
                <dt className="text-base font-semibold leading-7 text-gray-900">
                  <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
                    <DocumentTextIcon className="h-6 w-6 text-white" aria-hidden="true" />
                  </div>
                  Multiple Format Support
                </dt>
                <dd className="mt-2 text-base leading-7 text-gray-600">
                  Upload .docx, .md, or .rtf files and get perfectly formatted output every time.
                </dd>
              </div>
              
              <div className="relative pl-16">
                <dt className="text-base font-semibold leading-7 text-gray-900">
                  <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
                    <BookOpenIcon className="h-6 w-6 text-white" aria-hidden="true" />
                  </div>
                  EPUB 3 Compliant
                </dt>
                <dd className="mt-2 text-base leading-7 text-gray-600">
                  Generate clean, valid EPUBs that pass epubcheck and work on all major e-readers.
                </dd>
              </div>
              
              <div className="relative pl-16">
                <dt className="text-base font-semibold leading-7 text-gray-900">
                  <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
                    <PrinterIcon className="h-6 w-6 text-white" aria-hidden="true" />
                  </div>
                  Print-Ready PDFs
                </dt>
                <dd className="mt-2 text-base leading-7 text-gray-600">
                  Get exact trim size PDFs ready for print-on-demand services like KDP and IngramSpark.
                </dd>
              </div>
              
              <div className="relative pl-16">
                <dt className="text-base font-semibold leading-7 text-gray-900">
                  <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
                    <ArrowRightIcon className="h-6 w-6 text-white" aria-hidden="true" />
                  </div>
                  Complete Package
                </dt>
                <dd className="mt-2 text-base leading-7 text-gray-600">
                  Download a ZIP with your files, font licenses, and KDP checklist - everything you need to publish.
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-600">
        <div className="px-6 py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Ready to format your book?
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-blue-100">
              Join thousands of authors who trust BookMagic for professional book formatting.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                href="/auth/login"
                className="rounded-md bg-white px-3.5 py-2.5 text-sm font-semibold text-blue-600 shadow-sm hover:bg-blue-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                Start formatting now
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
