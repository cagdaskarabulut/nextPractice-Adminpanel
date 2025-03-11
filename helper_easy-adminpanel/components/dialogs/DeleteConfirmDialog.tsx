"use client";

import React from "react";
import { Trash2 } from "lucide-react";

interface DeleteConfirmDialogProps {
  onConfirm: () => Promise<void>;
  onCancel: () => void;
}

const DeleteConfirmDialog: React.FC<DeleteConfirmDialogProps> = ({
  onConfirm,
  onCancel,
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 transition-all duration-300">
      <div className="bg-white rounded-xl p-6 w-96 max-w-full shadow-2xl">
        <h2 className="text-xl font-semibold mb-2 text-slate-800">Kaydı Sil</h2>
        <p className="mb-6 text-slate-600">
          Bu kaydı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
        </p>

        <div className="flex justify-end space-x-3">
          <button
            className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300"
            onClick={onCancel}
          >
            İptal
          </button>
          <button
            className="flex items-center gap-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            onClick={onConfirm}
          >
            <Trash2 size={16} />
            <span>Sil</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmDialog;
