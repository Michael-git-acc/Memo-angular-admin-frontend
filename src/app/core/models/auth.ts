export interface LoginResponse {
  accessToken: string;
  expiresIn: number; // secondes
  utilisateur: { id: string; email: string; nom: string; ecoleId: string };
}
