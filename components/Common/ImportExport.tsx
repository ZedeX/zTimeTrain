"use client";
import React, { useRef, useState } from "react";
import { useApp } from "@/lib/context";

export default function ImportExport() {
  const { userId, saveFullState } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const response = await fetch(`/api/export?userId=${userId}`);
      if (!response.ok) throw new Error("Export failed");
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `timetrain-export-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      alert("导出失败: " + String(e));
    } finally {
      setIsExporting(false);
      setShowMenu(false);
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
    setShowMenu(false);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsImporting(true);
      const text = await file.text();
      const data = JSON.parse(text);

      const confirmed = confirm(
        "确定要导入数据吗？这将覆盖当前所有数据，此操作不可撤销！"
      );
      if (!confirmed) return;

      const response = await fetch("/api/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, data }),
      });

      if (!response.ok) throw new Error("Import failed");

      saveFullState(data);
      alert("导入成功！页面将刷新。");
      window.location.reload();
    } catch (e) {
      alert("导入失败: " + String(e));
    } finally {
      setIsImporting(false);
      e.target.value = "";
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        disabled={isExporting || isImporting}
        title="数据管理"
        className="flex items-center gap-1 bg-white/20 hover:bg-white/30 rounded-lg px-2 py-1.5 text-sm font-semibold text-white transition-all flex-shrink-0 disabled:opacity-50"
      >
        <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
          <path d="M4 17V19C4 20.1046 4.89543 21 6 21H18C19.1046 21 20 20.1046 20 19V17M16 11L12 7M12 7L8 11M12 7V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="hidden sm:inline">数据</span>
      </button>

      {showMenu && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowMenu(false)}
          />
          <div className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-2xl p-2 z-50 min-w-[140px]">
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
            >
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                <path d="M4 17V19C4 20.1046 4.89543 21 6 21H18C19.1046 21 20 20.1046 20 19V17M16 11L12 7M12 7L8 11M12 7V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {isExporting ? "导出中..." : "导出 JSON"}
            </button>
            <button
              onClick={handleImportClick}
              disabled={isImporting}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
            >
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                <path d="M4 17V19C4 20.1046 4.89543 21 6 21H18C19.1046 21 20 20.1046 20 19V17M12 3V13M12 13L8 9M12 13L16 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {isImporting ? "导入中..." : "导入 JSON"}
            </button>
          </div>
        </>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
