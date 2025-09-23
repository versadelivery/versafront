"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Settings, 
  Bell, 
  Shield, 
  DollarSign,
  Mail,
  Database,
  Save,
  AlertCircle
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function SuperAdminSettingsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState({
    // Platform Settings
    platformName: "Versa Delivery",
    platformDescription: "Plataforma de delivery para restaurantes",
    maintenanceMode: false,
    allowNewRegistrations: true,
    
    // Commission Settings
    defaultCommissionRate: 15,
    minimumCommissionRate: 10,
    maximumCommissionRate: 25,
    
    // Email Settings
    smtpHost: "smtp.gmail.com",
    smtpPort: "587",
    smtpUsername: "",
    smtpPassword: "",
    
    // Notification Settings
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    
    // Security Settings
    maxLoginAttempts: 3,
    sessionTimeout: 30,
    requireEmailVerification: true,
    requirePhoneVerification: false,
    
    // Approval Settings
    autoApproveBasicInfo: false,
    requireDocumentUpload: true,
    manualReviewRequired: true
  });

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    // Simular salvamento
    setTimeout(() => {
      setIsLoading(false);
      // toast.success("Configurações salvas com sucesso!");
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Configurações da Plataforma</h1>
          <p className="text-gray-600 mt-2">Gerencie as configurações globais da plataforma</p>
        </div>

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="general">Geral</TabsTrigger>
            <TabsTrigger value="commission">Comissões</TabsTrigger>
            <TabsTrigger value="notifications">Notificações</TabsTrigger>
            <TabsTrigger value="security">Segurança</TabsTrigger>
            <TabsTrigger value="approval">Aprovações</TabsTrigger>
          </TabsList>

          {/* General Settings */}
          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Configurações Gerais
                </CardTitle>
                <CardDescription>
                  Configure as informações básicas da plataforma
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="platform-name">Nome da Plataforma</Label>
                    <Input
                      id="platform-name"
                      value={settings.platformName}
                      onChange={(e) => handleSettingChange('platformName', e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="maintenance-mode">Modo de Manutenção</Label>
                    <div className="flex items-center space-x-2 mt-2">
                      <Switch
                        id="maintenance-mode"
                        checked={settings.maintenanceMode}
                        onCheckedChange={(value) => handleSettingChange('maintenanceMode', value)}
                      />
                      <Label htmlFor="maintenance-mode" className="text-sm">
                        {settings.maintenanceMode ? 'Ativado' : 'Desativado'}
                      </Label>
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="platform-description">Descrição da Plataforma</Label>
                  <Textarea
                    id="platform-description"
                    value={settings.platformDescription}
                    onChange={(e) => handleSettingChange('platformDescription', e.target.value)}
                    className="mt-2"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="allow-registrations"
                    checked={settings.allowNewRegistrations}
                    onCheckedChange={(value) => handleSettingChange('allowNewRegistrations', value)}
                  />
                  <Label htmlFor="allow-registrations">
                    Permitir novos cadastros de lojistas
                  </Label>
                </div>

                {settings.maintenanceMode && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      O modo de manutenção está ativado. Os usuários não conseguirão acessar a plataforma.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Commission Settings */}
          <TabsContent value="commission">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Configurações de Comissão
                </CardTitle>
                <CardDescription>
                  Configure as taxas de comissão padrão e limites
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <Label htmlFor="default-commission">Taxa Padrão (%)</Label>
                    <Input
                      id="default-commission"
                      type="number"
                      min="0"
                      max="100"
                      value={settings.defaultCommissionRate}
                      onChange={(e) => handleSettingChange('defaultCommissionRate', parseFloat(e.target.value))}
                    />
                    <p className="text-sm text-gray-500 mt-1">Taxa aplicada a novos lojistas</p>
                  </div>
                  
                  <div>
                    <Label htmlFor="min-commission">Taxa Mínima (%)</Label>
                    <Input
                      id="min-commission"
                      type="number"
                      min="0"
                      max="100"
                      value={settings.minimumCommissionRate}
                      onChange={(e) => handleSettingChange('minimumCommissionRate', parseFloat(e.target.value))}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="max-commission">Taxa Máxima (%)</Label>
                    <Input
                      id="max-commission"
                      type="number"
                      min="0"
                      max="100"
                      value={settings.maximumCommissionRate}
                      onChange={(e) => handleSettingChange('maximumCommissionRate', parseFloat(e.target.value))}
                    />
                  </div>
                </div>

                <Alert>
                  <DollarSign className="h-4 w-4" />
                  <AlertDescription>
                    As taxas de comissão podem ser personalizadas individualmente para cada lojista.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notification Settings */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Configurações de Notificação
                </CardTitle>
                <CardDescription>
                  Configure como as notificações são enviadas
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Notificações por Email</Label>
                      <p className="text-sm text-gray-500">Enviar notificações importantes por email</p>
                    </div>
                    <Switch
                      checked={settings.emailNotifications}
                      onCheckedChange={(value) => handleSettingChange('emailNotifications', value)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Notificações por SMS</Label>
                      <p className="text-sm text-gray-500">Enviar notificações críticas por SMS</p>
                    </div>
                    <Switch
                      checked={settings.smsNotifications}
                      onCheckedChange={(value) => handleSettingChange('smsNotifications', value)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Notificações Push</Label>
                      <p className="text-sm text-gray-500">Enviar notificações push no navegador</p>
                    </div>
                    <Switch
                      checked={settings.pushNotifications}
                      onCheckedChange={(value) => handleSettingChange('pushNotifications', value)}
                    />
                  </div>
                </div>

                {settings.emailNotifications && (
                  <div className="border-t pt-6">
                    <h4 className="font-medium mb-4 flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Configurações SMTP
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="smtp-host">Host SMTP</Label>
                        <Input
                          id="smtp-host"
                          value={settings.smtpHost}
                          onChange={(e) => handleSettingChange('smtpHost', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="smtp-port">Porta SMTP</Label>
                        <Input
                          id="smtp-port"
                          value={settings.smtpPort}
                          onChange={(e) => handleSettingChange('smtpPort', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="smtp-username">Usuário SMTP</Label>
                        <Input
                          id="smtp-username"
                          value={settings.smtpUsername}
                          onChange={(e) => handleSettingChange('smtpUsername', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="smtp-password">Senha SMTP</Label>
                        <Input
                          id="smtp-password"
                          type="password"
                          value={settings.smtpPassword}
                          onChange={(e) => handleSettingChange('smtpPassword', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Settings */}
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Configurações de Segurança
                </CardTitle>
                <CardDescription>
                  Configure políticas de segurança e autenticação
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="max-login-attempts">Máximo de Tentativas de Login</Label>
                    <Input
                      id="max-login-attempts"
                      type="number"
                      min="1"
                      max="10"
                      value={settings.maxLoginAttempts}
                      onChange={(e) => handleSettingChange('maxLoginAttempts', parseInt(e.target.value))}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="session-timeout">Timeout da Sessão (minutos)</Label>
                    <Input
                      id="session-timeout"
                      type="number"
                      min="5"
                      max="480"
                      value={settings.sessionTimeout}
                      onChange={(e) => handleSettingChange('sessionTimeout', parseInt(e.target.value))}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Verificação de Email Obrigatória</Label>
                      <p className="text-sm text-gray-500">Novos usuários devem verificar seu email</p>
                    </div>
                    <Switch
                      checked={settings.requireEmailVerification}
                      onCheckedChange={(value) => handleSettingChange('requireEmailVerification', value)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Verificação de Telefone Obrigatória</Label>
                      <p className="text-sm text-gray-500">Novos usuários devem verificar seu telefone</p>
                    </div>
                    <Switch
                      checked={settings.requirePhoneVerification}
                      onCheckedChange={(value) => handleSettingChange('requirePhoneVerification', value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Approval Settings */}
          <TabsContent value="approval">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Configurações de Aprovação
                </CardTitle>
                <CardDescription>
                  Configure o processo de aprovação de novos lojistas
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Aprovação Automática de Informações Básicas</Label>
                      <p className="text-sm text-gray-500">Aprovar automaticamente dados básicos da loja</p>
                    </div>
                    <Switch
                      checked={settings.autoApproveBasicInfo}
                      onCheckedChange={(value) => handleSettingChange('autoApproveBasicInfo', value)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Upload de Documentos Obrigatório</Label>
                      <p className="text-sm text-gray-500">Exigir upload de documentos para aprovação</p>
                    </div>
                    <Switch
                      checked={settings.requireDocumentUpload}
                      onCheckedChange={(value) => handleSettingChange('requireDocumentUpload', value)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Revisão Manual Obrigatória</Label>
                      <p className="text-sm text-gray-500">Todas as solicitações passam por revisão manual</p>
                    </div>
                    <Switch
                      checked={settings.manualReviewRequired}
                      onCheckedChange={(value) => handleSettingChange('manualReviewRequired', value)}
                    />
                  </div>
                </div>

                {!settings.manualReviewRequired && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Sem revisão manual obrigatória, lojistas podem ser aprovados automaticamente.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Save Button */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-end">
              <Button onClick={handleSave} disabled={isLoading}>
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? 'Salvando...' : 'Salvar Configurações'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}