export interface UserDTO{
    id?: string;
    name: string;
    email: string;
    supabaseId: string;
    hasMFA: boolean;

    factorId?: string;
    isMfaValidated?: boolean;
    isFirstMfaAccess?: boolean;

}