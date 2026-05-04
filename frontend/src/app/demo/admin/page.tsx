"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminApp from "../../../components/admin/AdminApp";
import { useMediFlowStore } from "../../../store/useMediFlowStore";

export default function AdminPage() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    // Basic auth check
    const token = localStorage.getItem("mediflow_admin_token");
    if (!token) {
      router.replace("/demo/admin/auth");
    } else {
      setIsAuthorized(true);
    }
  }, [router]);

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bgLight">
        <div className="text-primary font-medium">Verifying access...</div>
      </div>
    );
  }

  return <AdminApp />;
}
