import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Referral } from "../services/reseller-service";

interface ReferralsTableProps {
  referrals: Referral[];
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR");
}

export function ReferralsTable({ referrals }: ReferralsTableProps) {
  if (referrals.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground text-sm">
        Nenhuma loja indicada ainda. Compartilhe seu link!
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Loja</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Última mensalidade</TableHead>
          <TableHead>Período</TableHead>
          <TableHead>Indicada em</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {referrals.map((referral) => (
          <TableRow key={referral.id}>
            <TableCell className="font-medium">{referral.name}</TableCell>
            <TableCell>
              {!referral.approved ? (
                <Badge variant="secondary">Pendente aprovação</Badge>
              ) : referral.billing_delinquent ? (
                <Badge variant="destructive">Inadimplente</Badge>
              ) : (
                <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Ativa</Badge>
              )}
            </TableCell>
            <TableCell>
              {referral.last_charge_amount != null
                ? formatCurrency(referral.last_charge_amount)
                : "—"}
            </TableCell>
            <TableCell>{referral.last_charge_period ?? "—"}</TableCell>
            <TableCell>{formatDate(referral.referred_at)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
