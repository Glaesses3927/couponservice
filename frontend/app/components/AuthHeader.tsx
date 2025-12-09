"use client";

import { LogOut, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

interface UserInfo {
  id: string;
  email: string;
  name: string;
}

const AuthHeader = () => {
  const router = useRouter();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    try {
      const response = await fetch("/api/auth/me");
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      }
    } catch (error) {
      console.error("Failed to fetch user:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });
      setUser(null);
      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  if (loading) {
    return null;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center py-3">
          <div className="flex items-center space-x-2">
            <User className="h-5 w-5 text-gray-600" />
            <span className="text-sm font-medium text-gray-900">
              {user.name}
            </span>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span>ログアウト</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthHeader;
