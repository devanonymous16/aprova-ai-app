
import { ShieldX } from "lucide-react";

interface UnauthorizedHeaderProps {
  profile: any;
}

export default function UnauthorizedHeader({ profile }: UnauthorizedHeaderProps) {
  return (
    <>
      <div className="bg-red-50 p-4 rounded-full mb-6">
        <ShieldX className="h-16 w-16 text-red-600" />
      </div>
      <h1 className="text-3xl font-extrabold text-gray-900 font-heading mb-2">
        Acesso não autorizado
      </h1>
      <p className="text-center text-lg text-gray-600 mb-8 max-w-md">
        Você não tem permissão para acessar esta página. 
        {profile ? ` Seu perfil atual é: ${profile.role}.` : ' Seu perfil não foi carregado corretamente.'}
      </p>
    </>
  );
}
