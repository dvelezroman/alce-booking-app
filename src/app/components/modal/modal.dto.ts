export const modalInitializer = (): ModalDto => {
  return ({
    show: false,
    message: '',
    isError: false,
    isSuccess: false,
    isInfo: false,
    isContentViewer: false, 
    title: '',
    close: () => {},
    confirm: () => {}
  })
}

export interface ModalDto {
  show: boolean;
  message: string;
  isError: boolean;
  isSuccess: boolean;
  isInfo: boolean;
  isContentViewer?: boolean;
  title?: string;
  showButtons?: boolean;
  close: () => void;
  confirm?: () => void;
}
