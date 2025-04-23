
import { UserRole } from "@/types/user";

interface UnauthorizedDebugInfoProps {
  user: any;
  profile: any;
  hasRole: (role: UserRole | UserRole[]) => boolean;
  supabaseInfo: any;
}

export default function UnauthorizedDebugInfo({ user, profile, hasRole, supabaseInfo }: UnauthorizedDebugInfoProps) {
  return (
    <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200 text-left text-sm max-w-xl mx-auto">
      <h3 className="font-semibold mb-2">Informações de depuração:</h3>
      <div className="space-y-2">
        <p><span className="font-medium">Autenticado:</span> {user ? 'Sim' : 'Não'}</p>
        <p><span className="font-medium">E-mail:</span> {user?.email || 'N/A'}</p>
        <p><span className="font-medium">ID de usuário:</span> {user?.id || 'N/A'}</p>
        <p><span className="font-medium">Perfil carregado:</span> {profile ? 'Sim' : 'Não'}</p>
        {profile && (
          <>
            <p><span className="font-medium">Nome:</span> {profile.name}</p>
            <p><span className="font-medium">Role:</span> {profile.role}</p>
            <p><span className="font-medium">Admin:</span> {hasRole('admin') ? 'Sim' : 'Não'}</p>
          </>
        )}
        <div className="mt-3 pt-3 border-t border-gray-200">
          <p className="font-medium mb-1">Status do Supabase:</p>
          {supabaseInfo ? (
            <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
              {JSON.stringify(supabaseInfo, null, 2)}
            </pre>
          ) : (
            <p>Verificando conexão...</p>
          )}
        </div>
      </div>
    </div>
  );
}
