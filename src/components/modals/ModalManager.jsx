"use client";
import { useApp } from "@/store/AppContext";
import PredictModal     from "@/components/modals/PredictModal";
import CreateEventModal from "@/components/modals/CreateEventModal";
import ShareModal       from "@/components/modals/ShareModal";

export default function ModalManager() {
  const { modal } = useApp();
  if (!modal) return null;
  if (modal.type === "predict") return <PredictModal event={modal.event} />;
  if (modal.type === "create")  return <CreateEventModal />;
  if (modal.type === "share")   return <ShareModal event={modal.event} />;
  return null;
}
