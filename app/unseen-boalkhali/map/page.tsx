import {Shell, SectionTitle} from '@/components/ui';
import BoalkhaliMap from '@/components/unseen/BoalkhaliMap';

export const metadata = {title: 'ইন্টার‌্যাক্টিভ মানচিত্র — আনসিন বোয়ালখালী', description: 'বোয়ালখালীর আসল সীমানায় ৪৬টি গ্রাম, দর্শনীয় স্থান ও প্রকৃতির ইন্টার‌্যাক্টিভ মানচিত্র।'};

export default function UnseenMap(){
  return <Shell><main className="mx-auto max-w-6xl space-y-6 p-3 md:p-4">
    <SectionTitle title="🗺️ বোয়ালখালীর ইন্টার‌্যাক্টিভ মানচিত্র" sub="লেয়ার বেছে নিন, মার্কারে ক্লিক করলেই বিস্তারিত"/>
    <BoalkhaliMap/>
    <div className="card !p-4">
      <p className="font-display font-bold">🗺️ মানচিত্র কীভাবে ব্যবহার করবেন</p>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-relaxed text-gray-600">
        <li><b>🏘️ গ্রাম</b> — বোয়ালখালীর ৪৬টি গ্রামের অবস্থান (সবুজ মার্কার)।</li>
        <li><b>📍 দর্শনীয়</b> — ১৫টি যাচাইকৃত দর্শনীয় স্থান (কমলা মার্কার)।</li>
        <li><b>🌿 প্রকৃতি</b> — কর্ণফুলী নদী, করলডেঙ্গা পাহাড় (নীল মার্কার)।</li>
        <li>ডান পাশের <b>+ / −</b> বোতামে জুম, <b>রিসেট</b> চাপলে আগের অবস্থায় ফিরবে।</li>
      </ul>
    </div>
  </main></Shell>;
}
