import React, { useState } from 'react';
import { Settings2, Plus, Trash2, X, Check, FileCheck2 } from 'lucide-react';

interface ItemManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: string[];
  onSaveItems: (items: string[]) => void;
}

export const ItemManagerModal: React.FC<ItemManagerModalProps> = ({
  isOpen,
  onClose,
  items,
  onSaveItems,
}) => {
  const [newItemInput, setNewItemInput] = useState('');
  const [currentItems, setCurrentItems] = useState<string[]>(items);

  if (!isOpen) return null;

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newItemInput.trim();
    if (trimmed && !currentItems.includes(trimmed)) {
      const updated = [...currentItems, trimmed];
      setCurrentItems(updated);
      onSaveItems(updated);
      setNewItemInput('');
    }
  };

  const handleDeleteItem = (itemToDelete: string) => {
    if (confirm(`คุณต้องการลบรายการ "${itemToDelete}" ออกจากระบบหรือไม่?`)) {
      const updated = currentItems.filter((i) => i !== itemToDelete);
      setCurrentItems(updated);
      onSaveItems(updated);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-200">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2">
            <Settings2 className="w-5 h-5 text-red-700" />
            <div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                จัดการรายการให้ความช่วยเหลือผู้ประสบภัย
              </h3>
              <p className="text-xs text-slate-500">
                เพิ่ม/แก้ไขรายการตามระเบียบ ก.ช.ภ. เช่น 5.1.5 ค่าอาหารจัดเลี้ยง, 5.1.2 ค่าถุงยังชีพ
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Add New Item Form */}
          <form onSubmit={handleAddItem} className="flex gap-2">
            <input
              type="text"
              required
              value={newItemInput}
              onChange={(e) => setNewItemInput(e.target.value)}
              placeholder="เช่น 5.1.11 ค่าล้างบ่อน้ำตื้น หรือรายการอื่นๆ..."
              className="flex-1 px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-red-500 focus:outline-hidden"
            />
            <button
              type="submit"
              className="px-3.5 py-1.5 bg-red-700 hover:bg-red-800 text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors flex items-center gap-1 cursor-pointer shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>เพิ่มรายการ</span>
            </button>
          </form>

          {/* Existing Items List */}
          <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
            {currentItems.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs hover:bg-slate-100/70 transition-colors"
              >
                <div className="flex items-center gap-2 text-slate-800">
                  <span className="w-5 text-slate-400 text-[11px] font-mono">{idx + 1}.</span>
                  <span className="font-medium">{item}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteItem(item)}
                  className="text-slate-400 hover:text-red-600 p-1 rounded-md transition-colors"
                  title="ลบรายการ"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-lg shadow-xs cursor-pointer"
            >
              เสร็จสิ้น
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
