"use client";

import React from "react";

export default function TestTailwind() {
  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold text-blue-600">Tailwind Test</h1>
      <p className="mt-2 text-gray-600">Bu metin gri renkte olmalıdır.</p>
      <div className="mt-4 bg-green-200 p-4 rounded-lg">
        <p className="text-green-800">Bu yeşil bir kutu olmalıdır.</p>
      </div>
      <button className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
        Test Butonu
      </button>
    </div>
  );
}
