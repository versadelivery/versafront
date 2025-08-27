'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, ChefHat, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

export type KDSOrder = {
	id: string;
	customerName: string;
	status: 'recebidos' | 'aceitos' | 'em_analise' | 'em_preparo' | 'prontos' | 'saiu' | 'entregue' | 'cancelled';
	items: Array<{ name: string; qty: number; note?: string }>;
	createdAtLabel: string;
};

interface KDSBoardProps {
	orders: KDSOrder[];
	onMarkReady: (orderId: string) => void;
	onOpenDetails?: (orderId: string) => void;
}

export function KDSBoard({ orders, onMarkReady, onOpenDetails }: KDSBoardProps) {
	const preparing = orders.filter((o) => o.status === 'em_preparo');
	const ready = orders.filter((o) => o.status === 'prontos');

	return (
		<div className="space-y-6">
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				<section>
					<header className="flex items-center justify-between mb-3">
						<h2 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
							<ChefHat className="w-4 h-4" /> Em preparo
						</h2>
						<span className="text-xs text-slate-500">{preparing.length} pedidos</span>
					</header>
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
						{preparing.map((order) => (
							<Card key={order.id} className="border-slate-200 cursor-pointer hover:shadow-md transition" onClick={() => onOpenDetails && onOpenDetails(order.id)}>
								<CardContent className="p-4 space-y-3">
									<div className="flex items-center justify-between">
										<div>
											<p className="text-sm font-medium text-slate-800">{order.customerName}</p>
											<p className="text-xs text-slate-500 flex items-center gap-1"><Clock className="w-3 h-3" /> {order.createdAtLabel}</p>
										</div>
										<Button size="sm" className={cn('rounded-xs')} onClick={(e) => { e.stopPropagation(); onMarkReady(order.id) }}>
											Marcar pronto
										</Button>
									</div>
									<ul className="space-y-2">
										{order.items.map((it, idx) => (
											<li key={idx} className="text-sm text-slate-700">
												<span className="font-semibold">{it.qty}x</span> {it.name}
												{it.note ? <span className="text-xs text-slate-500"> — {it.note}</span> : null}
											</li>
										))}
									</ul>
								</CardContent>
							</Card>
						))}
					</div>
				</section>
				<section>
					<header className="flex items-center justify-between mb-3">
						<h2 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
							<CheckCircle className="w-4 h-4" /> Prontos para retirada
						</h2>
						<span className="text-xs text-slate-500">{ready.length} pedidos</span>
					</header>
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
						{ready.map((order) => (
							<Card key={order.id} className="border-slate-200 cursor-pointer hover:shadow-md transition" onClick={() => onOpenDetails && onOpenDetails(order.id)}>
								<CardContent className="p-4 space-y-3">
									<div className="flex items-center justify-between">
										<div>
											<p className="text-sm font-medium text-slate-800">{order.customerName}</p>
											<p className="text-xs text-slate-500 flex items-center gap-1"><Clock className="w-3 h-3" /> {order.createdAtLabel}</p>
										</div>
										<span className="text-xs text-emerald-600 font-medium">Pronto</span>
									</div>
									<ul className="space-y-2">
										{order.items.map((it, idx) => (
											<li key={idx} className="text-sm text-slate-700">
												<span className="font-semibold">{it.qty}x</span> {it.name}
												{it.note ? <span className="text-xs text-slate-500"> — {it.note}</span> : null}
											</li>
										))}
									</ul>
								</CardContent>
							</Card>
						))}
					</div>
				</section>
			</div>
		</div>
	);
}


