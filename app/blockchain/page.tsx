import { getSortedBlockchainData } from '@/lib/blockchain';
import Link from 'next/link';
import { themeConfig } from '@/config/theme.config';
import { BlockchainSidebar } from '@/components/BlockchainSidebar';
import { ThemeToggle } from '@/components/ThemeToggle';
import { BlockchainList } from '@/components/BlockchainList';
import { BlockchainStats } from '@/components/BlockchainStats';

export default async function BlockchainPage() {
  const allItems = getSortedBlockchainData();

  return (
    <div className="min-h-screen bg-emerald-50/30 dark:bg-gray-950">
      {/* Top Bar */}
      <div className="sticky top-0 z-50 bg-white/95 dark:bg-gray-950/95 backdrop-blur-sm border-b border-emerald-200 dark:border-gray-800">
        <div className="h-16 px-6 flex items-center justify-between max-w-screen-2xl mx-auto">
          {/* Left: Logo and Title */}
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
                {themeConfig.site.title}
              </span>
            </Link>
            <span className="text-gray-300 dark:text-gray-700">|</span>
            <Link href="/blockchain" className="text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" strokeWidth="2" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
              Blockchain
            </Link>
          </div>
          
          {/* Right: Theme Toggle and Back to Blog */}
          <div className="flex items-center gap-3">
            <ThemeToggle inline />
            <Link 
              href="/" 
              className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition-colors border border-gray-200 dark:border-gray-700"
            >
              Blog
            </Link>
          </div>
        </div>
      </div>

      {/* Layout */}
      <div className="flex max-w-screen-2xl mx-auto">
        {/* Left Sidebar - Navigation */}
        <BlockchainSidebar items={allItems} />

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 px-8 py-12">
          <div className="max-w-4xl mx-auto">
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/20 dark:shadow-emerald-500/10">
                  <svg className="w-6 h-6 text-white" fill="none" strokeWidth="2" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                </div>
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                  블록체인
                </h1>
              </div>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-2">
                블록체인 기술을 공부하며 정리하는 공간입니다.
              </p>
              <p className="text-sm text-emerald-600/80 dark:text-emerald-400/60 italic">
                🌱 입문부터 차근차근 기록 중
              </p>

              {/* Statistics Dashboard */}
              <BlockchainStats items={allItems} />
            </div>

            <BlockchainList items={allItems} />
          </div>
        </main>
      </div>
    </div>
  );
}
