export type SignInActionData = {
  error?: string;
  fieldErrors?: {
    email?: string[];
    password?: string[];
  };
};
