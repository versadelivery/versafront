import { StaticImageData } from "next/image";

interface RegisterFormData {
  storeName: string;
  storePhone: string;
  userName: string;
  userEmail: string;
  userPassword: string;
  confirmPassword: string;
}

export interface RegisterFormProps {
  step: number;
  formData: RegisterFormData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handlePhoneChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
  nextStep: () => void;
  isLoading: boolean;
  onSubmit: (e: React.FormEvent) => void;
  errors: Partial<RegisterFormData>;
  touched: Record<string, boolean>;
}

export interface AuthBreadcrumbProps {
  currentStep: number;
  setStep: (step: number) => void;
  isStepValid: boolean;
}

export interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  imageSrc: string | StaticImageData;
  imagePosition?: "left" | "right";
}

export interface AuthFormFooterProps {
  isLogin?: boolean;
}

export interface AuthButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
  withArrow?: boolean;
  isLoading?: boolean;
}

export interface AuthFormInputProps {
  type: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  label: string;
  required?: boolean;
  showPasswordToggle?: boolean;
  error?: string;
}

export interface LoginFormProps {
  formData: LoginFormData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  isLoading: boolean;
  onSubmit: (e: React.FormEvent) => void;
  errors?: Partial<LoginFormData>;
  touched?: Record<string, boolean>;
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterData {
  shop: {
    name: string;
    cellphone: string;
  };
  shop_user: {
    name: string;
    email: string;
    password: string;
  };
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterStep1Props {
  formData: Pick<RegisterFormData, 'storeName' | 'storePhone'>;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handlePhoneChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
  nextStep: () => void;
  errors: Partial<Pick<RegisterFormData, 'storeName' | 'storePhone'>>;
  touched: Record<string, boolean>;
}

export interface RegisterStep2Props {
  formData: Pick<RegisterFormData, 'userName' | 'userEmail' | 'userPassword' | 'confirmPassword'>;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
  isLoading: boolean;
  errors: Partial<Pick<RegisterFormData, 'userName' | 'userEmail' | 'userPassword' | 'confirmPassword'>>;
  touched: Record<string, boolean>;
}

export interface RegisterFormProps {
  step: number;
  formData: RegisterFormData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  nextStep: () => void;
  isLoading: boolean;
  onSubmit: (e: React.FormEvent) => void;
  errors: Partial<RegisterFormData>;
}