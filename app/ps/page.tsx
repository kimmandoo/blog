import { getSortedPSData } from '@/lib/ps';
import { PSSidebar } from '@/components/PSSidebar';
import { PSList } from '@/components/PSList';
import { PSStats } from '@/components/PSStats';
import { PSTopBar } from '@/components/PSTopBar';
import { PSPageHeader } from '@/components/PSPageHeader';

export default async function PSPage() {
  const allItems = getSortedPSData();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <PSTopBar />

      {/* Layout */}
      <div className="flex max-w-screen-2xl mx-auto">
        {/* Left Sidebar */}
        <PSSidebar items={allItems} />

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 px-8 py-12">
          <div className="max-w-4xl mx-auto">
            <PSPageHeader />
            <PSStats items={allItems} />
            <div className="mt-12">
              <PSList items={allItems} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
