'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle, ChefHat, Clock, Truck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePrepTimer } from '@/hooks/use-prep-timer';

export type KDSOrder = {
	id: string;
	customerName: string;
	status: 'recebidos' | 'aceitos' | 'em_analise' | 'em_preparo' | 'prontos' | 'saiu' | 'entregue' | 'cancelled';
	items: Array<{ name: string; qty: number; note?: string }>;
	createdAtLabel: string;
	acceptedAt?: string | null;
	readyAt?: string | null;
};

interface KDSBoardProps {
	orders: KDSOrder[];
	estimatedPrepTime?: number | null;
	estimatedDeliveryTime?: number | null;
	onMarkReady: (orderId: string) => void;
	onOpenDetails?: (orderId: string) => void;
}

function KDSCard({ order, estimatedPrepTime, estimatedDeliveryTime, onMarkReady, onOpenDetails, isReady }: {
	order: KDSOrder;
	estimatedPrepTime?: number | null;
	estimatedDeliveryTime?: number | null;
	onMarkReady: (orderId: string) => void;
	onOpenDetails?: (orderId: string) => void;
	isReady?: boolean;
}) {
	const prepTimer = usePrepTimer(
		order.status === 'em_preparo' ? order.acceptedAt : null,
		estimatedPrepTime,
		'Preparo'
	);
	const deliveryTimer = usePrepTimer(
		['prontos', 'saiu'].includes(order.status) ? order.readyAt : null,
		estimatedDeliveryTime,
		'Entrega'
	);
	const timer = prepTimer || deliveryTimer;

	return (
		<div
			className={cn(
				"rounded-md border overflow-hidden cursor-pointer transition-colors",
				timer?.isOverdue
					? "border-red-400 bg-white"
					: "border-[#E5E2DD] bg-white hover:border-gray-300"
			)}
			onClick={() => onOpenDetails && onOpenDetails(order.id)}
		>
			<div className="p-4 space-y-3">
				{/* Timer */}
				{timer && (
					<div className={cn(
						"inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border bg-white text-sm font-semibold",
						timer.isOverdue
							? "border-red-400 text-red-700"
							: "border-[#E5E2DD] text-gray-700"
					)}>
						<span className={cn("w-1.5 h-1.5 rounded-full", timer.isOverdue ? "bg-red-500" : "bg-primary")} />
						<span>{timer.timerLabel}</span>
						<span className={cn("tabular-nums font-bold", timer.isOverdue ? "text-red-700" : "text-gray-900")}>
							{timer.label}
						</span>
					</div>
				)}

				<div className="flex items-center justify-between">
					<div className="min-w-0 flex-1">
						<p className="text-sm font-semibold text-gray-900 truncate">{order.customerName}</p>
						<p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
							<Clock className="w-3 h-3" /> {order.createdAtLabel}
						</p>
					</div>
					{isReady ? (
						<span className="text-sm text-green-600 font-semibold flex-shrink-0">Pronto</span>
					) : (
						<Button
							size="sm"
							className="rounded-md border border-gray-300 cursor-pointer flex-shrink-0"
							onClick={(e) => { e.stopPropagation(); onMarkReady(order.id); }}
						>
							Marcar pronto
						</Button>
					)}
				</div>
				<ul className="space-y-1.5">
					{order.items.map((it, idx) => (
						<li key={idx} className="text-sm text-gray-700">
							<span className="font-semibold">{it.qty}x</span> {it.name}
							{it.note ? <span className="text-sm text-muted-foreground"> — {it.note}</span> : null}
						</li>
					))}
				</ul>
			</div>
		</div>
	);
}

export function KDSBoard({ orders, estimatedPrepTime, estimatedDeliveryTime, onMarkReady, onOpenDetails }: KDSBoardProps) {
	const preparing = orders.filter((o) => o.status === 'em_preparo');
	const ready = orders.filter((o) => o.status === 'prontos');
	const delivering = orders.filter((o) => o.status === 'saiu');

	return (
		<div className="space-y-6">
			<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
				<section>
					<header className="flex items-center justify-between mb-3">
						<h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
							<ChefHat className="w-4 h-4" /> Em preparo
						</h2>
						<span className="text-sm text-muted-foreground">{preparing.length} pedidos</span>
					</header>
					<div className="grid grid-cols-1 gap-3">
						{preparing.map((order) => (
							<KDSCard
								key={order.id}
								order={order}
								estimatedPrepTime={estimatedPrepTime}
								estimatedDeliveryTime={estimatedDeliveryTime}
								onMarkReady={onMarkReady}
								onOpenDetails={onOpenDetails}
							/>
						))}
						{preparing.length === 0 && (
							<div className="text-sm text-muted-foreground text-center py-8">
								Nenhum pedido em preparo
							</div>
						)}
					</div>
				</section>
				<section>
					<header className="flex items-center justify-between mb-3">
						<h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
							<CheckCircle className="w-4 h-4" /> Prontos para retirada
						</h2>
						<span className="text-sm text-muted-foreground">{ready.length} pedidos</span>
					</header>
					<div className="grid grid-cols-1 gap-3">
						{ready.map((order) => (
							<KDSCard
								key={order.id}
								order={order}
								estimatedPrepTime={estimatedPrepTime}
								estimatedDeliveryTime={estimatedDeliveryTime}
								onMarkReady={onMarkReady}
								onOpenDetails={onOpenDetails}
								isReady
							/>
						))}
						{ready.length === 0 && (
							<div className="text-sm text-muted-foreground text-center py-8">
								Nenhum pedido pronto
							</div>
						)}
					</div>
				</section>
				<section>
					<header className="flex items-center justify-between mb-3">
						<h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
							<Truck className="w-4 h-4" /> Saiu para entrega
						</h2>
						<span className="text-sm text-muted-foreground">{delivering.length} pedidos</span>
					</header>
					<div className="grid grid-cols-1 gap-3">
						{delivering.map((order) => (
							<KDSCard
								key={order.id}
								order={order}
								estimatedPrepTime={estimatedPrepTime}
								estimatedDeliveryTime={estimatedDeliveryTime}
								onMarkReady={onMarkReady}
								onOpenDetails={onOpenDetails}
								isReady
							/>
						))}
						{delivering.length === 0 && (
							<div className="text-sm text-muted-foreground text-center py-8">
								Nenhum pedido em entrega
							</div>
						)}
					</div>
				</section>
			</div>
		</div>
	);
}
