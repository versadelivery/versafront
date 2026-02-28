"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Ticket, Search, Edit, Trash2, Plus } from "lucide-react";
import AdminHeader from "@/components/admin/catalog-header";
import CouponModal from "./components/coupon-modal";
import { useCoupons } from "./hooks/use-coupons";
import { Coupon } from "./services/coupon-service";

export default function CouponsPage() {
  const { coupons, loading, createCoupon, updateCoupon, deleteCoupon } = useCoupons();

  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const filteredCoupons = coupons.filter((coupon) =>
    coupon.attributes.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (value: string | number) => {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
      Number(value)
    );
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (coupon: Coupon) => {
    const attrs = coupon.attributes;
    if (!attrs.active) {
      return <Badge variant="secondary" className="bg-gray-100 text-gray-700 border-0">Inativo</Badge>;
    }
    if (attrs.expired) {
      return <Badge variant="secondary" className="bg-red-100 text-red-700 border-0">Expirado</Badge>;
    }
    if (attrs.exhausted) {
      return <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 border-0">Esgotado</Badge>;
    }
    return <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 border-0">Ativo</Badge>;
  };

  const getTypeBadge = (discountType: string) => {
    if (discountType === "percentage") {
      return <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-0">Percentual</Badge>;
    }
    return <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 border-0">Valor Fixo</Badge>;
  };

  const formatValue = (coupon: Coupon) => {
    const attrs = coupon.attributes;
    if (attrs.discount_type === "percentage") {
      return `${Number(attrs.value)}%`;
    }
    return formatCurrency(attrs.value);
  };

  const formatUsage = (coupon: Coupon) => {
    const attrs = coupon.attributes;
    if (attrs.usage_limit === null) {
      return `${attrs.usage_count} / Ilimitado`;
    }
    return `${attrs.usage_count} / ${attrs.usage_limit}`;
  };

  const formatValidity = (coupon: Coupon) => {
    const attrs = coupon.attributes;
    if (!attrs.starts_at && !attrs.expires_at) return "Sem validade";
    const start = formatDate(attrs.starts_at);
    const end = formatDate(attrs.expires_at);
    if (start && end) return `${start} - ${end}`;
    if (start) return `A partir de ${start}`;
    return `Até ${end}`;
  };

  const handleCreate = () => {
    setSelectedCoupon(null);
    setIsEditing(false);
    setIsModalOpen(true);
  };

  const handleEdit = (coupon: Coupon) => {
    setSelectedCoupon(coupon);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleSave = async (data: any) => {
    if (isEditing && selectedCoupon) {
      await updateCoupon(selectedCoupon.id, data);
    } else {
      await createCoupon(data);
    }
  };

  const handleDelete = async (id: string) => {
    await deleteCoupon(id);
  };

  return (
    <div className="w-full px-0 sm:px-4 lg:px-6 min-h-screen pb-20">
      <AdminHeader
        title="CUPONS DE DESCONTO"
        description="Crie e gerencie cupons promocionais para seus clientes"
        className="mb-4"
      />

      <div className="w-full max-w-7xl mx-auto p-0 md:p-4 lg:p-6 bg-white">
        <Card className="p-4 md:p-6 shadow-none border-none rounded-xs bg-white">
          {/* Header da tabela */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar por código..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-12 border-muted"
              />
            </div>

            <Button
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 h-12 gap-2"
              onClick={handleCreate}
            >
              <Plus className="h-4 w-4" />
              Novo cupom
            </Button>
          </div>

          {/* Tabela */}
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold text-foreground py-4">Código</TableHead>
                  <TableHead className="font-semibold text-foreground py-4">Tipo</TableHead>
                  <TableHead className="font-semibold text-foreground py-4">Valor</TableHead>
                  <TableHead className="font-semibold text-foreground py-4">Uso</TableHead>
                  <TableHead className="font-semibold text-foreground py-4">Validade</TableHead>
                  <TableHead className="font-semibold text-foreground py-4">Status</TableHead>
                  <TableHead className="font-semibold text-foreground py-4 text-center">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCoupons.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      <div className="flex flex-col items-center gap-2">
                        <Ticket className="h-8 w-8 text-muted-foreground" />
                        <p>{loading ? "Carregando cupons..." : "Nenhum cupom encontrado"}</p>
                        {searchTerm && !loading && (
                          <p className="text-sm">Tente buscar por outros termos</p>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCoupons.map((coupon) => (
                    <TableRow key={coupon.id} className="hover:bg-muted/30">
                      <TableCell className="py-4">
                        <Badge variant="outline" className="font-mono font-semibold">
                          {coupon.attributes.code}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-4">
                        {getTypeBadge(coupon.attributes.discount_type)}
                      </TableCell>
                      <TableCell className="py-4 font-medium">
                        {formatValue(coupon)}
                      </TableCell>
                      <TableCell className="py-4 text-muted-foreground">
                        {formatUsage(coupon)}
                      </TableCell>
                      <TableCell className="py-4 text-sm text-muted-foreground">
                        {formatValidity(coupon)}
                      </TableCell>
                      <TableCell className="py-4">
                        {getStatusBadge(coupon)}
                      </TableCell>
                      <TableCell className="py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 px-3 text-xs border-muted hover:bg-primary hover:text-white"
                            onClick={() => handleEdit(coupon)}
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            Editar
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 px-3 text-xs border-red-200 text-red-600 hover:bg-red-50"
                            onClick={() => handleDelete(coupon.id)}
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Excluir
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Rodapé */}
          {filteredCoupons.length > 0 && (
            <div className="flex items-center justify-between pt-4 text-sm text-muted-foreground">
              <div>
                Mostrando {filteredCoupons.length} de {coupons.length} cupons
              </div>
              <div className="flex items-center gap-4">
                <span>Total de cupons: {coupons.length}</span>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Modal */}
      <CouponModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        onDelete={handleDelete}
        coupon={selectedCoupon}
        isEdit={isEditing}
      />
    </div>
  );
}
