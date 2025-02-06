export const modalInitializer = (): ModalDto => {
  return ({
    show: false,
    message: '',
    isError: false,
    isSuccess: false,
    close: () => {},
    confirm: () => {}
  })
}

export interface ModalDto {
  show: boolean;
  message: string;
  isError: boolean;
  isSuccess: boolean;
  close: () => void;
  confirm?: () => void;
}
