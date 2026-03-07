"use client";
import React from "react";
import { useDroppable } from "@dnd-kit/core";
import { useApp } from "@/lib/context";

interface Props {
  index: number; // insert BEFORE carriages[index]
  isFirst?: boolean;
  isLast?: boolean;
}

export default function CarriageGap({ index, isFirst, isLast }: Props) {
  const { addCarriageBetween, addCarriageAtHead, addCarriageAtTail } = useApp();

  const { setNodeRef, isOver } = useDroppable({
    id: `gap-${index}`,
    data: { type: "gap", index },
  });

  const handleAdd = () => {
    if (isFirst) addCarriageAtHead();
    else if (isLast) addCarriageAtTail();
    else addCarriageBetween(index - 1);
  };

  return (
    <div
      ref={setNodeRef}
      className={`relative flex-shrink-0 flex items-center justify-center transition-all duration-200
        ${isOver ? "w-16" : "w-8"}
        h-[180px] sm:h-[200px] lg:h-[220px]
      `}
    >
      {/* Vertical connector line */}
      <div
        className={`absolute h-0.5 top-1/2 -translate-y-1/2 left-0 right-0 transition-colors ${
          isOver ? "bg-blue-400" : "bg-blue-200"
        }`}
      />

      {/* Add button */}
      <button
        onClick={handleAdd}
        className={`relative z-10 w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold transition-all shadow-sm
          ${isOver
            ? "bg-blue-500 text-white scale-125 shadow-lg"
            : "bg-white border-2 border-blue-300 text-blue-400 hover:border-blue-500 hover:text-blue-600 hover:scale-110"
          }`}
        title="插入车厢"
      >
        +
      </button>

      {/* Drop hint */}
      {isOver && (
        <div
          className="absolute -top-6 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full whitespace-nowrap"
        >
          插入此处
        </div>
      )}
    </div>
  );
}
