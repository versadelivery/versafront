"use client";

import { Component, type ReactNode } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

// Se um relatório quebrar, só ele cai — o resto da página (abas, menu) continua funcionando.
export default class ReportErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(error: unknown) { console.error("Erro ao renderizar relatório:", error); }
  render() {
    if (!this.state.failed) return this.props.children;
    return <div role="alert" className="flex flex-col items-center gap-3 py-16 text-center">
      <AlertTriangle className="h-10 w-10 text-red-500" />
      <p className="font-medium">Não foi possível exibir este relatório.</p>
      <p className="max-w-sm text-sm text-muted-foreground">Tente novamente. Se continuar, avise o suporte informando qual relatório e período.</p>
      <Button variant="outline" onClick={() => this.setState({ failed: false })}>Tentar novamente</Button>
    </div>;
  }
}
