'use client';

import { QuizGame } from '@/components/QuizGame';
import { MetroStation, MetroLine } from '@/types/metro';

interface HomePageProps {
  stations: MetroStation[];
  lines: MetroLine[];
}

export default function HomePage({ stations, lines }: HomePageProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <QuizGame stations={stations} lines={lines} />
    </div>
  );
}
