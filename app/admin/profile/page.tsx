'use client';

import { useAuthStore } from '@/store/useAuthStore';

export default function AdminProfilePage() {
  const user = useAuthStore((state) => state.user);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">
          Admin Profile
        </h1>
        <p className="text-gray-500">
          Manage your account information
        </p>
      </div>

      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-600 text-2xl font-bold text-white">
            {user?.username?.charAt(0).toUpperCase()}
          </div>

          <div>
            <h2 className="text-xl font-semibold">
              {user?.username}
            </h2>

            <p className="text-gray-500">
              {user?.email}
            </p>

            <span className="mt-2 inline-flex rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
              {user?.role}
            </span>
          </div>
        </div>
      </div>

      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold">
          Account Information
        </h3>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-sm text-gray-500">
              Username
            </label>

            <p className="font-medium">
              {user?.username}
            </p>
          </div>

          <div>
            <label className="text-sm text-gray-500">
              Email
            </label>

            <p className="font-medium">
              {user?.email}
            </p>
          </div>

          <div>
            <label className="text-sm text-gray-500">
              Role
            </label>

            <p className="font-medium">
              {user?.role}
            </p>
          </div>

          <div>
            <label className="text-sm text-gray-500">
              User ID
            </label>

            <p className="font-medium break-all">
              {user?.id}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}