"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Map, History } from "lucide-react";
import AdminHeader from "@/components/admin/catalog-header";
import TableMap from "./components/table-map";
import TableHistory from "./components/table-history";
import TableConfigModal from "./components/table-config-modal";
import OpenTableModal from "./components/open-table-modal";
import CloseTableModal from "./components/close-table-modal";
import { useTables } from "./hooks/use-tables";
import { useTableSessions } from "./hooks/use-table-sessions";
import {
  Table,
  CreateTablePayload,
  UpdateTablePayload,
  TableSession,
} from "./services/table-service";

export default function MesasPage() {
  const {
    tables,
    loading,
    createTable,
    updateTable,
    deleteTable,
    updatePositions,
    refetch: refetchTables,
  } = useTables();

  const {
    openSession,
    closeSession,
    refetch: refetchSessions,
  } = useTableSessions();

  // Config modal state
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [isEditingTable, setIsEditingTable] = useState(false);

  // Open session modal state
  const [isOpenModalOpen, setIsOpenModalOpen] = useState(false);
  const [tableToOpen, setTableToOpen] = useState<Table | null>(null);

  // Close session modal state
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);
  const [tableToClose, setTableToClose] = useState<Table | null>(null);
  const [sessionToClose, setSessionToClose] = useState<TableSession | null>(null);

  const handleCreateTable = () => {
    setSelectedTable(null);
    setIsEditingTable(false);
    setIsConfigModalOpen(true);
  };

  const handleConfigClick = (table: Table) => {
    setSelectedTable(table);
    setIsEditingTable(true);
    setIsConfigModalOpen(true);
  };

  const handleTableClick = (table: Table) => {
    const attrs = table.attributes;
    if (!attrs.active) return;

    if (attrs.occupied && attrs.current_session) {
      setTableToClose(table);
      setSessionToClose({
        id: attrs.current_session.id,
        type: attrs.current_session.type,
        attributes: attrs.current_session.attributes,
      });
      setIsCloseModalOpen(true);
    } else {
      setTableToOpen(table);
      setIsOpenModalOpen(true);
    }
  };

  const handleSaveTable = async (data: CreateTablePayload | UpdateTablePayload) => {
    if (isEditingTable && selectedTable) {
      await updateTable(selectedTable.id, data);
    } else {
      await createTable(data as CreateTablePayload);
    }
  };

  const handleDeleteTable = async (id: string) => {
    await deleteTable(id);
  };

  const handleOpenSession = async (data: any) => {
    await openSession(data);
    await refetchTables();
    await refetchSessions();
  };

  const handleCloseSession = async (id: string, data: any) => {
    await closeSession(id, data);
    await refetchTables();
    await refetchSessions();
  };

  const activeTables = tables.filter((t) => t.attributes.active);
  const occupiedCount = activeTables.filter((t) => t.attributes.occupied).length;
  const availableCount = activeTables.filter((t) => !t.attributes.occupied).length;

  return (
    <div className="w-full px-0 sm:px-4 lg:px-6 min-h-screen pb-20">
      <AdminHeader
        title="GERENCIAMENTO DE MESAS"
        description="Configure mesas, abra e feche comandas, e acompanhe o historico"
        className="mb-4"
      />

      <div className="w-full max-w-7xl mx-auto p-0 md:p-4 lg:p-6 bg-white">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6 px-4 md:px-0">
          <Card className="p-4 text-center shadow-none border">
            <p className="text-2xl font-bold text-foreground">{tables.length}</p>
            <p className="text-sm text-muted-foreground">Total de mesas</p>
          </Card>
          <Card className="p-4 text-center shadow-none border border-emerald-200 bg-emerald-50">
            <p className="text-2xl font-bold text-emerald-700">{availableCount}</p>
            <p className="text-sm text-emerald-600">Disponiveis</p>
          </Card>
          <Card className="p-4 text-center shadow-none border border-red-200 bg-red-50">
            <p className="text-2xl font-bold text-red-700">{occupiedCount}</p>
            <p className="text-sm text-red-600">Ocupadas</p>
          </Card>
        </div>

        <Tabs defaultValue="mapa" className="w-full">
          <div className="flex items-center justify-between px-4 md:px-0 mb-4">
            <TabsList>
              <TabsTrigger value="mapa" className="gap-2">
                <Map className="h-4 w-4" />
                Mapa
              </TabsTrigger>
              <TabsTrigger value="historico" className="gap-2">
                <History className="h-4 w-4" />
                Historico
              </TabsTrigger>
            </TabsList>

            <Button
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 h-11 gap-2"
              onClick={handleCreateTable}
            >
              <Plus className="h-4 w-4" />
              Nova mesa
            </Button>
          </div>

          <TabsContent value="mapa">
            <Card className="p-4 md:p-6 shadow-none border-none rounded-xs bg-white">
              {tables.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                  <Map className="h-12 w-12 mb-4" />
                  <p className="text-lg font-medium mb-2">
                    {loading ? "Carregando mesas..." : "Nenhuma mesa configurada"}
                  </p>
                  {!loading && (
                    <p className="text-sm mb-4">Comece criando sua primeira mesa</p>
                  )}
                  {!loading && (
                    <Button
                      className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
                      onClick={handleCreateTable}
                    >
                      <Plus className="h-4 w-4" />
                      Criar primeira mesa
                    </Button>
                  )}
                </div>
              ) : (
                <TableMap
                  tables={tables}
                  onTableClick={handleTableClick}
                  onConfigClick={handleConfigClick}
                  onUpdatePositions={updatePositions}
                />
              )}
            </Card>
          </TabsContent>

          <TabsContent value="historico">
            <TableHistory />
          </TabsContent>
        </Tabs>
      </div>

      <TableConfigModal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        onSave={handleSaveTable}
        onDelete={handleDeleteTable}
        table={selectedTable}
        isEdit={isEditingTable}
      />

      <OpenTableModal
        isOpen={isOpenModalOpen}
        onClose={() => setIsOpenModalOpen(false)}
        onSubmit={handleOpenSession}
        table={tableToOpen}
      />

      <CloseTableModal
        isOpen={isCloseModalOpen}
        onClose={() => setIsCloseModalOpen(false)}
        onSubmit={handleCloseSession}
        table={tableToClose}
        session={sessionToClose}
      />
    </div>
  );
}
