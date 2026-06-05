import { Button } from "./Button";
import { Modal } from "./Modal";
import { useTranslation } from "react-i18next";

interface ConfirmDeleteModalProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  loading?: boolean;
  confirmDisabled?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function ConfirmDeleteModal({ open, title, message, confirmLabel, loading, confirmDisabled, onClose, onConfirm }: ConfirmDeleteModalProps) {
  const { t } = useTranslation();
  return (
    <Modal title={title} open={open} onClose={onClose}>
      <p className="text-sm leading-6 text-slate-600">{message}</p>
      <div className="mt-5 flex justify-end gap-2">
        <Button variant="secondary" onClick={onClose}>{t("common.cancel")}</Button>
        <Button variant="danger" disabled={loading || confirmDisabled} onClick={onConfirm}>{loading ? t("common.deleting") : (confirmLabel ?? t("common.delete"))}</Button>
      </div>
    </Modal>
  );
}
