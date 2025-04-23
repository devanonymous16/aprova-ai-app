
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, User, Edit2, Clock, CreditCard } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function StudentProfile() {
  const { profile, user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  
  const [formData, setFormData] = useState({
    name: profile?.name || "",
    email: user?.email || "",
    phone: "(11) 98765-4321",
    birthDate: "1990-01-01",
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Save profile changes here
    setIsEditing(false);
  };
  
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link to="/student/dashboard">
        <Button variant="ghost" size="sm" className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Dashboard
        </Button>
      </Link>
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-heading mb-2">Meu Perfil</h1>
        <p className="text-muted-foreground">
          Gerencie suas informações pessoais e configurações da conta
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Informações Pessoais</CardTitle>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? "Cancelar" : (
                  <>
                    <Edit2 className="h-4 w-4 mr-2" /> Editar
                  </>
                )}
              </Button>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Nome</Label>
                    <Input 
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      disabled={!isEditing}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      disabled
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Seu email não pode ser alterado
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phone">Telefone</Label>
                      <Input 
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        disabled={!isEditing}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="birthDate">Data de Nascimento</Label>
                      <Input 
                        id="birthDate"
                        name="birthDate"
                        type="date"
                        value={formData.birthDate}
                        onChange={handleChange}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>
                  
                  {isEditing && (
                    <div className="flex justify-end">
                      <Button type="submit">Salvar alterações</Button>
                    </div>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>
          
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Assinaturas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { plan: "Premium", exam: "TJ-SP", startDate: "15/06/2023", endDate: "15/06/2024", price: "R$ 129,90" },
                  { plan: "Básico", exam: "TRF-3", startDate: "01/07/2023", endDate: "01/10/2023", price: "R$ 79,90" },
                ].map((subscription, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex flex-col md:flex-row justify-between mb-3">
                      <div>
                        <h3 className="font-medium">{subscription.plan} - {subscription.exam}</h3>
                        <p className="text-sm text-muted-foreground">
                          <Clock className="h-4 w-4 inline mr-1" />
                          {subscription.startDate} a {subscription.endDate}
                        </p>
                      </div>
                      <div className="text-right mt-2 md:mt-0">
                        <p className="font-bold">{subscription.price}</p>
                        <p className="text-xs text-muted-foreground">Mensalidade</p>
                      </div>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" size="sm">Gerenciar</Button>
                      <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                        Cancelar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Sua Conta</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center mb-4">
                <div className="h-20 w-20 bg-primary-100 rounded-full flex items-center justify-center mb-3">
                  <User className="h-10 w-10 text-primary-800" />
                </div>
                <h3 className="font-medium">{profile?.name || "Usuário"}</h3>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
                <div className="bg-primary-50 text-primary-800 text-xs px-3 py-1 rounded-full mt-1">
                  Estudante
                </div>
              </div>
              
              <div className="space-y-2">
                <Link to="/change-password" className="block">
                  <Button variant="outline" size="sm" className="w-full">
                    Alterar senha
                  </Button>
                </Link>
                <Button variant="ghost" size="sm" className="w-full text-red-600 hover:text-red-700 hover:bg-red-50">
                  Excluir conta
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Métodos de Pagamento</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <CreditCard className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">•••• •••• •••• 4289</p>
                    <p className="text-xs text-muted-foreground">Mastercard - Expira em 05/25</p>
                  </div>
                </div>
                
                <Button variant="outline" size="sm" className="w-full">
                  Adicionar novo método
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
