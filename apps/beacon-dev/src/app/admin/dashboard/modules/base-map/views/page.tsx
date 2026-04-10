import { redirect } from 'next/navigation';

export default function ViewsIndex() {
  redirect('/admin/dashboard/modules/base-map/views/flat');
}
