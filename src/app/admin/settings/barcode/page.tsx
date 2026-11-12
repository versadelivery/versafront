"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ShopSettingCard, useShopDraft } from "@/components/admin/shop-setting-card";
import BarcodeSettings from "../general/components/BarcodeSettings";
import { ScanBarcode } from "lucide-react";

export default function BarcodeSettingsPage() {
  const { ready, draft, set, dirty, saving, save } = useShopDraft((s) => ({
    barcode_not_found_action: s.barcode_not_found_action ?? "notice",
    scale_label_mode: s.scale_label_mode ?? "weight",
  }));

  return (
    <div className="min-h-screen bg-[#FAF9F7]">
      <div className="bg-white border-b border-[#E5E2DD]">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 flex items-center h-16 gap-2 sm:gap-4">
          <Link href="/admin/settings" className="flex items-center gap-1.5 text-muted-foreground hover:text-gray-900 transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium hidden sm:block">Voltar</span>
          </Link>
          <div className="h-6 w-px bg-[#E5E2DD] hidden sm:block" />
          <h1 className="truncate font-tomato text-sm sm:text-lg font-bold text-gray-900">Leitor de Código de Barras e Balança</h1>
        </div>
      </div>
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {!ready ? (
          <Skeleton className="h-64 w-full rounded-md" />
        ) : (
          <ShopSettingCard icon={ScanBarcode} title="Leitor e balança" dirty={dirty} saving={saving} onSave={() => save()}>
            <BarcodeSettings
              notFoundAction={draft.barcode_not_found_action ?? "notice"}
              scaleMode={draft.scale_label_mode ?? "weight"}
              onNotFoundActionChange={(value) => set({ barcode_not_found_action: value })}
              onScaleModeChange={(value) => set({ scale_label_mode: value })}
            />
          </ShopSettingCard>
        )}
      </div>
    </div>
  );
}
