export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

import FeedbackClient from './FeedbackClient';

export default function Page() {
  return <FeedbackClient />;
}

