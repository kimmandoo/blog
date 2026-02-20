import { getSortedAndroidCSData } from '@/lib/androidcs';
import { AndroidCSSidebar } from '@/components/AndroidCSSidebar';
import { AndroidCSList } from '@/components/AndroidCSList';
import { AndroidCSStats } from '@/components/AndroidCSStats';
import { AndroidTopBar } from '@/components/AndroidTopBar';
import { AndroidPageHeader } from '@/components/AndroidPageHeader';

export default async function AndroidCSPage() {
  const allItems = getSortedAndroidCSData();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <AndroidTopBar />

      {/* GitBook-style Layout */}
      <div className="flex max-w-screen-2xl mx-auto">
        {/* Left Sidebar - Navigation */}
        <AndroidCSSidebar items={allItems} />

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 px-8 py-12">
          <div className="max-w-4xl mx-auto">
            <AndroidPageHeader />
            <AndroidCSStats items={allItems} />
            <div className="mt-12">
              <AndroidCSList items={allItems} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
