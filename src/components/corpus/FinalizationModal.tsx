"use client";

interface Props {
  includedCount: number;
  pendingCount: number;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export function FinalizationModal({ includedCount, pendingCount, onConfirm, onCancel, loading }: Props) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Finalize corpus?</h2>
        <p className="text-sm text-gray-600 mb-4">
          You have <strong>{includedCount}</strong> included document{includedCount !== 1 ? "s" : ""}.{" "}
          They will be sent to the Extract stage.
        </p>

        {pendingCount > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-4 text-sm text-amber-700">
            ⚠ {pendingCount} unreviewed document{pendingCount !== 1 ? "s" : ""} will <strong>NOT</strong> be extracted. Only <strong>{includedCount}</strong> included document{includedCount !== 1 ? "s" : ""} will be analyzed.
          </div>
        )}

        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            Go back and review
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 text-sm bg-gray-900 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50"
          >
            {loading ? "Finalizing..." : `Finalize corpus (${includedCount})`}
          </button>
        </div>
      </div>
    </div>
  );
}
