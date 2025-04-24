
import { useBasicAuth } from './auth/useBasicAuth';
import { useSocialAuth } from './auth/useSocialAuth';
import { usePasswordManagement } from './auth/usePasswordManagement';
import { useSignUp } from './auth/useSignUp';

export const useAuthActions = () => {
  const { login, logout } = useBasicAuth();
  const { loginWithGoogle } = useSocialAuth();
  const { forgotPassword, resetPassword } = usePasswordManagement();
  const { signUp } = useSignUp();

  return {
    login,
    loginWithGoogle,
    logout,
    signUp,
    forgotPassword,
    resetPassword
  };
};
