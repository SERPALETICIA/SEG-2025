export interface UserDTO{
    id?: string;
    name: string;
    email: string;
    supabaseId: string;
    hasMFA: boolean;

    factorId?: string;
    isMFAValidated?: boolean;
    isFirstmfaaCCESS?: boolean;

}